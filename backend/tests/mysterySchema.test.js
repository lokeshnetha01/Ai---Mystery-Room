import { describe, expect, it, vi } from 'vitest';
import { Mystery } from '../src/models/Mystery.js';
import { Evidence } from '../src/models/Evidence.js';
import { geminiCompatibleSchema } from '../src/services/geminiClient.js';
import { publicMedia, publicSuspect } from '../src/controllers/mysteryController.js';
import { isMediaConfigured } from '../src/services/mediaProviders.js';
import { buildMysteryPrompt, generateMystery } from '../src/services/mysteryGenerator.js';
import { mysteryGenerationJsonSchema, requestSchema, validateMysteryConsistency } from '../src/validators/mysterySchema.js';

const input = { title: 'The Closed Archive', scenario: 'A signal ledger disappeared from a locked railway archive during the final night of service.', category: 'Disappearance', difficulty: 'Medium', suspectCount: 3 };

function validMystery() {
  const at = '2026-10-14T21:30:00Z';
  return {
    case: { title: 'The Closed Archive', category: input.category, difficulty: input.difficulty, description: 'A ledger vanished from the station archive during the final night.', location: 'Bellweather Central', incidentDate: '2026-10-14T21:40:00Z' },
    victim: null,
    suspects: [1, 2, 3].map((n) => ({ id: `S${n}`, name: `Suspect ${n}`, age: 30 + n, occupation: 'Station worker', background: `A distinct background for person ${n}.`, motive: `A plausible motive for person ${n}.`, alibi: `A testable alibi for person ${n}.`, profileImagePrompt: `Fictional portrait of suspect ${n}, documentary photo.` })),
    evidence: [
      { id: 'E1', type: 'chat', title: 'Shift messages', description: 'A fictional chat from the shift.', timestamp: at, content: { participants: ['S1', 'S2'], messages: [{ sender: 'S1', recipient: 'S2', text: 'The clock is stopped.', timestamp: at }] }, mediaPrompt: null, relatedSuspectIds: ['S1', 'S2'], reveals: 'The message identifies an inconsistency in the stated alibi.' },
      { id: 'E2', type: 'image', title: 'Shelf outline', description: 'The outline of a removed ledger.', timestamp: at, content: { altText: 'A clean rectangle in dust on shelf C.' }, mediaPrompt: 'Fictional station archive shelf with a dust outline.', relatedSuspectIds: ['S1'], reveals: 'The fresh outline contradicts the suspect’s alibi.' },
      { id: 'E3', type: 'video', title: 'South corridor camera', description: 'A fictional CCTV camera record.', timestamp: at, content: { cameraId: 'BW-04', location: 'South corridor', durationSeconds: 35 }, mediaPrompt: 'Fictional CCTV view of an empty station corridor.', relatedSuspectIds: ['S3'], reveals: 'The corridor timing contradicts one account.' },
      { id: 'E4', type: 'document', title: 'Access register', description: 'A fictional archive access record.', timestamp: at, content: { body: 'The archive key was returned at 9:26 PM.' }, mediaPrompt: null, relatedSuspectIds: ['S1'], reveals: 'The return time conflicts with the timeline.' },
      { id: 'E5', type: 'witness_statement', title: 'Clerk statement', description: 'A fictional witness statement.', timestamp: at, content: { witnessName: 'Ticket clerk', statement: 'The platform clock was running late.' }, mediaPrompt: null, relatedSuspectIds: ['S2'], reveals: 'This confirms a clock discrepancy.' }
    ],
    timeline: [21, 30, 40].map((minute) => ({ timestamp: `2026-10-14T21:${minute}:00Z`, event: `Fictional event at ${minute} minutes.` })),
    solution: { culpritId: 'S1', motive: 'A hidden property dispute motivated the theft.', explanation: 'The access record contradicts the selected suspect’s stated alibi.', evidenceIds: ['E1', 'E2', 'E4'] }
  };
}

