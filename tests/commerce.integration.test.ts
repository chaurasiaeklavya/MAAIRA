import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac, randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import * as s from '../src/db/schema';
import { addItem, CartError, createCart, findCartId, hashToken, mergeGuestCart, newToken, setQuantity, viewCart } from '../src/server/commerce/cart-repo';
import {
  applyVerifiedPayment,
  attachProviderOrder,
  createOrder,
  expireUnpaidOrders,
  findOrderForCustomer,
  listOrdersForUser,
  OrderError,
  transitionOrder,
} from '../src/server/commerce/orders-repo';
import { apiBase, verifyPaymentSignature, verifyWebhookSignature } from '../src/server/commerce/razorpay';
import { checkoutReadiness, DEFAULT_SETTINGS, type CommerceSettings } from '../src/server/commerce/settings';
import { hit } from '../src/server/rate-limit-db';
import { openTestDb, resetData, testDatabaseUrl, testProduct } from './helpers/db';

const SETTINGS: CommerceSettings = { checkoutEnabled: true, shippingFlatPaise: 25_000, taxMode: 'inclusive', policiesApproved: true };
const ADDRESS = { fullName: 'Test Customer', phone: '+919871171112', line1: '1 Test Road', line2: '', city: 'Delhi', state: 'Delhi' as const, postalCode: '110001' };

