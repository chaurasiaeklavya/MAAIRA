import 'server-only';
import { eq } from 'drizzle-orm';
import { getDb } from '@/db';
import * as s from '@/db/schema';
import { formatPaise } from '@/lib/commerce/money';
import { businessInbox, sendEmail } from './email';
import { razorpayClient, razorpayConfig } from './commerce/razorpay';
import { loadSettings, checkoutReadiness } from './commerce/settings';
import { applyVerifiedPayment, type VerifiedPayment } from './commerce/orders-repo';

export async function getReadiness() {
  const settings = await loadSettings(getDb());
  return { settings, readiness: checkoutReadiness(settings, razorpayConfig() !== null) };
}

/** Applies a verified payment, then sends confirmations (best effort, after commit). */
export async function settlePayment(payment: VerifiedPayment) {
  const db = getDb();
  const result = await applyVerifiedPayment(db, payment);
  if (result.status === 'paid') {
    const [order] = await db.select().from(s.orders).where(eq(s.orders.id, result.orderId));
    const items = await db.select().from(s.orderItems).where(eq(s.orderItems.orderId, result.orderId));
    const rows: [string, string][] = [
      ['Order', order.number],
      ...items.map((i): [string, string] => [`${i.name} × ${i.quantity}`, formatPaise(i.lineTotalPaise)]),
      ['Delivery', formatPaise(order.shippingPaise)],
      ['Total paid', `${formatPaise(order.totalPaise)} (inclusive of taxes)`],
    ];
    // Only for the call that actually moved the order to paid (not repeats).
    if (result.changed) {
      await sendEmail({ to: order.email, subject: `Your MAAIRA order ${order.number} is confirmed`, intro: `Thank you, ${order.fullName}. Your payment has been received and your order is confirmed.`, rows });
      const inbox = businessInbox();
      if (inbox.length) await sendEmail({ to: inbox, subject: `New paid order ${order.number}`, rows: [...rows, ['Customer', `${order.fullName} · ${order.email} · ${order.phone}`]] });
    }
  }
  return result;
}

export function paymentClient() {
  const config = razorpayConfig();
  return config ? { config, client: razorpayClient(config) } : null;
}
