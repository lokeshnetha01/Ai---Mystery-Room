import { z } from 'zod';

export const requestSchema = z.object({
  title: z.string().trim().max(100).optional().default(''),
  scenario: z.string().trim().min(40).max(3000),
  category: z.enum(['Theft', 'Murder (fictional, non-graphic)', 'Disappearance', 'Cyber Mystery', 'General Mystery']).default('General Mystery'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).default('Medium'),
  suspectCount: z.coerce.number().int().min(3).max(6).default(4)
}).strict();

const shortText = z.string().trim().min(1).max(2500);
const timestamp = z.iso.datetime({ offset: true });
const personLabel = z.string().trim().min(1).max(100);
const chatMessage = z.object({ sender: personLabel, recipient: personLabel, text: shortText, timestamp }).strict();
const logEntry = z.object({ timestamp, actor: shortText, action: shortText }).strict();
const evidenceContent = z.object({
  participants: z.array(personLabel).max(6).optional(),
  messages: z.array(chatMessage).max(8).optional(),
  altText: shortText.optional(),
  cameraId: shortText.optional(),
  durationSeconds: z.number().int().min(1).max(600).optional(),
  location: shortText.optional(),
  body: shortText.optional(),
  witnessName: personLabel.optional(),
  statement: shortText.optional(),
  entries: z.array(logEntry).max(10).optional()
}).strict();

export const evidenceSchema = z.object({
  id: z.string().regex(/^E[1-9]\d*$/),
  type: z.enum(['chat', 'image', 'video', 'document', 'witness_statement', 'system_log']),
  title: shortText,
  description: shortText,
  timestamp,
  content: evidenceContent,
  mediaPrompt: z.string().trim().max(1500).nullable(),
  relatedSuspectIds: z.array(z.string().regex(/^S[1-9]\d*$/)).max(6),
  reveals: shortText
}).strict();

export const mysteryOutputSchema = z.object({
  case: z.object({
    title: z.string().trim().min(3).max(100),
    category: z.enum(['Theft', 'Murder (fictional, non-graphic)', 'Disappearance', 'Cyber Mystery', 'General Mystery']),
    difficulty: z.enum(['Easy', 'Medium', 'Hard']),
    description: shortText,
    location: z.string().trim().min(2).max(150),
    incidentDate: timestamp
  }).strict(),
  victim: z.object({ name: z.string().trim().min(2).max(100), background: shortText }).nullable(),
  suspects: z.array(z.object({
    id: z.string().regex(/^S[1-9]\d*$/),
    name: z.string().trim().min(2).max(100),
    age: z.number().int().min(18).max(100),
    occupation: shortText,
    background: shortText,
    motive: shortText,
    alibi: shortText,
    profileImagePrompt: z.string().trim().min(10).max(1000)
  }).strict()).min(3).max(6),
  evidence: z.array(evidenceSchema).min(5).max(8),
  timeline: z.array(z.object({ timestamp, event: shortText }).strict()).min(3).max(10),
  solution: z.object({
    culpritId: z.string().regex(/^S[1-9]\d*$/),
    motive: shortText,
    explanation: shortText,
    evidenceIds: z.array(z.string().regex(/^E[1-9]\d*$/)).min(2).max(12)
  }).strict()
}).strict();

export const mysteryOutputJsonSchema = z.toJSONSchema(mysteryOutputSchema, { target: 'draft-7' });
export const mysteryGenerationJsonSchema = structuredClone(mysteryOutputJsonSchema);
const generationContentSchema = mysteryGenerationJsonSchema.properties.evidence.items.properties.content;
generationContentSchema.required = Object.keys(generationContentSchema.properties);

function hasValidTimestamp(value) {
  return Number.isFinite(Date.parse(value));
}

function omitEmptyOptionalEvidenceFields(candidate) {
  if (!candidate || !Array.isArray(candidate.evidence)) return candidate;
  const fieldsByType = {
    chat: ['participants', 'messages'],
    image: ['altText'],
    video: ['cameraId', 'location', 'durationSeconds'],
    document: ['body'],
    witness_statement: ['witnessName', 'statement'],
    system_log: ['entries']
  };
  return {
    ...candidate,
    evidence: candidate.evidence.map((item) => {
      if (!item || !item.content || typeof item.content !== 'object' || Array.isArray(item.content)) return item;
      const allowed = fieldsByType[item.type];
      const content = Object.fromEntries(Object.entries(item.content).filter(([key, value]) => {
        if (allowed && !allowed.includes(key)) return false;
        if (typeof value === 'string') return value.trim() !== '';
        if (Array.isArray(value)) return value.length > 0;
        if (key === 'durationSeconds') return Number.isFinite(value) && value > 0;
        return value !== null && value !== undefined;
      }));
      return { ...item, content };
    })
  };
}

