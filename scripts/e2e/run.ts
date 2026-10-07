/**
 * End-to-end commerce suite (Playwright + Postgres + production build).
 *
 *   npm run build && npm run test:e2e
 *
 * Runs against TEST_DATABASE_URL only, seeded with clearly labelled TEST
 * products (never real MAAIRA data). Razorpay is replaced by a local
 * stand-in for BOTH sides — the server API (RAZORPAY_API_BASE, honoured only
 * with test keys + RAZORPAY_ALLOW_TEST_API=1) and the browser checkout
 * script — so the application's real order creation, signature
 * verification, payment fetch/matching, webhook handling, stock and order
 * state code all execute. It proves our integration logic; it does not and
 * cannot prove a live Razorpay account.
 */
import { spawn, type ChildProcess } from 'node:child_process';
import { createHmac, randomBytes } from 'node:crypto';
import { createServer, type Server } from 'node:http';
import { mkdir } from 'node:fs/promises';
import { eq, sql } from 'drizzle-orm';
import { chromium, type Browser, type Page } from 'playwright';
import sharp from 'sharp';
import * as s from '../../src/db/schema';
import { createAuth } from '../../src/server/auth-config';
import { ALL_TERMS, termId } from '../../catalogue/taxonomy';
import { openTestDb, resetData } from '../../tests/helpers/db';

const PORT = 3100;
const MOCK_PORT = 3199;
const BASE = `http://localhost:${PORT}`;
const OUT = 'qa/screens/e2e';
const KEY_ID = 'rzp_test_e2eHarness';
const KEY_SECRET = randomBytes(16).toString('hex');
const WEBHOOK_SECRET = randomBytes(16).toString('hex');
const STAFF = { email: 'e2e-staff@maaira.test', password: `staff-${randomBytes(6).toString('hex')}`, name: 'E2E Staff' };

const passes: string[] = [];
const problems: string[] = [];
const ok = (m: string) => passes.push(m);
const fail = (m: string) => problems.push(m);
const check = (cond: unknown, m: string) => (cond ? ok(m) : fail(m));

// ─────────────────────────────────────────────────────────────── Stand-in Razorpay

interface MockOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
}
const mockOrders = new Map<string, MockOrder>();
const mockPayments = new Map<string, { id: string; order_id: string; amount: number; currency: string; status: string }>();
let seq = 0;

function startMockRazorpay(): Promise<Server> {
  const expectedAuth = `Basic ${Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString('base64')}`;
  const server = createServer((req, res) => {
    const send = (code: number, body: unknown) => {
      res.writeHead(code, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(body));
    };
    if (req.headers.authorization !== expectedAuth) return send(401, { error: 'auth' });
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      if (req.method === 'POST' && req.url === '/v1/orders') {
        const b = JSON.parse(raw);
        const o = { id: `order_E2E${++seq}${randomBytes(3).toString('hex')}`, amount: b.amount, currency: b.currency, receipt: b.receipt };
        mockOrders.set(o.id, o);
        return send(200, o);
      }
      const m = req.url?.match(/^\/v1\/payments\/(pay_[A-Za-z0-9]+)$/);
      if (req.method === 'GET' && m) {
        const p = mockPayments.get(m[1]);
        return p ? send(200, p) : send(404, { error: 'not found' });
      }
      send(404, { error: 'unknown' });
    });
  });
  return new Promise((r) => server.listen(MOCK_PORT, '127.0.0.1', () => r(server)));
}

/** What Razorpay Checkout would hand back to the page after a successful payment. */
function simulatePayment(orderId: string, opts: { amount?: number; status?: string } = {}) {
  const o = mockOrders.get(orderId);
  if (!o) throw new Error(`unknown mock order ${orderId}`);
  const id = `pay_E2E${++seq}${randomBytes(3).toString('hex')}`;
  mockPayments.set(id, { id, order_id: orderId, amount: opts.amount ?? o.amount, currency: o.currency, status: opts.status ?? 'captured' });
  const signature = createHmac('sha256', KEY_SECRET).update(`${orderId}|${id}`).digest('hex');
  return { razorpay_order_id: orderId, razorpay_payment_id: id, razorpay_signature: signature };
}

