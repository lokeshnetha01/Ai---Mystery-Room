import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_TEXT_MODEL || 'gemini-3.8-flash';
if (!apiKey) throw new Error('Set GEMINI_API_KEY before running the Gemini connectivity check.');

const client = new GoogleGenAI({ apiKey });
const response = await client.interactions.create({
  model,
  input: 'Return a JSON object with ok set to true.',
  response_format: {
    type: 'text',
    mime_type: 'application/json',
    schema: { type: 'object', properties: { ok: { type: 'boolean' } }, required: ['ok'] }
  }
}, { timeout_ms: 90000, retries: 0 });

const parsed = JSON.parse(response.output_text || 'null');
if (parsed?.ok !== true) throw new Error('Gemini did not return the expected structured response.');
console.info(`Gemini structured output check passed with model ${model}.`);
