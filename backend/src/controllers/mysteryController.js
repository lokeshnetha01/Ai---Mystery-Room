import mongoose from 'mongoose';
import { Mystery } from '../models/Mystery.js';
import { Evidence } from '../models/Evidence.js';
import { requestSchema } from '../validators/mysterySchema.js';
import { generateMystery } from '../services/mysteryGenerator.js';
import { generateAndStoreEvidenceMedia, isMediaConfigured } from '../services/mediaProviders.js';

const success = (message, data) => ({ success: true, message, data });

export function publicMedia(mediaUrl, mediaMimeType, mediaSizeBytes, mediaStatus) {
  let url = null;
  try {
    const parsed = new URL(mediaUrl);
    if (parsed.protocol === 'https:' && parsed.hostname === 'res.cloudinary.com') url = parsed.toString();
  } catch { /* Invalid or missing URLs stay unavailable in public responses. */ }
  return { url, mimeType: url ? mediaMimeType : null, sizeBytes: url ? mediaSizeBytes : null, status: url && mediaStatus === 'available' ? 'available' : ['not_required', 'pending', 'processing'].includes(mediaStatus) ? mediaStatus : 'unavailable' };
}

export function publicSuspect(suspect) {
  const { profileImagePrompt, profileImageUrl, profileImageMimeType, profileImageSizeBytes, profileImageStatus, ...publicFields } = suspect;
  return { ...publicFields, profileImage: publicMedia(profileImageUrl, profileImageMimeType, profileImageSizeBytes, profileImageStatus) };
}

function sendError(res, status, message, code, details) {
  return res.status(status).json({ success: false, message, error: { code, ...(details ? { details } : {}) } });
}

async function setGenerationState(id, status, stage, errorCode) {
  const generationStatus = { status, stage, updatedAt: new Date() };
  if (errorCode) generationStatus.errorCode = errorCode;
  await Mystery.updateOne({ _id: id }, { $set: { generationStatus } });
}

async function processGeneration(mysteryId, input) {
  try {
    await setGenerationState(mysteryId, 'processing', 'generating_structured_case');
    const generated = await generateMystery(input);
    await setGenerationState(mysteryId, 'processing', 'validating_and_persisting');

    const evidenceDocs = generated.evidence.map((item) => ({
      mysteryId,
      evidenceId: item.id,
      type: item.type,
      title: item.title,
      description: item.description,
      timestamp: new Date(item.timestamp),
      content: item.content,
      mediaPrompt: item.mediaPrompt,
      mediaStatus: ['image', 'video'].includes(item.type) ? (isMediaConfigured(item.type) ? 'pending' : 'unavailable') : 'not_required',
      relatedSuspectIds: item.relatedSuspectIds,
      reveals: item.reveals
    }));

    await Evidence.deleteMany({ mysteryId });
    await Evidence.insertMany(evidenceDocs, { ordered: true });
    await Mystery.updateOne({ _id: mysteryId }, {
      $set: {
        title: generated.case.title,
        category: generated.case.category,
        difficulty: generated.case.difficulty,
        description: generated.case.description,
        location: generated.case.location,
        incidentDate: new Date(generated.case.incidentDate),
        victim: generated.victim,
        suspects: generated.suspects.map((suspect) => ({ ...suspect, profileImageUrl: null, profileImageMimeType: null, profileImageSizeBytes: null, profileImageStatus: isMediaConfigured('image') ? 'pending' : 'unavailable' })),
        timeline: generated.timeline.map((event) => ({ ...event, timestamp: new Date(event.timestamp) })),
        solution: generated.solution,
        generationStatus: { status: 'completed', stage: 'ready', updatedAt: new Date() }
      }
    });
    for (const item of generated.evidence.filter(({ type }) => ['image', 'video'].includes(type))) {
      void generateAndStoreEvidenceMedia({
        type: item.type,
        prompt: item.mediaPrompt,
        mysteryId: String(mysteryId),
        evidenceId: item.id,
        onStatus: (status) => Evidence.updateOne({ mysteryId, evidenceId: item.id }, { $set: { mediaStatus: status } })
      }).then(async (asset) => {
        if (!asset) {
          await Evidence.updateOne({ mysteryId, evidenceId: item.id }, { $set: { mediaStatus: 'unavailable' } });
          return;
        }
        await Evidence.updateOne({ mysteryId, evidenceId: item.id }, { $set: { mediaUrl: asset.url, mediaMimeType: asset.mimeType, mediaSizeBytes: asset.sizeBytes, mediaStatus: 'available' } });
      }).catch(async (error) => {
        await Evidence.updateOne({ mysteryId, evidenceId: item.id }, { $set: { mediaStatus: 'unavailable' } }).catch(() => {});
        console.warn(`Evidence media unavailable for ${mysteryId}/${item.id}`, JSON.stringify({ type: item.type, code: error.code || 'MEDIA_GENERATION_FAILED' }));
      });
    }
    for (const suspect of generated.suspects) {
      void generateAndStoreEvidenceMedia({ type: 'image', prompt: suspect.profileImagePrompt, mysteryId: String(mysteryId), evidenceId: suspect.id })
        .then(async (asset) => {
          const update = asset
            ? { 'suspects.$.profileImageUrl': asset.url, 'suspects.$.profileImageMimeType': asset.mimeType, 'suspects.$.profileImageSizeBytes': asset.sizeBytes, 'suspects.$.profileImageStatus': 'available' }
            : { 'suspects.$.profileImageStatus': 'unavailable' };
          await Mystery.updateOne({ _id: mysteryId, 'suspects.id': suspect.id }, { $set: update });
        })
        .catch(async (error) => {
          await Mystery.updateOne({ _id: mysteryId, 'suspects.id': suspect.id }, { $set: { 'suspects.$.profileImageStatus': 'unavailable' } }).catch(() => {});
          console.warn(`Suspect image unavailable for ${mysteryId}/${suspect.id}`, JSON.stringify({ code: error.code || 'MEDIA_GENERATION_FAILED' }));
        });
    }
  } catch (error) {
    await Evidence.deleteMany({ mysteryId }).catch(() => {});
    await setGenerationState(mysteryId, 'failed', 'failed', error.code || 'GENERATION_FAILED').catch(() => {});
    const upstreamText = String(error.cause?.message || '');
    const upstreamMessage = (process.env.GEMINI_API_KEY ? upstreamText.replaceAll(process.env.GEMINI_API_KEY, '[redacted]') : upstreamText).slice(0, 400);
    console.error(`Mystery generation failed for ${mysteryId}`, JSON.stringify({
  code: error.code || 'GENERATION_FAILED',
  validationIssues: error.issues || undefined,
  upstreamStatus: error.cause?.status || undefined,
  upstreamError: error.cause?.name || undefined,
  upstreamMessage
}));
  }
}

