import mongoose from 'mongoose';
import { z } from 'zod';
import { Accusation } from '../models/Accusation.js';
import { Evidence } from '../models/Evidence.js';
import { InvestigationNote } from '../models/InvestigationNote.js';
import { Mystery } from '../models/Mystery.js';
import { findOwnedMystery, publicSuspect } from './mysteryController.js';

const noteBody = z.object({ content: z.string().trim().min(1).max(1000) }).strict();
const accusationBody = z.object({ selectedSuspectId: z.string().regex(/^S[1-9]\d*$/) }).strict();
const success = (message, data) => ({ success: true, message, data });

function fail(res, status, message, code) {
  return res.status(status).json({ success: false, message, error: { code } });
}

async function ownedReadyMystery(id, sessionId) {
  const mystery = await findOwnedMystery(id, sessionId);
  return mystery?.generationStatus.status === 'completed' ? mystery : null;
}

export async function listNotes(req, res, next) {
  try {
    if (!await ownedReadyMystery(req.params.id, req.investigationSessionId)) return fail(res, 404, 'Mystery not found', 'NOT_FOUND');
    const notes = await InvestigationNote.find({ mysteryId: req.params.id, sessionId: req.investigationSessionId }).sort({ createdAt: 1 }).lean();
    return res.json(success('Investigation notes retrieved', notes.map(({ _id, content, createdAt, updatedAt }) => ({ id: String(_id), content, createdAt, updatedAt }))));
  } catch (error) { return next(error); }
}

export async function createNote(req, res, next) {
  const parsed = noteBody.safeParse(req.body);
  if (!parsed.success) return fail(res, 400, 'Note must contain 1 to 1,000 characters', 'VALIDATION_ERROR');
  try {
    const mystery = await ownedReadyMystery(req.params.id, req.investigationSessionId);
    if (!mystery) return fail(res, 404, 'Mystery not found', 'NOT_FOUND');
    const note = await InvestigationNote.create({ mysteryId: mystery._id, sessionId: req.investigationSessionId, content: parsed.data.content });
    return res.status(201).json(success('Investigation note created', { id: String(note._id), content: note.content, createdAt: note.createdAt, updatedAt: note.updatedAt }));
  } catch (error) { return next(error); }
}

export async function updateNote(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.noteId)) return fail(res, 404, 'Note not found', 'NOT_FOUND');
  const parsed = noteBody.safeParse(req.body);
  if (!parsed.success) return fail(res, 400, 'Note must contain 1 to 1,000 characters', 'VALIDATION_ERROR');
  try {
    const note = await InvestigationNote.findOneAndUpdate({ _id: req.params.noteId, sessionId: req.investigationSessionId }, { $set: { content: parsed.data.content } }, { new: true, runValidators: true });
    if (!note) return fail(res, 404, 'Note not found', 'NOT_FOUND');
    return res.json(success('Investigation note updated', { id: String(note._id), content: note.content, createdAt: note.createdAt, updatedAt: note.updatedAt }));
  } catch (error) { return next(error); }
}

export async function deleteNote(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.noteId)) return fail(res, 404, 'Note not found', 'NOT_FOUND');
  try {
    const note = await InvestigationNote.findOneAndDelete({ _id: req.params.noteId, sessionId: req.investigationSessionId });
    if (!note) return fail(res, 404, 'Note not found', 'NOT_FOUND');
    return res.json(success('Investigation note deleted', { id: String(note._id) }));
  } catch (error) { return next(error); }
}

export async function submitAccusation(req, res, next) {
  const parsed = accusationBody.safeParse(req.body);
  if (!parsed.success) return fail(res, 400, 'Select a valid suspect', 'VALIDATION_ERROR');
  try {
    const mystery = await ownedReadyMystery(req.params.id, req.investigationSessionId);
    if (!mystery) return fail(res, 404, 'Mystery not found', 'NOT_FOUND');
    if (!mystery.suspects.some(({ id }) => id === parsed.data.selectedSuspectId)) return fail(res, 400, 'Selected person is not a suspect in this case', 'INVALID_SUSPECT');
    const privateMystery = await Mystery.findOne({ _id: mystery._id, sessionId: req.investigationSessionId }).select('+solution');
    if (!privateMystery?.solution?.culpritId) return fail(res, 409, 'The case solution is unavailable', 'SOLUTION_UNAVAILABLE');
    const isCorrect = privateMystery.solution.culpritId === parsed.data.selectedSuspectId;
    const accusation = await Accusation.create({ mysteryId: mystery._id, sessionId: req.investigationSessionId, selectedSuspectId: parsed.data.selectedSuspectId, isCorrect });
    return res.status(201).json(success('Final accusation recorded', { accusationId: String(accusation._id), isCorrect, submittedAt: accusation.submittedAt }));
  } catch (error) {
    if (error.code === 11000) return fail(res, 409, 'A final accusation has already been submitted', 'DUPLICATE_ACCUSATION');
    return next(error);
  }
}

export async function getInvestigationResult(req, res, next) {
  try {
    const mystery = await findOwnedMystery(req.params.id, req.investigationSessionId);
    if (!mystery) return fail(res, 404, 'Mystery not found', 'NOT_FOUND');
    if (mystery.generationStatus.status !== 'completed') return fail(res, 409, 'The case is not ready', 'GENERATION_INCOMPLETE');
    const accusation = await Accusation.findOne({ mysteryId: mystery._id, sessionId: req.investigationSessionId }).lean();
    if (!accusation) return fail(res, 404, 'Submit a final accusation to reveal the solution', 'RESULT_NOT_AVAILABLE');
    const privateMystery = await Mystery.findOne({ _id: mystery._id, sessionId: req.investigationSessionId }).select('+solution').lean();
    if (!privateMystery?.solution) return fail(res, 409, 'The case solution is unavailable', 'SOLUTION_UNAVAILABLE');
    const suspectById = new Map(privateMystery.suspects.map((suspect) => [suspect.id, suspect]));
    const evidence = await Evidence.find({ mysteryId: mystery._id, evidenceId: { $in: privateMystery.solution.evidenceIds } }).select('+reveals').lean();
    return res.json(success('Investigation result retrieved', {
      isCorrect: accusation.isCorrect,
      selectedSuspect: publicSuspect(suspectById.get(accusation.selectedSuspectId)),
      culprit: publicSuspect(suspectById.get(privateMystery.solution.culpritId)),
      motive: privateMystery.solution.motive,
      explanation: privateMystery.solution.explanation,
      evidence: evidence.map(({ evidenceId, title, description, reveals }) => ({ id: evidenceId, title, description, interpretation: reveals })),
      timeline: privateMystery.timeline,
      submittedAt: accusation.submittedAt
    }));
  } catch (error) { return next(error); }
}