// The browser-side stand-in for checkout.js: asks the harness to "pay", then calls the app's handler.
const FAKE_CHECKOUT_JS = `
window.Razorpay = function (opts) {
  this.opts = opts; this.handlers = {};
};
window.Razorpay.prototype.on = function (evt, cb) { this.handlers[evt] = cb; };
window.Razorpay.prototype.open = function () {
  var self = this;
  fetch('https://api.razorpay.com/__e2e/pay?order_id=' + encodeURIComponent(self.opts.order_id) + '&mode=' + (window.__e2eMode || 'success'))
    .then(function (r) { return r.json(); })
    .then(function (resp) {
      if (resp.dismiss) return self.opts.modal && self.opts.modal.ondismiss && self.opts.modal.ondismiss();
      self.opts.handler(resp);
    });
};`;

async function preparePage(page: Page) {
  const card = await sharp({ create: { width: 900, height: 1200, channels: 3, background: '#a8a29a' } }).jpeg().toBuffer();
  await page.route('https://res.cloudinary.com/**', (r) => r.fulfill({ status: 200, contentType: 'image/jpeg', body: card }));
  await page.route('https://checkout.razorpay.com/v1/checkout.js', (r) => r.fulfill({ status: 200, contentType: 'application/javascript', body: FAKE_CHECKOUT_JS }));
  await page.route('https://api.razorpay.com/__e2e/pay**', (r) => {
    const url = new URL(r.request().url());
    const orderId = url.searchParams.get('order_id')!;
    const mode = url.searchParams.get('mode');
    if (mode === 'dismiss') return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ dismiss: true }), headers: { 'Access-Control-Allow-Origin': '*' } });
    const amount = mode === 'tamper' ? 100 : undefined;
    return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(simulatePayment(orderId, { amount })), headers: { 'Access-Control-Allow-Origin': '*' } });
  });
  page.on('pageerror', (e) => fail(`pageerror on ${new URL(page.url()).pathname}: ${e.message}`));
}

// ─────────────────────────────────────────────────────────────── Seed

async function seed(db: NonNullable<Awaited<ReturnType<typeof openTestDb>>>['db']) {
  await resetData(db);
  for (const [i, t] of ALL_TERMS.entries()) {
    await db.insert(s.taxonomyTerms).values({ id: termId(t), kind: t.kind, slug: t.slug, label: t.label, description: t.description, synonyms: t.synonyms, position: i });
  }
  const fixtures = [
    { name: 'TEST Arc Tote', colour: 'Black', price: 1_850_000, stock: 3, terms: ['style:totes', 'occasion:office-and-work', 'occasion:everyday'], rank: 1 },
    { name: 'TEST Loop Crossbody', colour: 'Tan', price: 1_250_000, stock: 5, terms: ['style:crossbody', 'occasion:everyday', 'occasion:travel'], rank: 2 },
    { name: 'TEST Nuit Clutch', colour: 'Black', price: 990_000, stock: 1, terms: ['style:clutches', 'occasion:party-and-evening'], rank: 3 },
    { name: 'TEST Draft Piece', colour: null, price: null, stock: null, terms: ['style:totes'], rank: 4 },
  ];
  const ids: Record<string, string> = {};
  for (const [i, f] of fixtures.entries()) {
    const [p] = await db
      .insert(s.products)
      .values({
        reference: `TEST-E2E-${i + 1}`,
        slug: f.name.toLowerCase().replace(/\s+/g, '-'),
        name: f.name,
        status: 'published',
        pricePaise: f.price,
        priceStatus: f.price ? 'approved' : 'pending',
        availability: f.price ? 'in_stock' : 'unconfirmed',
        trackInventory: f.stock !== null,
        stock: f.stock,
        colour: f.colour,
        featuredRank: f.rank,
        summary: 'TEST fixture — not a MAAIRA product.',
        publishedAt: new Date(Date.now() - i * 86_400_000),
      })
      .returning();
    ids[f.name] = p.id;
    for (let k = 0; k < 2; k++) {
      const assetId = `TEST-E2E-IMG-${i}-${k}`;
      await db.insert(s.mediaAssets).values({ id: assetId, cloudName: 'test', publicId: `e2e_${i}_${k}`, version: 'v1', format: 'jpg', deliveryUrl: `https://res.cloudinary.com/test/image/upload/v1/e2e_${i}_${k}.jpg`, originalFilename: `e2e_${i}_${k}.jpg`, intakeBatch: 'e2e', reviewStatus: 'assigned' });
      await db.insert(s.productImages).values({ productId: p.id, assetId, position: k, role: k === 0 ? 'primary' : 'gallery', alt: `${f.name}, view ${k + 1}` });
    }
    for (const t of f.terms) await db.insert(s.productTerms).values({ productId: p.id, termId: t, basis: 'inference', evidence: 'e2e fixture' });
  }
  await db.insert(s.storeSettings).values({ key: 'commerce', value: { checkoutEnabled: true, shippingFlatPaise: 25_000, taxMode: 'inclusive', policiesApproved: true } });
  await createAuth(db, { ...process.env, BETTER_AUTH_URL: BASE }).api.signUpEmail({ body: { email: STAFF.email, password: STAFF.password, name: STAFF.name } });
  await db.update(s.user).set({ role: 'admin' }).where(eq(s.user.email, STAFF.email));
  return ids;
}

