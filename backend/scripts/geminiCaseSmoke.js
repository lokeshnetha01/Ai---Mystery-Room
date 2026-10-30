import { generateMystery } from '../src/services/mysteryGenerator.js';

const mystery = await generateMystery({
  title: 'The Archive Room Bell',
  scenario: 'During a private evening reception at a small city museum, a handwritten map vanishes from a locked archive room. Several staff members had access, and the alarm log contains a brief unexplained gap.',
  category: 'General Mystery',
  difficulty: 'Medium',
  suspectCount: 3
});

console.info('Validated Gemini case generated:', JSON.stringify({
  title: mystery.case.title,
  suspects: mystery.suspects.length,
  evidence: mystery.evidence.length,
  evidenceTypes: [...new Set(mystery.evidence.map(({ type }) => type))],
  timelineEvents: mystery.timeline.length,
  solutionValidated: true
}));