export function validateMysteryConsistency(candidate, expectedSuspectCount) {
  const parsed = mysteryOutputSchema.safeParse(omitEmptyOptionalEvidenceFields(candidate));
  if (!parsed.success) return { success: false, issues: parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`) };
  const mystery = parsed.data;
  const issues = [];
  const suspectIds = mystery.suspects.map((suspect) => suspect.id);
  const evidenceIds = mystery.evidence.map((evidence) => evidence.id);
  const suspectSet = new Set(suspectIds);
  const evidenceSet = new Set(evidenceIds);

  if (mystery.suspects.length !== expectedSuspectCount) issues.push(`Expected exactly ${expectedSuspectCount} suspects.`);
  if (suspectSet.size !== suspectIds.length) issues.push('Suspect IDs must be unique.');
  if (new Set(mystery.suspects.map((suspect) => suspect.name.toLocaleLowerCase())).size !== mystery.suspects.length) issues.push('Suspect names must be unique.');
  if (!suspectSet.has(mystery.solution.culpritId)) issues.push('The culprit must match one suspect ID.');
  if (evidenceSet.size !== evidenceIds.length) issues.push('Evidence IDs must be unique.');
  for (const evidence of mystery.evidence) {
    if (!hasValidTimestamp(evidence.timestamp)) issues.push(`${evidence.id} has an invalid timestamp.`);
    if (new Set(evidence.relatedSuspectIds).size !== evidence.relatedSuspectIds.length) issues.push(`${evidence.id} repeats a related suspect ID.`);
    for (const suspectId of evidence.relatedSuspectIds) if (!suspectSet.has(suspectId)) issues.push(`${evidence.id} references an unknown suspect.`);
    const contentError = validateEvidenceContent(evidence);
    if (contentError) issues.push(`${evidence.id}: ${contentError}`);
  }
  if (!hasValidTimestamp(mystery.case.incidentDate)) issues.push('The incident date is invalid.');
  for (const event of mystery.timeline) if (!hasValidTimestamp(event.timestamp)) issues.push('The timeline contains an invalid timestamp.');
  const timelineTimes = mystery.timeline.map((event) => Date.parse(event.timestamp));
  if (timelineTimes.some((time, index) => index > 0 && time < timelineTimes[index - 1])) issues.push('Timeline events must be ordered by timestamp.');
  const incidentTime = Date.parse(mystery.case.incidentDate);
  if (timelineTimes.length && (incidentTime < timelineTimes[0] || incidentTime > timelineTimes.at(-1))) issues.push('The incident date must fall within the investigation timeline.');
  if (new Set(mystery.solution.evidenceIds).size !== mystery.solution.evidenceIds.length) issues.push('Solution evidence IDs must be unique.');
  for (const evidenceId of mystery.solution.evidenceIds) if (!evidenceSet.has(evidenceId)) issues.push(`Solution references unknown evidence ${evidenceId}.`);
  const evidenceTypes = new Set(mystery.evidence.map((item) => item.type));
  for (const requiredType of ['chat', 'image', 'video']) if (!evidenceTypes.has(requiredType)) issues.push(`At least one ${requiredType} evidence item is required.`);
  const solutionEvidence = mystery.evidence.filter((item) => mystery.solution.evidenceIds.includes(item.id));
  if (!solutionEvidence.some((item) => item.relatedSuspectIds.includes(mystery.solution.culpritId))) issues.push('At least one solution evidence item must connect to the culprit.');
  const contradiction = solutionEvidence.some((item) => /contradict|conflict|inconsisten|alibi|discrepanc|impossible/i.test(item.reveals));
  if (!contradiction) issues.push('At least one solution evidence item must expose an alibi contradiction or inconsistency.');
  return issues.length ? { success: false, issues } : { success: true, data: mystery };
}

function validateEvidenceContent(evidence) {
  const content = evidence.content;
  const missing = {
    chat: !content.participants?.length || !content.messages?.length,
    image: !content.altText || !evidence.mediaPrompt,
    video: !content.cameraId || !content.location || !content.durationSeconds || !evidence.mediaPrompt,
    document: !content.body,
    witness_statement: !content.witnessName || !content.statement,
    system_log: !content.entries?.length
  }[evidence.type];
  return missing ? `required content for type "${evidence.type}" is missing.` : '';
}
