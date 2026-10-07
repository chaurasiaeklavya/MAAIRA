/**
 * Razorpay integration (India). Uses the documented REST API directly — no
 * SDK — so every call and check is visible here.
 *
 *  - Orders are created server-side with the server-computed amount.
 *  - The Checkout handler's signature is verified with HMAC-SHA256
 *    (order_id|payment_id, key secret), compared in constant time.
 *  - The payment is then fetched from Razorpay and its order id, amount,
 *    currency and status are matched before an order is marked paid.
 *  - Webhooks are verified with the webhook secret over the raw body.
 *
 * STATUS: BLOCKED — PRODUCTION CREDENTIAL / PROVIDER CONFIGURATION REQUIRED.
 * No Razorpay account or keys were supplied, so the live API has not been
 * exercised; signature logic is unit-tested with test secrets.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';

export interface RazorpayConfig {
  keyId: string;
  keySecret: string;
  webhookSecret: string | null;
}

export function razorpayConfig(env: Record<string, string | undefined> = process.env): RazorpayConfig | null {
  const keyId = env.RAZORPAY_KEY_ID?.trim();
  const keySecret = env.RAZORPAY_KEY_SECRET?.trim();
  if (!keyId || !keySecret) return null;
  if (!/^rzp_(test|live)_[A-Za-z0-9]+$/.test(keyId)) return null;
  return { keyId, keySecret, webhookSecret: env.RAZORPAY_WEBHOOK_SECRET?.trim() || null };
}

export const isLiveMode = (c: RazorpayConfig) => c.keyId.startsWith('rzp_live_');

function safeEqualHex(a: string, b: string) {
  const ab = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function verifyPaymentSignature(params: { orderId: string; paymentId: string; signature: string }, keySecret: string) {
  const expected = createHmac('sha256', keySecret).update(`${params.orderId}|${params.paymentId}`).digest('hex');
  return safeEqualHex(expected, params.signature);
}

export function verifyWebhookSignature(rawBody: string, signature: string | null, webhookSecret: string) {
  if (!signature) return false;
  const expected = createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
  return safeEqualHex(expected, signature);
}

export interface ProviderPayment {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed';
  error_code?: string | null;
  error_description?: string | null;
}

/** The subset of the Razorpay API we use — injectable so integration tests can substitute a stub. */
export interface PaymentProvider {
  createOrder(input: { amountPaise: number; currency: 'INR'; receipt: string; notes: Record<string, string> }): Promise<{ id: string; amount: number; currency: string }>;
  fetchPayment(paymentId: string): Promise<ProviderPayment>;
}

const API = 'https://api.razorpay.com/v1';

export function razorpayClient(config: RazorpayConfig, fetchImpl: typeof fetch = fetch): PaymentProvider {
  const auth = `Basic ${Buffer.from(`${config.keyId}:${config.keySecret}`).toString('base64')}`;
  const call = async <T>(path: string, init?: RequestInit): Promise<T> => {
    const res = await fetchImpl(`${API}${path}`, {
      ...init,
      headers: { Authorization: auth, 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      // Never surface provider error bodies to customers; log the status only.
      throw new Error(`Razorpay ${path.split('/')[1]} failed with HTTP ${res.status}`);
    }
    return (await res.json()) as T;
  };
  return {
    createOrder: ({ amountPaise, currency, receipt, notes }) =>
      call('/orders', { method: 'POST', body: JSON.stringify({ amount: amountPaise, currency, receipt, notes }) }),
    fetchPayment: (paymentId) => {
      if (!/^pay_[A-Za-z0-9]+$/.test(paymentId)) throw new Error('Malformed payment id');
      return call(`/payments/${paymentId}`);
    },
  };
}
