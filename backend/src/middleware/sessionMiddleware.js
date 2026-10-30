import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { env } from '../config/env.js';

const COOKIE_NAME = 'mystery_session';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const signingSecret = env.SESSION_SECRET || (env.NODE_ENV === 'production' ? '' : 'development-session-secret-change-before-deploy');

function sign(id) {
  return createHmac('sha256', signingSecret).update(id).digest('base64url');
}

function readCookie(header = '') {
  const entry = header.split(';').map((item) => item.trim()).find((item) => item.startsWith(`${COOKIE_NAME}=`));
  return entry ? decodeURIComponent(entry.slice(COOKIE_NAME.length + 1)) : '';
}

function verifiedSessionId(value) {
  const separator = value.lastIndexOf('.');
  if (separator < 1 || !signingSecret) return null;
  const id = value.slice(0, separator);
  const given = Buffer.from(value.slice(separator + 1));
  const expected = Buffer.from(sign(id));
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  return /^[0-9a-f-]{36}$/i.test(id) ? id : null;
}

export function sessionMiddleware(req, res, next) {
  let id = verifiedSessionId(readCookie(req.headers.cookie));
  if (!id) {
    id = randomUUID();
    const value = `${id}.${sign(id)}`;
    const secure = env.NODE_ENV === 'production' ? '; Secure' : '';
    res.append('Set-Cookie', `${COOKIE_NAME}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE_SECONDS}${secure}`);
  }
  req.investigationSessionId = id;
  next();
}
