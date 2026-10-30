import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

// Load the backend's local secrets regardless of whether commands are run from
// the repository root or the backend workspace. Existing process env wins.
dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z.string().optional().default(''),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  SESSION_SECRET: z.string().optional().default(''),
  GEMINI_API_KEY: z.string().optional().default(''),
  GEMINI_TEXT_MODEL: z.string().trim().default('gemini-3.8-flash').transform((value) => value || 'gemini-3.8-flash'),
  IMAGE_PROVIDER: z.string().trim().default('').transform((value) => value || 'disabled').pipe(z.enum(['disabled', 'google-gemini'])),
  IMAGE_API_KEY: z.string().optional().default(''),
  IMAGE_MODEL: z.string().trim().default('gemini-nano-banana-2.1'),
  VIDEO_PROVIDER: z.string().trim().default('').transform((value) => value || 'disabled').pipe(z.enum(['disabled', 'google-gemini'])),
  VIDEO_API_KEY: z.string().optional().default(''),
  VIDEO_MODEL: z.string().trim().default('gemini-omni-1.1-flash'),
  MEDIA_STORAGE_PROVIDER: z.string().trim().default('').transform((value) => value || 'disabled').pipe(z.enum(['disabled', 'cloudinary'])),
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
  CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default('')
}).superRefine((config, context) => {
  if (config.NODE_ENV !== 'production') return;
  for (const key of ['MONGODB_URI', 'GEMINI_API_KEY', 'GEMINI_TEXT_MODEL', 'SESSION_SECRET']) {
    if (!config[key]) context.addIssue({ code: 'custom', path: [key], message: `${key} is required in production` });
  }
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  throw new Error(`Invalid environment configuration: ${parsed.error.issues.map((issue) => issue.path.join('.')).join(', ')}`);
}

export const env = parsed.data;