describe('commerce (Postgres integration)', { skip: !testDatabaseUrl() && 'TEST_DATABASE_URL not set' }, () => {
  let ctx: Awaited<ReturnType<typeof openTestDb>>;
  let db: NonNullable<typeof ctx>['db'];
  before(async () => {
    ctx = await openTestDb();
    db = ctx!.db;
  });
  after(() => ctx?.close());
  beforeEach(() => resetData(db));

  async function cartWith(productId: string, qty: number) {
    const cartId = await createCart(db, hashToken(newToken()), null);
    await addItem(db, cartId, productId, qty);
    return cartId;
  }

  test('cart refuses unpurchasable pieces (price pending, unpublished, unconfirmed)', async () => {
    const pending = await testProduct(db, { pricePaise: null, priceStatus: 'pending' });
    const draft = await testProduct(db, { status: 'draft' });
    const unconfirmed = await testProduct(db, { availability: 'unconfirmed' });
    const cartId = await createCart(db, hashToken(newToken()), null);
    for (const p of [pending, draft, unconfirmed]) {
      await assert.rejects(addItem(db, cartId, p.id, 1), (e: unknown) => e instanceof CartError && e.code === 'not_purchasable');
    }
  });

  test('cart validates quantity and stock; totals come from the database', async () => {
    const p = await testProduct(db, { stock: 3 });
    const cartId = await createCart(db, hashToken(newToken()), null);
    await assert.rejects(addItem(db, cartId, p.id, 0), CartError);
    await assert.rejects(addItem(db, cartId, p.id, 11), CartError);
    await assert.rejects(addItem(db, cartId, p.id, 4), (e: unknown) => e instanceof CartError && e.code === 'stock');
    await addItem(db, cartId, p.id, 2);
    let view = await viewCart(db, cartId);
    assert.equal(view.subtotalPaise, 2_500_000);
    assert.equal(view.checkoutable, true);
    // A later price change is reflected immediately — the cart never stores prices.
    await db.update(s.products).set({ pricePaise: 1_000_000 }).where(eq(s.products.id, p.id));
    view = await viewCart(db, cartId);
    assert.equal(view.subtotalPaise, 2_000_000);
    // If the piece is unpublished, it's flagged and excluded from the subtotal.
    await db.update(s.products).set({ status: 'draft' }).where(eq(s.products.id, p.id));
    view = await viewCart(db, cartId);
    assert.equal(view.subtotalPaise, 0);
    assert.equal(view.checkoutable, false);
    assert.ok(view.lines[0].issue);
    await assert.rejects(setQuantity(db, cartId, randomUUID(), 1), CartError);
  });

  test('a signed-in cart is not reachable by another account’s token lookup', async () => {
    await db.insert(s.user).values([{ id: 'u1', name: 'A', email: 'a@test.local' }, { id: 'u2', name: 'B', email: 'b@test.local' }]);
    const token = newToken();
    const cartId = await createCart(db, hashToken(token), 'u1');
    assert.equal(await findCartId(db, { tokenHash: hashToken(token), userId: 'u1' }), cartId);
    assert.equal(await findCartId(db, { tokenHash: hashToken(token), userId: 'u2' }), null);
  });

  test('guest cart merges into the account cart on sign-in', async () => {
    await db.insert(s.user).values({ id: 'u1', name: 'A', email: 'a@test.local' });
    const p = await testProduct(db);
    const guestToken = newToken();
    const guestId = await createCart(db, hashToken(guestToken), null);
    await addItem(db, guestId, p.id, 2);
    const ownId = await createCart(db, hashToken(newToken()), 'u1');
    await addItem(db, ownId, p.id, 1);
    await mergeGuestCart(db, hashToken(guestToken), 'u1');
    const view = await viewCart(db, ownId);
    assert.equal(view.lines[0].quantity, 2);
    assert.equal(await findCartId(db, { tokenHash: hashToken(guestToken) }), null);
  });

  test('order totals are server-computed, stock is reserved, and retries are idempotent', async () => {
    const p = await testProduct(db, { stock: 2 });
    const cartId = await cartWith(p.id, 2);
    const key = `idem-${randomUUID()}`;
    const order = await createOrder(db, { cartId, userId: null, email: 'c@test.local', address: ADDRESS, idempotencyKey: key, settings: SETTINGS });
    assert.equal(order.totalPaise, 2 * 1_250_000 + 25_000);
    const [after] = await db.select().from(s.products).where(eq(s.products.id, p.id));
    assert.equal(after.stock, 0);
    const again = await createOrder(db, { cartId, userId: null, email: 'c@test.local', address: ADDRESS, idempotencyKey: key, settings: SETTINGS });
    assert.equal(again.id, order.id);
    assert.equal(again.existing, true);
    const orders = await db.select().from(s.orders);
    assert.equal(orders.length, 1);
  });

  test('two concurrent checkouts cannot oversell the last piece', async () => {
    const p = await testProduct(db, { stock: 1 });
    const a = await cartWith(p.id, 1);
    const b = await cartWith(p.id, 1);
    const results = await Promise.allSettled([
      createOrder(db, { cartId: a, userId: null, email: 'a@test.local', address: ADDRESS, idempotencyKey: `k-${randomUUID()}`, settings: SETTINGS }),
      createOrder(db, { cartId: b, userId: null, email: 'b@test.local', address: ADDRESS, idempotencyKey: `k-${randomUUID()}`, settings: SETTINGS }),
    ]);
    assert.equal(results.filter((r) => r.status === 'fulfilled').length, 1);
    const rejected = results.find((r) => r.status === 'rejected') as PromiseRejectedResult;
    assert.ok(rejected.reason instanceof OrderError && ['stock', 'unavailable'].includes(rejected.reason.code));
    const [row] = await db.select().from(s.products).where(eq(s.products.id, p.id));
    assert.equal(row.stock, 0);
  });

  test('checkout is refused until shipping and tax are configured', async () => {
    const p = await testProduct(db);
    const cartId = await cartWith(p.id, 1);
    await assert.rejects(
      createOrder(db, { cartId, userId: null, email: 'c@test.local', address: ADDRESS, idempotencyKey: `k-${randomUUID()}`, settings: DEFAULT_SETTINGS }),
      (e: unknown) => e instanceof OrderError && e.code === 'not_ready',
    );
    const r = checkoutReadiness(DEFAULT_SETTINGS, false);
    assert.equal(r.ready, false);
    assert.deepEqual(r.blockers.map((b) => b.key), ['payments', 'shipping', 'tax', 'policies', 'switch']);
    assert.equal(checkoutReadiness(SETTINGS, true).ready, true);
  });

  test('payments: mismatched amount is rejected; duplicates are no-ops; cart cleared on success', async () => {
    const p = await testProduct(db);
    const cartId = await cartWith(p.id, 1);
    const order = await createOrder(db, { cartId, userId: null, email: 'c@test.local', address: ADDRESS, idempotencyKey: `k-${randomUUID()}`, settings: SETTINGS });
    await attachProviderOrder(db, order.id, 'razorpay', 'order_TEST123', order.totalPaise);
    await assert.rejects(
      applyVerifiedPayment(db, { providerOrderId: 'order_TEST123', paymentId: 'pay_LOW', amountPaise: 100, currency: 'INR', status: 'captured' }),
      (e: unknown) => e instanceof OrderError && e.code === 'mismatch',
    );
    let [o] = await db.select().from(s.orders).where(eq(s.orders.id, order.id));
    assert.equal(o.status, 'pending_payment');
    const ok = { providerOrderId: 'order_TEST123', paymentId: 'pay_OK1', amountPaise: order.totalPaise, currency: 'INR', status: 'captured' };
    assert.equal((await applyVerifiedPayment(db, ok)).status, 'paid');
    assert.equal((await applyVerifiedPayment(db, ok)).status, 'paid');
    [o] = await db.select().from(s.orders).where(eq(s.orders.id, order.id));
    assert.equal(o.status, 'paid');
    const events = await db.select().from(s.orderEvents).where(eq(s.orderEvents.orderId, order.id));
    assert.equal(events.filter((e) => e.toStatus === 'paid').length, 1, 'paid recorded once');
    assert.equal((await viewCart(db, cartId)).lines.length, 0);
    // A failure arriving after success does not undo the payment.
    await applyVerifiedPayment(db, { ...ok, paymentId: 'pay_LATE', status: 'failed' });
    [o] = await db.select().from(s.orders).where(eq(s.orders.id, order.id));
    assert.equal(o.status, 'paid');
  });

  test('unpaid orders expire and release their stock', async () => {
    const p = await testProduct(db, { stock: 1 });
    const cartId = await cartWith(p.id, 1);
    const order = await createOrder(db, { cartId, userId: null, email: 'c@test.local', address: ADDRESS, idempotencyKey: `k-${randomUUID()}`, settings: SETTINGS });
    await db.update(s.orders).set({ expiresAt: new Date(Date.now() - 1000) }).where(eq(s.orders.id, order.id));
    assert.equal(await expireUnpaidOrders(db), 1);
    const [o] = await db.select().from(s.orders).where(eq(s.orders.id, order.id));
    assert.equal(o.status, 'cancelled');
    const [prod] = await db.select().from(s.products).where(eq(s.products.id, p.id));
    assert.equal(prod.stock, 1);
    const moves = await db.select().from(s.inventoryMovements).where(eq(s.inventoryMovements.productId, p.id));
    assert.deepEqual(moves.map((m) => m.reason).sort(), ['release', 'reserve']);
  });

  test('order state machine blocks invalid staff transitions', async () => {
    const p = await testProduct(db);
    const cartId = await cartWith(p.id, 1);
    const order = await createOrder(db, { cartId, userId: null, email: 'c@test.local', address: ADDRESS, idempotencyKey: `k-${randomUUID()}`, settings: SETTINGS });
    await assert.rejects(transitionOrder(db, order.id, 'shipped', { type: 'staff', id: 'staff1' }), OrderError);
    await assert.rejects(transitionOrder(db, order.id, 'paid', { type: 'staff', id: 'staff1' }), OrderError, 'staff cannot mark paid');
  });

  test('customers can only see their own orders (no IDOR via order number)', async () => {
    await db.insert(s.user).values([{ id: 'u1', name: 'A', email: 'a@test.local' }, { id: 'u2', name: 'B', email: 'b@test.local' }]);
    const p = await testProduct(db);
    const cartId = await cartWith(p.id, 1);
    const order = await createOrder(db, { cartId, userId: 'u1', email: 'a@test.local', address: ADDRESS, idempotencyKey: `k-${randomUUID()}`, settings: SETTINGS });
    assert.ok(await findOrderForCustomer(db, order.number, { userId: 'u1' }));
    assert.ok(await findOrderForCustomer(db, order.number, { token: order.accessToken }));
    assert.equal(await findOrderForCustomer(db, order.number, { userId: 'u2' }), null);
    assert.equal(await findOrderForCustomer(db, order.number, {}), null);
    assert.equal(await findOrderForCustomer(db, order.number, { token: 'guess' }), null);
    const mine = await listOrdersForUser(db, 'u1');
    assert.equal(mine.length, 1);
    assert.equal(mine[0].itemCount, 1, 'item count comes from this order’s own lines');
    assert.deepEqual(await listOrdersForUser(db, 'u2'), []);
  });

  test('database rate limiter counts across calls and resets after the window', async () => {
    const key = `test:${randomUUID()}`;
    for (let i = 0; i < 3; i++) assert.equal((await hit(db, key, 3, 60)).allowed, true);
    const blocked = await hit(db, key, 3, 60);
    assert.equal(blocked.allowed, false);
    assert.ok(blocked.retryAfterSec > 0 && blocked.retryAfterSec <= 60);
    await db.update(s.rateLimitBuckets).set({ windowStart: new Date(Date.now() - 61_000) }).where(eq(s.rateLimitBuckets.key, key));
    assert.equal((await hit(db, key, 3, 60)).allowed, true);
  });
});