export function validateCreateMystery(req, res, next) {
  const parsed = requestSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, 'Please check the mystery details', 'VALIDATION_ERROR', parsed.error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message })));
  const key = req.get('Idempotency-Key');
  if (key && (key.length > 100 || key.length < 8)) return sendError(res, 400, 'Invalid idempotency key', 'VALIDATION_ERROR');
  req.validatedMysteryInput = parsed.data;
  req.idempotencyKey = key;
  next();
}

export async function createMystery(req, res, next) {
  const input = req.validatedMysteryInput;
  const key = req.idempotencyKey;
  try {
    if (key) {
      const existing = await Mystery.findOne({ sessionId: req.investigationSessionId, idempotencyKey: key });
      if (existing) return res.status(202).json(success('Mystery generation already accepted', { mysteryId: existing.id, status: existing.generationStatus.status }));
    }
    let mystery;
    try {
      mystery = await Mystery.create({
        title: input.title || 'New investigation',
        originalScenario: input.scenario,
        category: input.category,
        difficulty: input.difficulty,
        sessionId: req.investigationSessionId,
        idempotencyKey: key || undefined,
        generationRequest: input,
        solution: null,
        generationStatus: { status: 'pending', stage: 'queued', updatedAt: new Date() }
      });
    } catch (error) {
      if (error.code === 11000 && key) {
        const existing = await Mystery.findOne({ sessionId: req.investigationSessionId, idempotencyKey: key });
        if (existing) return res.status(202).json(success('Mystery generation already accepted', { mysteryId: existing.id, status: existing.generationStatus.status }));
      }
      throw error;
    }
    setImmediate(() => { void processGeneration(mystery._id, input); });
    return res.status(202).json(success('Mystery generation accepted', { mysteryId: mystery.id, status: 'pending' }));
  } catch (error) {
    next(error);
  }
}

export async function getGenerationStatus(req, res, next) {
  try {
    const mystery = await findOwnedMystery(req.params.id, req.investigationSessionId);
    if (!mystery) return sendError(res, 404, 'Mystery not found', 'NOT_FOUND');
    const status = mystery.generationStatus;
    return res.json(success('Generation status retrieved', {
      mysteryId: mystery.id,
      status: status.status,
      stage: status.stage,
      updatedAt: status.updatedAt,
      ...(status.status === 'failed'  ? { errorCode: status.errorCode || 'GENERATION_FAILED' } : {})
    }));
  } catch (error) {
    next(error);
  }
}

export async function retryMysteryGeneration(req, res, next) {
  try {
    const mystery = await findOwnedMystery(req.params.id, req.investigationSessionId);
    if (!mystery) return sendError(res, 404, 'Mystery not found', 'NOT_FOUND');
    if (mystery.generationStatus.status !== 'failed') return sendError(res, 409, 'Only a failed generation can be retried', 'GENERATION_NOT_FAILED');
    const retryable = await Mystery.findById(mystery._id).select('+generationRequest');
    if (!retryable?.generationRequest) return sendError(res, 409, 'This generation cannot be retried', 'GENERATION_NOT_RETRYABLE');
    await Evidence.deleteMany({ mysteryId: mystery._id });
    await setGenerationState(mystery._id, 'pending', 'queued');
    setImmediate(() => { void processGeneration(mystery._id, retryable.generationRequest); });
    return res.status(202).json(success('Mystery generation retry accepted', { mysteryId: mystery.id, status: 'pending' }));
  } catch (error) { next(error); }
}