// ─────────────────────────────────────────────────────────────── Server

function startServer(): Promise<ChildProcess> {
  const env = {
    ...process.env,
    NODE_ENV: 'production' as const,
    DATABASE_URL: process.env.TEST_DATABASE_URL!,
    BETTER_AUTH_URL: BASE,
    RAZORPAY_KEY_ID: KEY_ID,
    RAZORPAY_KEY_SECRET: KEY_SECRET,
    RAZORPAY_WEBHOOK_SECRET: WEBHOOK_SECRET,
    RAZORPAY_API_BASE: `http://127.0.0.1:${MOCK_PORT}/v1`,
    RAZORPAY_ALLOW_TEST_API: '1',
    ENQUIRY_RATE_LIMIT_MAX: '100',
    RESEND_API_KEY: '',
    EMAIL_FROM: '',
  };
  const child = spawn('node', ['node_modules/next/dist/bin/next', 'start', '-p', String(PORT)], { env, stdio: ['ignore', 'pipe', 'pipe'] });
  child.stderr?.on('data', (d) => process.env.E2E_VERBOSE && process.stderr.write(d));
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const poll = async () => {
      try {
        const r = await fetch(`${BASE}/`);
        if (r.ok) return resolve(child);
      } catch {}
      if (Date.now() - started > 30_000) return reject(new Error('server did not start'));
      setTimeout(poll, 400);
    };
    poll();
  });
}

const api = (path: string, init: RequestInit & { origin?: string | null } = {}) => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...((init.headers as Record<string, string>) ?? {}) };
  if (init.origin !== null) headers.Origin = init.origin ?? BASE;
  return fetch(BASE + path, { ...init, headers });
};

// ─────────────────────────────────────────────────────────────── Journeys

