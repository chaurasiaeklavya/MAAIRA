import { NextResponse, type NextRequest } from 'next/server';
import { products } from '@/data/products';
import { validateEnquiry, type EnquiryPayload } from '@/lib/enquiry/schema';
import { notifierConfigured, notifyNewEnquiry } from '@/lib/server/notify';
import { createRateLimiter } from '@/lib/server/rate-limit';
import { getStore, newEnquiryId, type EnquiryRecord } from '@/lib/server/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 10_000;
// Default: 5 requests per IP per 10 minutes (override for testing via ENQUIRY_RATE_LIMIT_MAX).
const limiter = createRateLimiter({
  limit: Math.max(1, Number(process.env.ENQUIRY_RATE_LIMIT_MAX) || 5),
  windowMs: 10 * 60 * 1000,
});
const PIECE_IDS = products.map((p) => p.id);

const json = (status: number, body: Record<string, unknown>, headers: Record<string, string> = {}) =>
  NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } });

function clientKey(req: NextRequest) {
  const fwd = req.headers.get('x-forwarded-for');
  return (fwd?.split(',')[0] || req.headers.get('x-real-ip') || 'local').trim();
}

/** Reject cross-site posts: when an Origin is sent it must match this host. */
function sameOrigin(req: NextRequest) {
  const origin = req.headers.get('origin');
  if (!origin) return true;
  try {
    return new URL(origin).host === (req.headers.get('x-forwarded-host') || req.headers.get('host'));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (!req.headers.get('content-type')?.includes('application/json')) {
    return json(415, { ok: false, code: 'unsupported_media_type' });
  }
  if (!sameOrigin(req)) return json(403, { ok: false, code: 'forbidden' });

  const store = getStore();
  const notify = notifierConfigured();
  if (!store && !notify) {
    // Honest state: nothing would receive the request, so don't accept it.
    return json(503, { ok: false, code: 'not_configured' });
  }

  const rate = limiter(clientKey(req));
  if (!rate.ok) {
    return json(429, { ok: false, code: 'rate_limited' }, { 'Retry-After': String(rate.retryAfterSeconds) });
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return json(413, { ok: false, code: 'too_large' });
  let payload: EnquiryPayload;
  try {
    payload = JSON.parse(raw) as EnquiryPayload;
  } catch {
    return json(400, { ok: false, code: 'invalid_json' });
  }
  if (!payload || typeof payload !== 'object') return json(400, { ok: false, code: 'invalid_json' });

  const result = validateEnquiry(payload, PIECE_IDS);
  if (!result.ok) {
    return json(400, { ok: false, code: result.spam ? 'rejected' : 'invalid', errors: result.errors });
  }
  const value = result.value;

  try {
    // Idempotency: a retried submission returns the original reference.
    if (store) {
      const existing = await store.findByIdempotencyKey(value.idempotencyKey);
      if (existing) return json(200, { ok: true, id: existing.id, kind: existing.kind, duplicate: true });
    }

    const piece = products.find((p) => p.id === value.pieceId);
    const now = new Date().toISOString();
    const record: EnquiryRecord = {
      ...value,
      id: newEnquiryId(value.kind),
      createdAt: now,
      status: 'new',
      pieceName: piece?.displayName ?? null,
      consentAt: now,
    };

    if (store) await store.create(record);
    const emailed = notify ? await notifyNewEnquiry(record) : false;
    if (!store && !emailed) {
      // Email-only mode and the email failed: the request reached no one.
      return json(502, { ok: false, code: 'delivery_failed' });
    }

    console.info(`[enquiry] received ${record.id} (${record.kind}) store=${store?.kind ?? 'none'} email=${emailed}`);
    return json(201, { ok: true, id: record.id, kind: record.kind });
  } catch (err) {
    console.error('[enquiry] failed to record request', err instanceof Error ? err.message : 'unknown error');
    return json(500, { ok: false, code: 'server_error' });
  }
}

export function GET() {
  return json(405, { ok: false, code: 'method_not_allowed' }, { Allow: 'POST' });
}