describe('mystery request and structured output validation', () => {
  it('adapts Zod JSON Schema to Gemini Interactions schema rules without losing property names', () => {
    const compatible = geminiCompatibleSchema({
      type: 'object',
      properties: {
        case: { type: 'string', minLength: 3, pattern: '^case$' },
        victim: { anyOf: [{ type: 'object', properties: { name: { type: 'string' } } }, { type: 'null' }] }
      },
      required: ['case'],
      additionalProperties: false,
      $schema: 'draft-07'
    });
    expect(compatible.properties.case).toEqual({ type: 'string' });
    expect(compatible.properties.victim.type).toEqual(['object', 'null']);
    expect(compatible.required).toEqual(['case']);
    expect(compatible.additionalProperties).toBeUndefined();
    expect(compatible.$schema).toBeUndefined();
  });

  it('requires the evidence content shape in the generation schema', () => {
    const content = mysteryGenerationJsonSchema.properties.evidence.items.properties.content;
    expect(content.required).toEqual(Object.keys(content.properties));
    expect(content.required).toContain('messages');
    expect(content.required).toContain('witnessName');
  });

  it('accepts valid creation input and rejects short scenarios', () => {
    expect(requestSchema.safeParse(input).success).toBe(true);
    expect(requestSchema.safeParse({ ...input, scenario: 'too short' }).success).toBe(false);
    expect(requestSchema.safeParse({ ...input, suspectCount: 7 }).success).toBe(false);
  });

  it('accepts a consistent generated case with one suspect culprit and connected evidence', () => {
    const result = validateMysteryConsistency(validMystery(), 3);
    expect(result.success).toBe(true);
  });

  it('treats empty optional content fields as omitted but still requires content by evidence type', () => {
    const candidate = validMystery();
    candidate.evidence[3].content.statement = '';
    candidate.evidence[3].content.witnessName = '';
    expect(validateMysteryConsistency(candidate, 3).success).toBe(true);
    candidate.evidence[3].content.body = '';
    expect(validateMysteryConsistency(candidate, 3).success).toBe(false);
  });

  it('removes irrelevant populated content fields before validating an evidence item', () => {
    const candidate = validMystery();
    candidate.evidence[3].content.statement = 'This irrelevant field must not leak into the public record.';
    expect(validateMysteryConsistency(candidate, 3).success).toBe(true);
  });

  it('rejects culprit, duplicate evidence, missing media types, and timeline inconsistencies', () => {
    const broken = validMystery();
    broken.solution.culpritId = 'S9';
    broken.evidence[1].id = 'E1';
    broken.evidence[2].type = 'document';
    broken.timeline.reverse();
    const result = validateMysteryConsistency(broken, 4);
    expect(result.success).toBe(false);
    expect(result.issues.join(' ')).toMatch(/culprit|unique|video|chronological|Expected/);
  });

  it('retries structured generation with a correction prompt and caps retries', async () => {
    const invalid = validMystery(); invalid.solution.culpritId = 'S99';
    const generator = vi.fn().mockResolvedValueOnce(invalid).mockResolvedValueOnce(validMystery());
    const generated = await generateMystery(input, { generateContent: generator, maxAttempts: 2 });
    expect(generated.solution.culpritId).toBe('S1');
    expect(generator).toHaveBeenCalledTimes(2);
    expect(generator.mock.calls[1][0].systemInstruction).toContain('Correction request');
    expect(buildMysteryPrompt(input).systemInstruction).toContain('exactly the requested number');
    expect(buildMysteryPrompt(input).userPrompt).toContain('"exactSuspectCount":3');
  });
});

describe('private solution serialization', () => {
  it('requires a provider key and Cloudinary before marking media as generatable', () => {
    const base = { GEMINI_API_KEY: 'test-key', IMAGE_API_KEY: '', VIDEO_API_KEY: '', IMAGE_PROVIDER: 'google-gemini', VIDEO_PROVIDER: 'google-gemini', MEDIA_STORAGE_PROVIDER: 'cloudinary', CLOUDINARY_CLOUD_NAME: 'test-cloud', CLOUDINARY_API_KEY: 'test-key', CLOUDINARY_API_SECRET: 'test-secret' };
    expect(isMediaConfigured('image', base)).toBe(true);
    expect(isMediaConfigured('video', { ...base, VIDEO_PROVIDER: 'disabled' })).toBe(false);
    expect(isMediaConfigured('image', { ...base, CLOUDINARY_API_SECRET: '' })).toBe(false);
  });

  it('only returns HTTPS Cloudinary media marked available', () => {
    expect(publicMedia('https://res.cloudinary.com/demo/video/upload/file.mp4', 'video/mp4', 10, 'available')).toMatchObject({ url: 'https://res.cloudinary.com/demo/video/upload/file.mp4', status: 'available' });
    expect(publicMedia('https://example.com/file.mp4', 'video/mp4', 10, 'available')).toMatchObject({ url: null, mimeType: null, status: 'unavailable' });
    expect(publicMedia('https://res.cloudinary.com/demo/image/upload/file.png', 'image/png', 10, 'unavailable').status).toBe('unavailable');
  });

  it('does not return suspect image prompts in public suspect objects', () => {
    const suspect = publicSuspect({ id: 'S1', name: 'Alex', profileImagePrompt: 'private image prompt', profileImageStatus: 'unavailable' });
    expect(suspect).not.toHaveProperty('profileImagePrompt');
    expect(suspect.profileImage).toMatchObject({ url: null, status: 'unavailable' });
  });

  it('omits mystery solutions and session identity from JSON output', () => {
    const mystery = new Mystery({ title: 'Test', originalScenario: input.scenario, category: input.category, difficulty: input.difficulty, sessionId: 'session-secret', idempotencyKey: 'hidden-key', generationRequest: { scenario: input.scenario }, solution: { culpritId: 'S1' }, generationStatus: { status: 'failed', errorCode: 'PRIVATE_ERROR' } });
    const json = mystery.toJSON();
    expect(json.solution).toBeUndefined();
    expect(json.sessionId).toBeUndefined();
    expect(json.idempotencyKey).toBeUndefined();
    expect(json.generationRequest).toBeUndefined();
    expect(json.generationStatus.errorCode).toBeUndefined();
  });

  it('omits private evidence interpretation and prompts from JSON output', () => {
    const evidence = new Evidence({ mysteryId: '507f1f77bcf86cd799439011', evidenceId: 'E1', type: 'document', title: 'Record', description: 'A fictional record.', timestamp: new Date(), content: { body: 'Record text' }, reveals: 'private interpretation', mediaPrompt: 'private prompt' });
    const json = evidence.toJSON();
    expect(json.reveals).toBeUndefined();
    expect(json.mediaPrompt).toBeUndefined();
  });
});
