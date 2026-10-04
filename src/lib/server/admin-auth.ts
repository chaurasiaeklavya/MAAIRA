import { timingSafeEqual } from 'node:crypto';

/**
 * HTTP Basic credentials for the enquiry admin, from ADMIN_USER and
 * ADMIN_PASSWORD. The admin area is disabled entirely (404) unless both are
 * set. Checked in the proxy and again inside every admin handler/page.
 */
export function adminConfigured() {
  return Boolean(process.env.ADMIN_USER && process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length >= 12);
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  // Compare equal-length buffers to avoid leaking length via timing.
  const len = Math.max(ab.length, bb.length, 1);
  const pa = Buffer.alloc(len);
  const pb = Buffer.alloc(len);
  ab.copy(pa);
  bb.copy(pb);
  return timingSafeEqual(pa, pb) && ab.length === bb.length;
}

export function isAuthorised(authorization: string | null | undefined) {
  if (!adminConfigured() || !authorization?.startsWith('Basic ')) return false;
  let decoded = '';
  try {
    decoded = Buffer.from(authorization.slice(6), 'base64').toString('utf8');
  } catch {
    return false;
  }
  const sep = decoded.indexOf(':');
  if (sep < 0) return false;
  const user = decoded.slice(0, sep);
  const pass = decoded.slice(sep + 1);
  const userOk = safeEqual(user, process.env.ADMIN_USER!);
  const passOk = safeEqual(pass, process.env.ADMIN_PASSWORD!);
  return userOk && passOk;
}
