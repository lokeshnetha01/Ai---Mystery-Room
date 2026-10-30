import { env } from '../config/env.js';

export function geminiCompatibleSchema(schema) {
  if (Array.isArray(schema)) return schema.map(geminiCompatibleSchema);
  if (!schema || typeof schema !== 'object') return schema;
  if (Array.isArray(schema.anyOf)) {
    const nullable = schema.anyOf.find((item) => item.type === 'null');
    const selected = schema.anyOf.find((item) => item.type !== 'null');
    if (selected) {
      const compatible = geminiCompatibleSchema(selected);
      return nullable ? { ...compatible, type: [compatible.type, 'null'] } : compatible;
    }
  }
  const result = {};
  // Keep the constrained-decoding schema structural. Zod remains authoritative
  // for date formats, bounds, patterns, and collection sizes after generation.
  const supportedKeys = new Set(['type', 'properties', 'required', 'items', 'enum']);
  for (const [key, value] of Object.entries(schema)) {
    if (!supportedKeys.has(key)) continue;
    if (key === 'properties') {
      result.properties = Object.fromEntries(Object.entries(value).map(([name, child]) => [name, geminiCompatibleSchema(child)]));
    } else {
      result[key] = key === 'items' ? geminiCompatibleSchema(value) : value;
    }
  }
  return result;
}

export async function generateStructuredMystery(prompt, jsonSchema) {
  if (!env.GEMINI_API_KEY || !env.GEMINI_TEXT_MODEL) {
    const error = new Error('Gemini generation is not configured');
    error.code = 'AI_NOT_CONFIGURED';
    error.status = 503;
    throw error;
  }
  const { GoogleGenAI } = await import('@google/genai');
  const client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  try {
    const response = await client.interactions.create({
      model: env.GEMINI_TEXT_MODEL,
      system_instruction: prompt.systemInstruction,
      input: prompt.userPrompt,
      response_format: {
        type: 'text',
        mime_type: 'application/json',
        schema: geminiCompatibleSchema(jsonSchema)
      },
      generation_config: { max_output_tokens: 7000, thinking_level: 'low' },
      store: false
    }, { timeout_ms: 180000, retries: 0 });
    if (!response.output_text) throw new Error('Gemini returned no structured content');
    try {
      return JSON.parse(response.output_text);
    } catch (cause) {
      const error = new Error('Gemini returned invalid JSON');
      error.code = 'AI_INVALID_JSON';
      error.cause = cause;
      throw error;
    }
  } catch (cause) {
    if (['AI_NOT_CONFIGURED', 'AI_INVALID_JSON'].includes(cause.code)) throw cause;
    const error = new Error('Gemini could not generate a valid case right now');
    error.code = 'AI_PROVIDER_UNAVAILABLE';
    error.status = 503;
    error.cause = cause;
    throw error;
  }
}
