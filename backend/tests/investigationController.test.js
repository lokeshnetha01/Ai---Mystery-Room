import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/controllers/mysteryController.js', () => ({ findOwnedMystery: vi.fn(), publicSuspect: vi.fn(({ profileImagePrompt, ...suspect }) => suspect) }));
vi.mock('../src/models/Accusation.js', () => ({ Accusation: { create: vi.fn(), findOne: vi.fn() } }));
vi.mock('../src/models/InvestigationNote.js', () => ({ InvestigationNote: { create: vi.fn(), find: vi.fn(), findOneAndUpdate: vi.fn(), findOneAndDelete: vi.fn() } }));
vi.mock('../src/models/Mystery.js', () => ({ Mystery: { findOne: vi.fn() } }));
vi.mock('../src/models/Evidence.js', () => ({ Evidence: { find: vi.fn() } }));

import { findOwnedMystery } from '../src/controllers/mysteryController.js';
import { createNote, getInvestigationResult, listNotes, submitAccusation, updateNote } from '../src/controllers/investigationController.js';
import { Accusation } from '../src/models/Accusation.js';
import { InvestigationNote } from '../src/models/InvestigationNote.js';
import { Mystery } from '../src/models/Mystery.js';
import { Evidence } from '../src/models/Evidence.js';

function response() {
  return { statusCode: 200, body: null, status(code) { this.statusCode = code; return this; }, json(value) { this.body = value; return this; } };
}
const req = (extra = {}) => ({ params: { id: '507f1f77bcf86cd799439011', noteId: '507f1f77bcf86cd799439012' }, investigationSessionId: 'session-a', body: {}, ...extra });
const readyMystery = { _id: '507f1f77bcf86cd799439011', id: '507f1f77bcf86cd799439011', generationStatus: { status: 'completed' }, suspects: [{ id: 'S1' }, { id: 'S2' }] };

beforeEach(() => { vi.clearAllMocks(); findOwnedMystery.mockResolvedValue(readyMystery); });

describe('investigation workflow controller', () => {
  it('lists notes scoped to the signed-in guest session', async () => {
    InvestigationNote.find.mockReturnValue({ sort: () => ({ lean: async () => [{ _id: 'note-a', content: 'Check the clock' }] }) });
    const res = response();
    await listNotes(req(), res, vi.fn());
    expect(InvestigationNote.find).toHaveBeenCalledWith({ mysteryId: readyMystery.id, sessionId: 'session-a' });
    expect(res.body.data[0]).toMatchObject({ id: 'note-a', content: 'Check the clock' });
  });

  it('creates a validated session-owned note', async () => {
    InvestigationNote.create.mockResolvedValue({ _id: 'note-a', content: 'Check the clock', createdAt: new Date(), updatedAt: new Date() });
    const res = response();
    await createNote(req({ body: { content: 'Check the clock' } }), res, vi.fn());
    expect(InvestigationNote.create).toHaveBeenCalledWith(expect.objectContaining({ sessionId: 'session-a', content: 'Check the clock' }));
    expect(res.statusCode).toBe(201);
  });

  it('does not update a note unless it belongs to the current session', async () => {
    InvestigationNote.findOneAndUpdate.mockResolvedValue(null);
    const res = response();
    await updateNote(req({ body: { content: 'Changed' } }), res, vi.fn());
    expect(InvestigationNote.findOneAndUpdate).toHaveBeenCalledWith(expect.objectContaining({ sessionId: 'session-a' }), expect.any(Object), expect.any(Object));
    expect(res.statusCode).toBe(404);
  });

  it('does not reveal a solution before an accusation exists', async () => {
    Accusation.findOne.mockReturnValue({ lean: async () => null });
    const res = response();
    await getInvestigationResult(req(), res, vi.fn());
    expect(res.statusCode).toBe(404);
    expect(res.body.data).toBeUndefined();
    expect(Mystery.findOne).not.toHaveBeenCalled();
  });

  it('reveals the stored solution only after an accusation and strips private prompts', async () => {
    Accusation.findOne.mockReturnValue({ lean: async () => ({ selectedSuspectId: 'S2', isCorrect: false, submittedAt: new Date() }) });
    Mystery.findOne.mockReturnValue({ select: () => ({ lean: async () => ({
      suspects: [{ id: 'S1', name: 'Alex', profileImagePrompt: 'hidden prompt' }, { id: 'S2', name: 'Blair', profileImagePrompt: 'hidden prompt' }],
      solution: { culpritId: 'S1', motive: 'Debt', explanation: 'A clock discrepancy exposed the false alibi.', evidenceIds: ['E1'] },
      timeline: []
    }) }) });
    Evidence.find.mockReturnValue({ select: () => ({ lean: async () => [{ evidenceId: 'E1', title: 'Clock log', description: 'A fictional record.', reveals: 'It contradicts the alibi.' }] }) });
    const res = response();
    await getInvestigationResult(req(), res, vi.fn());
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toMatchObject({ isCorrect: false, culprit: { id: 'S1', name: 'Alex' }, evidence: [{ id: 'E1', interpretation: 'It contradicts the alibi.' }] });
    expect(res.body.data.culprit).not.toHaveProperty('profileImagePrompt');
  });

  it('records only a valid suspect accusation and returns no culprit data', async () => {
    Mystery.findOne.mockReturnValue({ select: async () => ({ solution: { culpritId: 'S1' } }) });
    Accusation.create.mockResolvedValue({ _id: 'accusation-a', submittedAt: new Date() });
    const res = response();
    await submitAccusation(req({ body: { selectedSuspectId: 'S1' } }), res, vi.fn());
    expect(Accusation.create).toHaveBeenCalledWith(expect.objectContaining({ selectedSuspectId: 'S1', isCorrect: true, sessionId: 'session-a' }));
    expect(res.body.data).not.toHaveProperty('culprit');
  });

  it('rejects a second accusation with a conflict response', async () => {
    Mystery.findOne.mockReturnValue({ select: async () => ({ solution: { culpritId: 'S1' } }) });
    Accusation.create.mockRejectedValue({ code: 11000 });
    const res = response();
    await submitAccusation(req({ body: { selectedSuspectId: 'S2' } }), res, vi.fn());
    expect(res.statusCode).toBe(409);
    expect(res.body.error.code).toBe('DUPLICATE_ACCUSATION');
  });
});
