import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { verifyPaymentSignature } from '@/server/commerce/razorpay';
import { OrderError } from '@/server/commerce/orders-repo';
import { paymentClient, settlePayment } from '@/server/checkout-service';
import { handle, HttpError, json, limit, readJson } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.strictObject({
  razorpay_order_id: z.string().regex(/^order_[A-Za-z0-9]+$/),
  razorpay_payment_id: z.string().regex(/^pay_[A-Za-z0-9]+$/),
  razorpay_signature: z.string().regex(/^[a-f0-9]{64}$/),
});

/**
 * Called by the browser after Razorpay Checkout succeeds. The signature
 * proves the ids came from Razorpay; the payment is then fetched from
 * Razorpay and matched (order, amount, currency, captured) before the
 * order is marked paid. The webhook performs the same settlement.
 */
export const POST = handle('checkout.verify', async (req: NextRequest) => {
  const body = await readJson(req, 2000);
  await limit(req, 'verify', 20, 600);
  const payments = paymentClient();
  if (!payments) throw new HttpError(503, 'not_configured');
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new HttpError(400, 'invalid');
  const v = parsed.data;

  const ok = verifyPaymentSignature({ orderId: v.razorpay_order_id, paymentId: v.razorpay_payment_id, signature: v.razorpay_signature }, payments.config.keySecret);
  if (!ok) throw new HttpError(400, 'bad_signature');

  const p = await payments.client.fetchPayment(v.razorpay_payment_id);
  if (p.order_id !== v.razorpay_order_id) throw new HttpError(400, 'mismatch');
  try {
    const result = await settlePayment({
      providerOrderId: p.order_id,
      paymentId: p.id,
      amountPaise: p.amount,
      currency: p.currency,
      status: p.status,
      errorCode: p.error_code,
      errorDescription: p.error_description,
    });
    return json(200, { ok: true, orderNumber: result.number, status: result.status });
  } catch (err) {
    if (err instanceof OrderError) throw new HttpError(409, err.code);
    throw err;
  }
});
