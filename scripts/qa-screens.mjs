/**
 * Visual + responsive QA sweep of the storefront (Playwright).
 *
 *   node scripts/qa-screens.mjs [--base=http://localhost:3000] [--mock-images] [--only=390-dark]
 *
 * Covers phones (360, 390), tablets (768, 1024), laptop (1440), large desktop
 * (1920), both themes and reduced motion. For every page: no horizontal
 * overflow, exactly one <h1>, every <img> has an alt attribute, no console
 * or page errors. Short journeys: menu, search, wishlist, enquiry and
 * callback (real submission against the running server's database).
 *
 * The purchase journey (cart → checkout → payment → order → admin) is in
 * `npm run test:e2e`, which runs on an isolated test database.
 *
 * --mock-images serves a grey test card for res.cloudinary.com, ONLY because
 * the build container cannot reach Cloudinary; it verifies layout, never
 * product imagery.
 */
import { chromium } from 'playwright';
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')).map(([k, v]) => [k, v ?? true]));
const BASE = args.base || 'http://localhost:3000';
const OUT = 'qa/screens';
await mkdir(OUT, { recursive: true });

const card = await sharp({ create: { width: 900, height: 1200, channels: 3, background: '#a8a29a' } })
  .composite([{ input: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200"><text x="450" y="610" font-family="sans-serif" font-size="44" fill="#5a554f" text-anchor="middle" letter-spacing="8">TEST IMAGE</text></svg>') }])
  .jpeg()
  .toBuffer();

const PAGES = [
  ['home', '/'],
  ['shop', '/shop'],
  ['search', '/search?q=piece'],
  ['search-empty', '/search?q=backpack'],
  ['product', '/products/no-02'],
  ['cart', '/cart'],
  ['checkout', '/checkout'],
  ['about', '/about'],
  ['editorial', '/editorial'],
  ['contact', '/contact'],
  ['faq', '/client-services'],
  ['returns', '/client-services/returns'],
  ['privacy', '/client-services/privacy'],
  ['sign-in', '/account/sign-in'],
  ['register', '/account/register'],
  ['wishlist', '/wishlist'],
  ['404', '/does-not-exist'],
];

const COMBOS = [
  { w: 360, h: 740, theme: 'light' },
  { w: 390, h: 844, theme: 'dark' },
  { w: 768, h: 1024, theme: 'light' },
  { w: 1024, h: 768, theme: 'dark' },
  { w: 1440, h: 900, theme: 'light' },
  { w: 1920, h: 1080, theme: 'dark' },
  { w: 390, h: 844, theme: 'light', reduced: true },
];

const passes = [];
const problems = [];
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

for (const c of COMBOS) {
  const tag = `${c.w}-${c.theme}${c.reduced ? '-reduced' : ''}`;
  if (args.only && args.only !== tag) continue;
  const mobile = c.w < 800;
  const ctx = await browser.newContext({ viewport: { width: c.w, height: c.h }, isMobile: mobile, hasTouch: mobile, reducedMotion: c.reduced ? 'reduce' : 'no-preference' });
  await ctx.addInitScript((t) => localStorage.setItem('maaira-theme', t), c.theme);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => m.type() === 'error' && !/preload|Failed to load resource.*(404|cloudinary)/i.test(m.text()) && errors.push(`console: ${m.text().slice(0, 160)}`));
  if (args['mock-images']) await page.route('https://res.cloudinary.com/**', (r) => r.fulfill({ status: 200, contentType: 'image/jpeg', body: card }));

  for (const [name, path] of PAGES) {
    errors.length = 0;
    await page.goto(BASE + path, { waitUntil: 'load' });
    await page.waitForTimeout(500);
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 40));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(700);
    const r = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      h1: document.querySelectorAll('h1').length,
      noAlt: [...document.querySelectorAll('img')].filter((i) => !i.hasAttribute('alt')).length,
    }));
    const issues = [];
    if (r.overflow > 0) issues.push(`horizontal overflow ${r.overflow}px`);
    if (r.h1 !== 1) issues.push(`${r.h1} <h1>`);
    if (r.noAlt) issues.push(`${r.noAlt} <img> without alt`);
    if (errors.length) issues.push(...errors);
    if (issues.length) problems.push(`[${tag}] ${path}: ${issues.join('; ')}`);
    if (['home', 'shop', 'product', 'checkout'].includes(name) || c.w === 390) await page.screenshot({ path: `${OUT}/${tag}-${name}.png`, fullPage: name !== 'home' });
  }
  passes.push(`[${tag}] ${PAGES.length}-page sweep`);

  // Menu (phones/tablets) — native dialog, focus inside, closes with Escape
  if (c.w < 1024) {
    await page.goto(BASE + '/', { waitUntil: 'load' });
    await page.getByRole('button', { name: /Menu/ }).click();
    const menu = page.getByRole('dialog', { name: 'Menu' });
    await menu.waitFor();
    const inside = await page.evaluate(() => !!document.activeElement?.closest('dialog[open]'));
    await page.keyboard.press('Escape');
    // The leather menu closes with a 0.6 s reveal-out; it must be gone after that.
    const closed = await menu.waitFor({ state: 'hidden', timeout: 1500 }).then(() => true, () => false);
    const released = await page.evaluate(() => !document.querySelector('dialog[open]'));
    if (inside && closed && released) passes.push(`[${tag}] menu: focus contained, Escape closes`);
    else problems.push(`[${tag}] menu focus/escape (inside=${inside}, closed=${closed}, released=${released})`);
  }

  // Search from the header
  await page.goto(BASE + '/', { waitUntil: 'load' });
  await page.locator('header').getByRole('button', { name: /Search/ }).click();
  await page.getByRole('searchbox', { name: 'Search bags' }).first().fill('piece');
  await page.keyboard.press('Enter');
  await page.waitForURL(/\/search\?q=piece/, { timeout: 8000 }).catch(() => {});
  if (page.url().includes('/search?q=piece')) passes.push(`[${tag}] header search → results page`);
  else problems.push(`[${tag}] header search did not navigate (${page.url()})`);

  // Wishlist (guest, this device)
  await page.goto(BASE + '/products/no-01', { waitUntil: 'load' });
  await page.getByRole('button', { name: 'Add to wishlist' }).click();
  await page.goto(BASE + '/wishlist', { waitUntil: 'load' });
  await page.waitForTimeout(800);
  if (await page.getByRole('heading', { level: 2, name: 'Piece Nº 01' }).count()) passes.push(`[${tag}] guest wishlist saved and listed`);
  else problems.push(`[${tag}] wishlist did not list the saved piece`);

  // Enquiry + callback (one viewport is enough to exercise the backend)
  if (c.w === 1440) {
    await page.goto(BASE + '/products/no-02', { waitUntil: 'load' });
    const form = page.locator('#enquire form');
    await page.waitForTimeout(1700); // the form's bot timing trap
    await form.getByLabel(/Your name/).fill('QA visual sweep');
    await form.getByRole('textbox', { name: /^Email/ }).fill('qa@example.com');
    await form.getByLabel(/Your message/).fill('Automated QA enquiry — please ignore.');
    await form.getByLabel(/I agree/).check();
    await form.getByRole('button', { name: 'Send enquiry' }).click();
    const done = await page.getByText(/your enquiry has been received/).waitFor({ timeout: 8000 }).then(() => true, () => false);
    if (done) passes.push(`[${tag}] product enquiry stored (reference shown)`);
    else problems.push(`[${tag}] product enquiry not confirmed`);

    await page.goto(BASE + '/contact?mode=callback&piece=no-01', { waitUntil: 'load' });
    await page.waitForTimeout(1700);
    const cf = page.locator('form[aria-labelledby="contact-form-title"]');
    await cf.getByLabel(/Your name/).fill('QA callback');
    await cf.getByLabel(/Phone number to call/).fill('98711 71112');
    await cf.getByRole('radio', { name: 'Evening' }).check();
    await cf.getByLabel(/I agree/).check();
    await cf.locator('button[type="submit"]').click();
    const cb = await page.getByText(/your callback request has been received/).waitFor({ timeout: 8000 }).then(() => true, () => false);
    if (cb) passes.push(`[${tag}] callback request stored (reference shown)`);
    else problems.push(`[${tag}] callback request not confirmed`);
  }
  await ctx.close();
}

await browser.close();
console.log(passes.join('\n'));
console.log(problems.length ? `\nPROBLEMS (${problems.length}):\n${problems.join('\n')}` : '\nNo problems detected.');
process.exit(problems.length ? 1 : 0);