async function shopperJourney(browser: Browser, label: string, viewport: { width: number; height: number }, db: NonNullable<Awaited<ReturnType<typeof openTestDb>>>['db'], ids: Record<string, string>) {
  const mobile = viewport.width < 800;
  const ctx = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile });
  const page = await ctx.newPage();
  await preparePage(page);
  const shot = (n: string) => page.screenshot({ path: `${OUT}/${label}-${n}.png` });
  // Product cards in the listing (editorial or grid view).
  const CARDS = 'main article[aria-labelledby^="card-"]';

  // Discover: home → Explore the pieces
  await page.goto(`${BASE}/`, { waitUntil: 'load' });
  await page.getByRole('link', { name: 'Explore the pieces' }).first().click();
  await page.waitForURL('**/shop');
  const count = await page.locator(CARDS).count();
  check(count === 4, `[${label}] shop lists all 4 published bags (found ${count})`);

  // Filter: Style → Totes (combinable filters via the sheet)
  await page.getByRole('button', { name: /^Filter/ }).click();
  await page.getByRole('dialog').getByLabel('Totes').check();
  await page.getByRole('dialog').getByLabel('Black').check();
  await page.getByRole('button', { name: 'Show results' }).click();
  await page.waitForURL(/style=totes/);
  await page.waitForTimeout(400);
  const filtered = await page.locator(`${CARDS} h2`).allTextContents();
  check(filtered.length === 1 && filtered[0].includes('Arc Tote'), `[${label}] filters combine (Totes + Black → ${filtered.join(', ')})`);
  await shot('shop-filtered');
  await page.getByRole('link', { name: 'Clear all' }).click();
  await page.waitForURL(/\/shop$/);

  // Category landing page exists only for populated categories
  const cat = await page.goto(`${BASE}/shop/clutches`);
  check(cat?.status() === 200, `[${label}] populated category page /shop/clutches loads`);
  const empty = await page.goto(`${BASE}/shop/backpacks`);
  check(empty?.status() === 404, `[${label}] empty category /shop/backpacks is not exposed (404)`);

  // Search by need, with a typo
  await page.goto(`${BASE}/search?q=ofice+bag`, { waitUntil: 'load' });
  const found = await page.locator(`${CARDS} h2`).allTextContents();
  check(found.length === 1 && found[0].includes('Arc Tote'), `[${label}] search “ofice bag” (typo) finds the office tote`);
  await page.goto(`${BASE}/search?q=backpack`, { waitUntil: 'load' });
  check(await page.getByText(/don’t have backpacks/i).count(), `[${label}] no-result search explains and offers “Browse all bags”`);

  // Product page: unpurchasable piece offers an enquiry instead
  await page.goto(`${BASE}/products/test-draft-piece`, { waitUntil: 'load' });
  check((await page.getByRole('button', { name: 'Add to cart' }).count()) === 0 && (await page.getByRole('button', { name: 'Enquire about this piece' }).count()) > 0, `[${label}] price-pending piece shows Enquire, not Add to cart`);

  // Add to cart → drawer feedback → quantity → subtotal
  await page.goto(`${BASE}/products/test-loop-crossbody`, { waitUntil: 'load' });
  await page.getByRole('button', { name: 'Add to cart' }).first().click();
  const drawer = page.getByRole('dialog', { name: /Your cart/ });
  await drawer.waitFor();
  check(await drawer.getByText('Added to cart').count(), `[${label}] “Added to cart” feedback in the cart drawer`);
  await drawer.getByRole('button', { name: /Increase quantity/ }).click();
  await page.waitForTimeout(600);
  check((await drawer.getByText('₹25,000').count()) > 0, `[${label}] quantity 2 → subtotal ₹25,000 recalculated by the server`);
  await shot('cart-drawer');
  await drawer.getByRole('link', { name: 'Checkout' }).click();
  await page.waitForURL('**/checkout');

  // Checkout: validation first
  await page.getByRole('button', { name: /^Pay / }).click();
  await page.waitForTimeout(300);
  const invalid = await page.locator('[aria-invalid="true"]').count();
  check(invalid >= 5, `[${label}] checkout validation flags missing fields (${invalid})`);
  await page.getByLabel('Email').fill(`shopper-${label}@example.com`);
  await page.getByLabel('Full name').fill('E2E Shopper');
  await page.getByLabel('Mobile number').fill('98711 71112');
  await page.getByLabel('Address', { exact: true }).fill('1 Test Lane');
  await page.getByLabel('City').fill('Mumbai');
  await page.getByLabel('State / union territory').selectOption('Maharashtra');
  await page.getByLabel('PIN code').fill('400001');
  await page.getByRole('checkbox', { name: /I accept the/ }).check();
  check((await page.getByText('₹25,250').count()) > 0, `[${label}] order summary: subtotal + ₹250 delivery = ₹25,250`);
  await shot('checkout');
  await page.getByRole('button', { name: /^Pay ₹25,250/ }).click();
  await page.waitForURL(/\/orders\/MA-/, { timeout: 15_000 });
  await page.getByRole('heading', { level: 1, name: 'Paid' }).waitFor({ timeout: 10_000 }).catch(() => {});
  const heading = await page.locator('h1').textContent();
  check(heading?.trim() === 'Paid', `[${label}] payment verified server-side → order page shows “Paid” (got “${heading}”)`);
  await shot('order-paid');
  const number = new URL(page.url()).pathname.split('/').pop()!;

  const [order] = await db.select().from(s.orders).where(eq(s.orders.number, number));
  check(order?.status === 'paid' && order.totalPaise === 2_525_000, `[${label}] DB: order ${number} paid, total 2,525,000 paise`);
  const [prod] = await db.select().from(s.products).where(eq(s.products.id, ids['TEST Loop Crossbody']));
  ok(`[${label}] DB: crossbody stock now ${prod.stock}`);
  await page.waitForTimeout(800);
  const cartName = (await page.locator('header').getByRole('button', { name: /Cart/ }).textContent()) ?? '';
  check(/0 items/.test(cartName), `[${label}] header cart shows 0 items after payment (“${cartName.trim()}”)`);

  // The order page is private: another browser without the token gets a 404
  const stranger = await browser.newContext();
  const sp = await stranger.newPage();
  const res = await sp.goto(`${BASE}/orders/${number}`);
  check(res?.status() === 404, `[${label}] order page without owner session or token → 404`);
  await stranger.close();

  await ctx.close();
  return number;
}

