import type { NextRequest } from 'next/server';
import { getDb } from '@/db';
import * as s from '@/db/schema';
import { checkoutSchema, fieldErrors } from '@/lib/commerce/checkout-schema';
import { currentUser } from '@/server/auth';
import { ensureCart } from '@/server/cart-session';
import { attachProviderOrder, createOrder, expireUnpaidOrders, OrderError, transitionOrder } from '@/server/commerce/orders-repo';
import { getReadiness, paymentClient } from '@/server/checkout-service';
import { handle, HttpError, json, limit, readJson } from '@/server/http';
import { brand } from '@/data/brand';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Starts checkout: validates the customer details, creates the order from
 * the server-side cart (prices and stock from the database), and creates the
 * matching Razorpay order. The browser receives only what Razorpay Checkout
 * needs — never a price it can change.
 */
export const POST = handle('checkout', async (req: NextRequest) => {
  const body = await readJson(req, 8000);
  await limit(req, 'checkout', 10, 600);

  const { settings, readiness } = await getReadiness();
  const payments = paymentClient();
  if (!readiness.ready || !payments) {
    throw new HttpError(503, 'checkout_closed', { blockers: readiness.blockers.map((b) => b.key) });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) throw new HttpError(400, 'invalid', { errors: fieldErrors(parsed.error) });
  const input = parsed.data;

  const db = getDb();
  await expireUnpaidOrders(db);
  const user = await currentUser();
  const cartId = await ensureCart();

  let order;
  try {
    order = await createOrder(db, { cartId, userId: user?.id ?? null, email: input.email, address: input.address, idempotencyKey: input.idempotencyKey, settings });
  } catch (err) {
    if (err instanceof OrderError) throw new HttpError(409, err.code, { message: err.message });
    throw err;
  }
  if (order.existing) throw new HttpError(409, 'duplicate', { message: 'This checkout was already submitted. Please check your orders or start again.' });

  try {
    const rp = await payments.client.createOrder({ amountPaise: order.totalPaise, currency: 'INR', receipt: order.number, notes: { order_number: order.number } });
    if (rp.amount !== order.totalPaise || rp.currency !== 'INR') throw new Error('Provider order amount mismatch');
    await attachProviderOrder(db, order.id, 'razorpay', rp.id, order.totalPaise);

    if (user && input.saveAddress) {
      await db.insert(s.addresses).values({ userId: user.id, ...input.address, line2: input.address.line2 || null });
    }
    return json(201, {
      ok: true,
      orderNumber: order.number,
      accessToken: order.accessToken,
      payment: {
        provider: 'razorpay',
        keyId: payments.config.keyId,
        orderId: rp.id,
        amount: order.totalPaise,
        currency: 'INR',
        name: brand.name,
        description: `Order ${order.number}`,
        prefill: { name: input.address.fullName, email: input.email, contact: input.address.phone },
      },
    });
  } catch (err) {
    // Payment couldn't start: cancel the order so its stock is released.
    await transitionOrder(db, order.id, 'cancelled', { type: 'system', id: 'checkout' }, 'Payment could not be started').catch(() => {});
    console.error(JSON.stringify({ evt: 'payment_start_failed', order: order.number, error: err instanceof Error ? err.message : 'unknown' }));
    throw new HttpError(502, 'payment_unavailable', { message: 'We couldn’t start the payment. Nothing has been charged — please try again.' });
  }
});
