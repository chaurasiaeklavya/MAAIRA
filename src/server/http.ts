import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { DatabaseUnavailable, getDb } from '@/db';
import { hit } from './rate-limit-db';

/**
 * Shared guards for JSON API routes: content type, same-origin (CSRF),
 * body size, database-backed rate limiting and safe error responses.
 */
export const json = (status: number, body: Record<string, unknown>, headers: Record<string, string> = {}) =>
  NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } });

export function clientIp(req: NextRequest | Request) {
  const fwd = req.headers.get('x-forwarded-for');
  return (fwd?.split(',')[0] || req.headers.get('x-real-ip') || 'local').trim().slice(0, 64);
}

/** State-changing requests must come from this site (Origin, else Referer). */
export function sameOrigin(req: NextRequest | Request) {
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  const source = req.headers.get('origin') || req.headers.get('referer');
  if (!source) return false;
  try {
    return new URL(source).host === host;
  } catch {
    return false;
  }
}

export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    public extra: Record<string, unknown> = {},
    public headers: Record<string, string> = {},
  ) {
    super(code);
  }
}

export async function readJson<T = unknown>(req: NextRequest | Request, maxBytes = 10_000): Promise<T> {
  if (!req.headers.get('content-type')?.toLowerCase().startsWith('application/json')) throw new HttpError(415, 'unsupported_media_type');
  if (!sameOrigin(req)) throw new HttpError(403, 'forbidden');
  const raw = await req.text();
  if (raw.length > maxBytes) throw new HttpError(413, 'too_large');
  try {
    const v = JSON.parse(raw);
    if (!v || typeof v !== 'object' || Array.isArray(v)) throw new Error();
    return v as T;
  } catch {
    throw new HttpError(400, 'invalid_json');
  }
}

export async function limit(req: NextRequest | Request, bucket: string, max: number, windowSec: number, subject?: string) {
  const r = await hit(getDb(), `${bucket}:${subject ?? clientIp(req)}`, max, windowSec);
  if (!r.allowed) throw new HttpError(429, 'rate_limited', {}, { 'Retry-After': String(r.retryAfterSec) });
}

/** Wraps a handler: maps HttpError/DatabaseUnavailable to safe JSON; logs the rest without details. */
export function handle(name: string, fn: (req: NextRequest) => Promise<Response>) {
  return async (req: NextRequest) => {
    try {
      return await fn(req);
    } catch (err) {
      if (err instanceof HttpError) return json(err.status, { ok: false, code: err.code, ...err.extra }, err.headers);
      if (err instanceof DatabaseUnavailable) return json(503, { ok: false, code: 'not_configured' });
      console.error(JSON.stringify({ evt: 'api_error', route: name, error: err instanceof Error ? err.name : 'unknown' }));
      return json(500, { ok: false, code: 'server_error' });
    }
  };
}