async function tamperedPaymentJourney(browser: Browser, db: NonNullable<Awaited<ReturnType<typeof openTestDb>>>['db']) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await preparePage(page);
  await page.goto(`${BASE}/products/test-nuit-clutch`, { waitUntil: 'load' });
  await page.getByRole('button', { name: 'Add to cart' }).first().click();
  await page.getByRole('dialog', { name: /Your cart/ }).getByRole('link', { name: 'Checkout' }).click();
  await page.waitForURL('**/checkout');
  await page.getByLabel('Email').fill('tamper@example.com');
  await page.getByLabel('Full name').fill('Tamper Test');
  await page.getByLabel('Mobile number').fill('9811111111');
  await page.getByLabel('Address', { exact: true }).fill('2 Test Lane');
  await page.getByLabel('City').fill('Delhi');
  await page.getByLabel('State / union territory').selectOption('Delhi');
  await page.getByLabel('PIN code').fill('110001');
  await page.getByRole('checkbox', { name: /I accept the/ }).check();
  await page.evaluate(() => ((window as unknown as { __e2eMode: string }).__e2eMode = 'tamper'));
  await page.getByRole('button', { name: /^Pay / }).click();
  await page.waitForURL(/\/orders\/MA-/, { timeout: 15_000 });
  const number = new URL(page.url()).pathname.split('/').pop()!;
  const [order] = await db.select().from(s.orders).where(eq(s.orders.number, number));
  check(order?.status === 'pending_payment', `[tamper] a ₹1 payment for a ₹9,900 order is NOT accepted (order stays ${order?.status})`);
  const [clutch] = await db.select().from(s.products).where(eq(s.products.slug, 'test-nuit-clutch'));
  check(clutch.stock === 0, '[tamper] the last clutch stays reserved for the unpaid order (no oversell)');
  await ctx.close();
  return { order };
}

async function accountJourney(browser: Browser, ids: Record<string, string>, db: NonNullable<Awaited<ReturnType<typeof openTestDb>>>['db']) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await preparePage(page);
  // Guest wishlist, then register → it moves into the account
  await page.goto(`${BASE}/products/test-arc-tote`, { waitUntil: 'load' });
  await page.getByRole('button', { name: 'Add to wishlist' }).click();
  await page.goto(`${BASE}/account/register`, { waitUntil: 'load' });
  const email = `member-${Date.now()}@example.com`;
  await page.getByLabel('Full name').fill('E2E Member');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill('a-strong-pass-123');
  await page.getByLabel('Confirm password').fill('a-strong-pass-123');
  await page.getByRole('button', { name: 'Create account' }).click();
  await page.waitForURL('**/account');
  check(await page.getByRole('heading', { name: /Hello, E2E/ }).count(), '[account] registration signs in and opens the account page');
  await page.waitForTimeout(800);
  const [u] = await db.select().from(s.user).where(eq(s.user.email, email));
  check(u?.role === 'customer', '[account] new accounts are customers (role not settable at sign-up)');
  const saved = await db.select().from(s.wishlistItems).where(eq(s.wishlistItems.userId, u.id));
  check(saved.some((w) => w.productId === ids['TEST Arc Tote']), '[account] guest wishlist moved into the account on sign-in');
  // Customers can't see the admin
  const adm = await page.goto(`${BASE}/admin`);
  check(adm?.status() === 404, '[account] a signed-in customer gets 404 for /admin');
  await ctx.close();
}

