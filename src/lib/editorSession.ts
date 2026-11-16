import { createHmac, timingSafeEqual } from 'crypto';

export const EDITOR_COOKIE_NAME = 'editor_session';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours
export const EDITOR_COOKIE_MAX_AGE = SESSION_TTL_MS / 1000;

function getSecret(): string {
  const secret = process.env.BLOG_SESSION_SECRET;
  if (!secret) {
    throw new Error('BLOG_SESSION_SECRET is not set, see .env.local.example.');
  }
  return secret;
}

export function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  // Constant-time compare needs equal-length buffers; a length mismatch is
  // itself not sensitive (it doesn't leak *which* characters are wrong).
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function createSessionToken(): string {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + SESSION_TTL_MS })).toString('base64url');
  const sig = createHmac('sha256', getSecret()).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;

  let expected: string;
  try {
    expected = createHmac('sha256', getSecret()).update(payload).digest('base64url');
  } catch {
    return false;
  }
  if (!safeCompare(sig, expected)) return false;

  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return typeof exp === 'number' && Date.now() < exp;
  } catch {
    return false;
  }
}
