import { createHash } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { getDb } from '@/db';
import * as s from '@/db/schema';
import { razorpayConfig, verifyWebhookSignature } from '@/server/commerce/razorpay';
import { OrderError } from '@/server/commerce/orders-repo';
import { settlePayment } from '@/server/checkout-service';
import { json } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface PaymentEntity {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
  error_code?: string | null;
  error_description?: string | null;
}

/**
 * Razorpay webhooks (payment.captured, payment.failed, order.paid).
 * Untrusted until the signature over the raw body verifies. Each event id
 * is processed once; retries of the same event are acknowledged as no-ops.
 */
export async function POST(req: Request) {
  const config = razorpayConfig();
  if (!config?.webhookSecret) return json(503, { ok: false, code: 'not_configured' });
  const raw = await req.text();
  if (raw.length > 100_000) return json(413, { ok: false });
  if (!verifyWebhookSignature(raw, req.headers.get('x-razorpay-signature'), config.webhookSecret)) {
    console.warn(JSON.stringify({ evt: 'webhook_bad_signature' }));
    return json(400, { ok: false });
  }
  let event: { event?: string; payload?: { payment?: { entity?: PaymentEntity } } };
  try {
    event = JSON.parse(raw);
  } catch {
    return json(400, { ok: false });
  }
  const eventId = req.headers.get('x-razorpay-event-id') || createHash('sha256').update(raw).digest('hex');
  const db = getDb();
  const inserted = await db
    .insert(s.paymentEvents)
    .values({ id: eventId.slice(0, 120), provider: 'razorpay', eventType: String(event.event ?? 'unknown').slice(0, 60), payloadSha256: createHash('sha256').update(raw).digest('hex') })
    .onConflictDoNothing()
    .returning({ id: s.paymentEvents.id });
  if (!inserted.length) return json(200, { ok: true, duplicate: true });

  const p = event.payload?.payment?.entity;
  let result = 'ignored';
  if (p && ['payment.captured', 'payment.failed', 'order.paid'].includes(event.event ?? '')) {
    try {
      const r = await settlePayment({
        providerOrderId: p.order_id,
        paymentId: p.id,
        amountPaise: p.amount,
        currency: p.currency,
        status: event.event === 'payment.failed' ? 'failed' : p.status,
        errorCode: p.error_code,
        errorDescription: p.error_description,
      });
      result = r.status;
    } catch (err) {
      result = err instanceof OrderError ? err.code : 'error';
    }
  }
  await db.update(s.paymentEvents).set({ result }).where(eq(s.paymentEvents.id, inserted[0].id));
  console.info(JSON.stringify({ evt: 'webhook', type: event.event, result }));
  return json(200, { ok: true });
}
