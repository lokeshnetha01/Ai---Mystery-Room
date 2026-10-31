import { createHash } from 'node:crypto';
import { env } from '../config/env.js';

function storageConfigured(config) {
  return config.MEDIA_STORAGE_PROVIDER === 'cloudinary'
    && Boolean(config.CLOUDINARY_CLOUD_NAME && config.CLOUDINARY_API_KEY && config.CLOUDINARY_API_SECRET);
}

export function isMediaConfigured(type, config = env) {
  const provider = type === 'image' ? config.IMAGE_PROVIDER : config.VIDEO_PROVIDER;
  const apiKey = type === 'image' ? (config.IMAGE_API_KEY || config.GEMINI_API_KEY) : (config.VIDEO_API_KEY || config.GEMINI_API_KEY);
  return provider === 'google-gemini' && Boolean(apiKey) && storageConfigured(config);
}

function safeMediaUrl(value, resourceType) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.hostname !== 'res.cloudinary.com' || !url.pathname.startsWith(`/${env.CLOUDINARY_CLOUD_NAME}/${resourceType}/upload/`)) {
    throw new Error('Media storage returned an unexpected URL');
  }
  return url.toString();
}

async function uploadToCloudinary(bytes, { mimeType, resourceType, mysteryId, evidenceId }) {
  if (!storageConfigured(env)) throw new Error('Media storage is not configured');
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const folder = `ai-mystery-room/${mysteryId}`;
  const publicId = evidenceId.toLowerCase();
  const signed = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${env.CLOUDINARY_API_SECRET}`;
  const signature = createHash('sha1').update(signed).digest('hex');
  const form = new FormData();
  const extension = resourceType === 'video' ? 'mp4' : mimeType === 'image/jpeg' ? 'jpg' : 'png';
  form.set('file', new Blob([bytes], { type: mimeType }), `${publicId}.${extension}`);
  form.set('api_key', env.CLOUDINARY_API_KEY);
  form.set('timestamp', timestamp);
  form.set('folder', folder);
  form.set('public_id', publicId);
  form.set('signature', signature);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(env.CLOUDINARY_CLOUD_NAME)}/${resourceType}/upload`, { method: 'POST', body: form, signal: AbortSignal.timeout(60000) });
  if (!response.ok) throw new Error(`Media storage upload failed (${response.status})`);
  const data = await response.json();
  const url = safeMediaUrl(data.secure_url, resourceType);
  if (!Number.isSafeInteger(data.bytes) || data.bytes < 1) throw new Error('Media storage returned invalid file metadata');
  return { url, mimeType, sizeBytes: data.bytes };
}

async function googleImage(prompt, apiKey) {
  const { GoogleGenAI } = await import('@google/genai');
  const client = new GoogleGenAI({ apiKey });
  const response = await client.models.generateContent({
    model: env.IMAGE_MODEL,
    contents: prompt,
    config: {
      responseModalities: ['IMAGE'],
      responseFormat: {
        image: { aspectRatio: '4:3', imageSize: '1K' }
      }
    }
  });
  const parts = response.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find((part) => part.inlineData?.data);
  if (!imagePart) {
    const reason = response.promptFeedback?.blockReason || 'No image data returned';
    throw new Error(`Image provider returned no image bytes: ${reason}`);
  }
  return Buffer.from(imagePart.inlineData.data, 'base64');
}

async function googleVideo(prompt, apiKey) {
  const { GoogleGenAI } = await import('@google/genai');
  const client = new GoogleGenAI({ apiKey });
  const interaction = await client.interactions.create({
    model: env.VIDEO_MODEL,
    input: `Create a short, silent, fictional CCTV-style clip for an investigation. No overlays, no readable text, no graphic content. Scene context: ${prompt}`,
    response_format: { type: 'video', aspect_ratio: '16:9' },
    store: false
  }, { timeout_ms: 240000, retries: 0 });
  if (!interaction.output_video?.data) throw new Error('Video provider returned no video bytes');
  return Buffer.from(interaction.output_video.data, 'base64');
}

export async function generateAndStoreEvidenceMedia({ type, prompt, mysteryId, evidenceId, onStatus = async () => {} }) {
  if (!isMediaConfigured(type)) return null;
  const provider = type === 'image' ? env.IMAGE_PROVIDER : env.VIDEO_PROVIDER;
  const apiKey = type === 'image' ? (env.IMAGE_API_KEY || env.GEMINI_API_KEY) : (env.VIDEO_API_KEY || env.GEMINI_API_KEY);
  const resourceType = type === 'image' ? 'image' : 'video';
  try {
    await onStatus('processing');
    const bytes = type === 'image' ? await googleImage(prompt, apiKey) : await googleVideo(prompt, apiKey);
    return await uploadToCloudinary(bytes, { mimeType: type === 'image' ? 'image/jpeg' : 'video/mp4', resourceType, mysteryId, evidenceId });
  } catch (error) {
    error.code = error.code || `${provider.toUpperCase().replaceAll('-', '_')}_${type.toUpperCase()}_FAILED`;
    throw error;
  }
}