test('Razorpay signatures: valid passes, tampered fails (constant-time compare)', () => {
  const secret = 'test_secret_not_real';
  const sig = createHmac('sha256', secret).update('order_A|pay_B').digest('hex');
  assert.equal(verifyPaymentSignature({ orderId: 'order_A', paymentId: 'pay_B', signature: sig }, secret), true);
  assert.equal(verifyPaymentSignature({ orderId: 'order_A', paymentId: 'pay_C', signature: sig }, secret), false);
  assert.equal(verifyPaymentSignature({ orderId: 'order_A', paymentId: 'pay_B', signature: 'x' }, secret), false);
  const body = JSON.stringify({ event: 'payment.captured' });
  const wsig = createHmac('sha256', 'whsec').update(body).digest('hex');
  assert.equal(verifyWebhookSignature(body, wsig, 'whsec'), true);
  assert.equal(verifyWebhookSignature(body + ' ', wsig, 'whsec'), false);
  assert.equal(verifyWebhookSignature(body, null, 'whsec'), false);
});

test('Razorpay API override is ignored for live keys or without explicit opt-in', () => {
  const live = { keyId: 'rzp_live_abc', keySecret: 'x', webhookSecret: null };
  const test_ = { keyId: 'rzp_test_abc', keySecret: 'x', webhookSecret: null };
  const env = { RAZORPAY_API_BASE: 'http://127.0.0.1:3199/v1', RAZORPAY_ALLOW_TEST_API: '1' };
  assert.equal(apiBase(live, env), 'https://api.razorpay.com/v1');
  assert.equal(apiBase(test_, { RAZORPAY_API_BASE: env.RAZORPAY_API_BASE }), 'https://api.razorpay.com/v1');
  assert.equal(apiBase(test_, { ...env, RAZORPAY_API_BASE: 'https://evil.example/v1' }), 'https://api.razorpay.com/v1');
  assert.equal(apiBase(test_, env), 'http://127.0.0.1:3199/v1');
});