async function staffJourney(browser: Browser, orderNumber: string, db: NonNullable<Awaited<ReturnType<typeof openTestDb>>>['db']) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await preparePage(page);
  const r = await page.goto(`${BASE}/admin/orders`);
  check(page.url().endsWith('/admin/sign-in'), `[staff] signed-out /admin/orders redirects to staff sign-in (${r?.status()})`);
  await page.getByLabel('Email').fill(STAFF.email);
  await page.getByLabel('Password').fill(STAFF.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL(`${BASE}/admin`);
  check(await page.getByText('Checkout is open to customers.').count(), '[staff] overview shows checkout readiness');
  await page.goto(`${BASE}/admin/orders?status=paid`);
  await page.getByRole('link', { name: orderNumber }).click();
  await page.getByLabel(/^Move to/).selectOption('processing');
  await page.getByLabel(/Note/).fill('Packed by E2E');
  await page.getByRole('button', { name: 'Update status' }).click();
  await page.getByText('Status updated.').waitFor({ timeout: 5000 }).catch(() => {});
  const [o] = await db.select().from(s.orders).where(eq(s.orders.number, orderNumber));
  check(o.status === 'processing', '[staff] order moved paid → processing via the state machine');
  const audits = await db.select().from(s.auditLog).where(eq(s.auditLog.action, 'order.status'));
  check(audits.some((a) => a.targetId === o.id && a.actorEmail === STAFF.email), '[staff] status change recorded in the audit log with the actor');
  await page.screenshot({ path: `${OUT}/staff-order.png` });
  // Product editor: approving a price needs explicit confirmation
  await page.goto(`${BASE}/admin/products`);
  await page.getByRole('link', { name: 'TEST Draft Piece' }).click();
  await page.getByLabel(/^Price \(₹/).fill('15000');
  await page.getByLabel(/^Price status/).selectOption('approved');
  await page.getByRole('button', { name: 'Save product' }).click();
  await page.getByText('Confirm the business has approved this price.').waitFor({ timeout: 5000 }).catch(() => {});
  check(await page.getByText('Confirm the business has approved this price.').count(), '[staff] approving a price requires explicit confirmation');
  await page.screenshot({ path: `${OUT}/staff-product.png`, fullPage: true });
  await ctx.close();
}

async function probes(db: NonNullable<Awaited<ReturnType<typeof openTestDb>>>['db'], ids: Record<string, string>, paidNumber: string) {
  // Price/parameter tampering: the checkout schema is strict.
  const tampered = await api('/api/checkout', { method: 'POST', body: JSON.stringify({ email: 'x@example.com', totalPaise: 100, address: {}, acceptTerms: true, idempotencyKey: 'abcdefghijklmnop' }) });
  check(tampered.status === 400, `[probe] checkout with an injected totalPaise field → 400 (${tampered.status})`);
  const qty = await api('/api/cart', { method: 'POST', body: JSON.stringify({ productId: ids['TEST Arc Tote'], quantity: 11 }) });
  check(qty.status === 400, `[probe] cart quantity 11 → 400 (${qty.status})`);
  const neg = await api('/api/cart', { method: 'POST', body: JSON.stringify({ productId: ids['TEST Arc Tote'], quantity: -5 }) });
  check(neg.status === 400, `[probe] cart quantity -5 → 400 (${neg.status})`);
  const draft = await api('/api/cart', { method: 'POST', body: JSON.stringify({ productId: ids['TEST Draft Piece'], quantity: 1 }) });
  check(draft.status === 409, `[probe] adding a price-pending product → 409 (${draft.status})`);
  const price = await api('/api/cart', { method: 'POST', body: JSON.stringify({ productId: ids['TEST Arc Tote'], quantity: 1, pricePaise: 1 }) });
  check(price.status === 400, `[probe] cart request carrying a price field → 400 (${price.status})`);
  const noOrigin = await api('/api/cart', { method: 'POST', origin: null, body: JSON.stringify({ productId: ids['TEST Arc Tote'], quantity: 1 }) });
  check(noOrigin.status === 403, `[probe] cart POST without Origin/Referer (CSRF) → 403 (${noOrigin.status})`);
  const evil = await api('/api/cart', { method: 'POST', origin: 'https://evil.example', body: JSON.stringify({ productId: ids['TEST Arc Tote'], quantity: 1 }) });
  check(evil.status === 403, `[probe] cross-site cart POST → 403 (${evil.status})`);
  const form = await fetch(`${BASE}/api/enquiries`, { method: 'POST', headers: { Origin: BASE, 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'a=b' });
  check(form.status === 415, `[probe] form-encoded enquiry → 415 (${form.status})`);
  const wish = await api('/api/wishlist');
  check(wish.status === 401, `[probe] wishlist API without a session → 401 (${wish.status})`);
  const lookup = await fetch(`${BASE}/api/products/lookup?ids=${ids['TEST Arc Tote']},not-a-uuid`);
  check(lookup.status === 400, `[probe] product lookup with malformed ids → 400 (${lookup.status})`);

  // Payment verification
  const badSig = await api('/api/checkout/verify', { method: 'POST', body: JSON.stringify({ razorpay_order_id: 'order_X1', razorpay_payment_id: 'pay_X1', razorpay_signature: 'a'.repeat(64) }) });
  check(badSig.status === 400, `[probe] verify with a forged signature → 400 (${badSig.status})`);

  // Webhooks: signature + replay protection
  const [paid] = await db.select().from(s.orders).where(eq(s.orders.number, paidNumber));
  const payId = [...mockPayments.values()].find((p) => p.order_id === paid.providerOrderId)!.id;
  const body = JSON.stringify({ event: 'payment.captured', payload: { payment: { entity: { id: payId, order_id: paid.providerOrderId, amount: paid.totalPaise, currency: 'INR', status: 'captured' } } } });
  const sig = createHmac('sha256', WEBHOOK_SECRET).update(body).digest('hex');
  const hook = (signature: string, eventId: string) => fetch(`${BASE}/api/webhooks/razorpay`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Razorpay-Signature': signature, 'X-Razorpay-Event-Id': eventId }, body });
  const forged = await hook('0'.repeat(64), 'evt_forged');
  check(forged.status === 400, `[probe] webhook with a bad signature → 400 (${forged.status})`);
  const first = await (await hook(sig, 'evt_e2e_1')).json();
  const replay = await (await hook(sig, 'evt_e2e_1')).json();
  check(first.ok && replay.duplicate === true, '[probe] replayed webhook event is acknowledged once and ignored');
  const events = await db.select().from(s.orderEvents).where(eq(s.orderEvents.orderId, paid.id));
  check(events.filter((e) => e.toStatus === 'paid').length === 1, '[probe] duplicate payment notifications never double-apply');

  // Admin surfaces without a session
  const adminApi = await fetch(`${BASE}/admin/orders`, { redirect: 'manual' });
  check([307, 308].includes(adminApi.status), `[probe] /admin/orders without a session → redirect to sign-in (${adminApi.status})`);
  const cron = await fetch(`${BASE}/api/cron/expire-orders`);
  check(cron.status === 401, `[probe] cron endpoint without the secret → 401 (${cron.status})`);
  const [{ n }] = await db.execute<{ n: number }>(sql`select count(*)::int as n from orders where total_paise <> subtotal_paise + shipping_paise + tax_paise`);
  check(n === 0, '[probe] DB constraint: every order total = subtotal + delivery + tax');
}

async function main() {
  const ctx = await openTestDb();
  if (!ctx) throw new Error('TEST_DATABASE_URL is required for the e2e suite');
  await mkdir(OUT, { recursive: true });
  const ids = await seed(ctx.db);
  const mock = await startMockRazorpay();
  const server = await startServer();
  const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium' });
  try {
    const n1 = await shopperJourney(browser, 'desktop', { width: 1440, height: 900 }, ctx.db, ids);
    await shopperJourney(browser, 'mobile', { width: 390, height: 844 }, ctx.db, ids);
    await tamperedPaymentJourney(browser, ctx.db);
    await accountJourney(browser, ids, ctx.db);
    await staffJourney(browser, n1, ctx.db);
    await probes(ctx.db, ids, n1);
  } catch (err) {
    fail(`suite aborted: ${err instanceof Error ? err.message : String(err)}`);
  } finally {
    await browser.close();
    server.kill();
    mock.close();
    await ctx.close();
  }
  console.log(passes.map((p) => `✓ ${p}`).join('\n'));
  if (problems.length) {
    console.log(`\n✗ ${problems.length} problem(s):\n${problems.map((p) => `  - ${p}`).join('\n')}`);
    process.exit(1);
  }
  console.log(`\nAll ${passes.length} checks passed.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