export async function getMystery(req, res, next) {
  try {
    const mystery = await findOwnedMystery(req.params.id, req.investigationSessionId);
    if (!mystery) return sendError(res, 404, 'Mystery not found', 'NOT_FOUND');
    if (mystery.generationStatus.status !== 'completed') {
      return sendError(res, 409, 'This investigation is not ready yet', 'GENERATION_INCOMPLETE');
    }
    const evidence = await Evidence.find({ mysteryId: mystery._id }).sort({ timestamp: 1 }).lean();
    const publicEvidence = evidence.map(({ _id, mysteryId, evidenceId, type, title, description, timestamp, content, mediaUrl, mediaMimeType, mediaSizeBytes, mediaStatus, relatedSuspectIds, createdAt }) => ({
      id: evidenceId,
      type,
      title,
      description,
      timestamp,
      content,
      media: publicMedia(mediaUrl, mediaMimeType, mediaSizeBytes, mediaStatus),
      relatedSuspectIds,
      createdAt
    }));
    return res.json(success('Mystery retrieved', {
      id: mystery.id,
      title: mystery.title,
      originalScenario: mystery.originalScenario,
      category: mystery.category,
      difficulty: mystery.difficulty,
      description: mystery.description,
      status: 'investigating',
      location: mystery.location,
      incidentDate: mystery.incidentDate,
      victim: mystery.victim,
      suspects: mystery.suspects.map(publicSuspect),
      evidence: publicEvidence,
      timeline: mystery.timeline,
      generationStatus: mystery.generationStatus,
      createdAt: mystery.createdAt
    }));
  } catch (error) {
    next(error);
  }
}

export async function getSuspects(req, res, next) {
  try {
    const mystery = await findOwnedMystery(req.params.id, req.investigationSessionId);
    if (!mystery) return sendError(res, 404, 'Mystery not found', 'NOT_FOUND');
    if (mystery.generationStatus.status !== 'completed') return sendError(res, 409, 'Suspects are not ready yet', 'GENERATION_INCOMPLETE');
    return res.json(success('Suspects retrieved', mystery.suspects.map(publicSuspect)));
  } catch (error) { next(error); }
}

export async function getEvidence(req, res, next) {
  try {
    const mystery = await findOwnedMystery(req.params.id, req.investigationSessionId);
    if (!mystery) return sendError(res, 404, 'Mystery not found', 'NOT_FOUND');
    if (mystery.generationStatus.status !== 'completed') return sendError(res, 409, 'Evidence is not ready yet', 'GENERATION_INCOMPLETE');
    const evidence = await Evidence.find({ mysteryId: mystery._id }).sort({ timestamp: 1 }).lean();
    const publicEvidence = evidence.map(({ evidenceId, type, title, description, timestamp, content, mediaUrl, mediaMimeType, mediaSizeBytes, mediaStatus, relatedSuspectIds, createdAt }) => ({
      id: evidenceId, type, title, description, timestamp, content,
      media: publicMedia(mediaUrl, mediaMimeType, mediaSizeBytes, mediaStatus),
      relatedSuspectIds, createdAt
    }));
    return res.json(success('Evidence retrieved', publicEvidence));
  } catch (error) { next(error); }
}

export async function getEvidenceItem(req, res, next) {
  try {
    const mystery = await findOwnedMystery(req.params.id, req.investigationSessionId);
    if (!mystery) return sendError(res, 404, 'Mystery not found', 'NOT_FOUND');
    const item = await Evidence.findOne({ mysteryId: mystery._id, evidenceId: req.params.evidenceId }).lean();
    if (!item) return sendError(res, 404, 'Evidence not found', 'NOT_FOUND');
    const { evidenceId, type, title, description, timestamp, content, mediaUrl, mediaMimeType, mediaSizeBytes, mediaStatus, relatedSuspectIds, createdAt } = item;
    return res.json(success('Evidence retrieved', { id: evidenceId, type, title, description, timestamp, content, media: publicMedia(mediaUrl, mediaMimeType, mediaSizeBytes, mediaStatus), relatedSuspectIds, createdAt }));
  } catch (error) { next(error); }
}

export async function findOwnedMystery(id, sessionId) {
  if (!mongoose.isValidObjectId(id)) return null;

  return Mystery.findOne({ _id: id, sessionId })
    .select('+generationStatus.errorCode');
}

export function readOnlyObject(_req, res) {
  return sendError(res, 405, 'This endpoint is read-only', 'METHOD_NOT_ALLOWED');
}
