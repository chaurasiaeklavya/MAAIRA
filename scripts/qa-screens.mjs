/**
 * End-to-end QA: page sweep (screenshots, console errors, horizontal overflow)
 * plus interaction journeys across viewports and both themes.
 *
 *   node scripts/qa-screens.mjs [--base=http://localhost:3000] [--mock-images] [--only=desktop-dark|reduced]
 *
 * Journeys that submit forms expect the server to run with an enquiry store
 * (e.g. ENQUIRY_STORE=file); results are checked against .data/enquiries.jsonl.
 *
 * --mock-images serves a neutral grey test card for res.cloudinary.com
 * requests. It exists ONLY because the build container cannot reach
 * Cloudinary; it verifies layout, never product imagery.
 */
import { chromium } from 'playwright';
import sharp from 'sharp';
import { mkdir, readFile } from 'node:fs/promises';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  }),
);
const BASE = args.base || 'http://localhost:3000';
const OUT = 'qa/screens';
const STORE_FILE = '.data/enquiries.jsonl';
await mkdir(OUT, { recursive: true });

const testCard = await sharp({ create: { width: 900, height: 1200, channels: 3, background: '#9a948c' } })
  .composite([
    {
      input: Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b8b2aa"/><stop offset="1" stop-color="#7d776f"/></linearGradient></defs><rect width="900" height="1200" fill="url(#g)"/><text x="450" y="610" font-family="sans-serif" font-size="44" fill="#5a554f" text-anchor="middle" letter-spacing="8">TEST IMAGE</text></svg>`,
      ),
    },
  ])
  .jpeg({ quality: 80 })
  .toBuffer();

const VIEWPORTS = {
  desktop: { width: 1440, height: 900, isMobile: false, hasTouch: false },
  tablet: { width: 834, height: 1112, isMobile: true, hasTouch: true },
  mobile: { width: 390, height: 844, isMobile: true, hasTouch: true },
};

const PAGES = [
  ['home', '/'],
  ['shop', '/shop'],
  ['pdp', '/shop/no-02'],
  ['house', '/house'],
  ['editorial', '/editorial'],
  ['contact', '/contact'],
  ['services', '/client-services'],
  ['privacy', '/client-services/privacy'],
  ['404', '/does-not-exist'],
];

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});

const problems = [];
const passes = [];
const ok = (tag, msg) => passes.push(`[${tag}] ${msg}`);
const fail = (tag, msg) => problems.push(`[${tag}] ${msg}`);

async function storedRecords() {
  try {
    return (await readFile(STORE_FILE, 'utf8')).split('\n').filter(Boolean).map((l) => JSON.parse(l));
  } catch {
    return [];
  }
}

async function scrollThrough(page) {
  await page.evaluate(async () => {
    const h = document.documentElement.scrollHeight;
    for (let y = 0; y < h; y += Math.round(window.innerHeight * 0.8)) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 90));
    }
  });
}

async function run(vpName, theme, { reducedMotion = false } = {}) {
  const vp = VIEWPORTS[vpName];
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    isMobile: vp.isMobile,
    hasTouch: vp.hasTouch,
    reducedMotion: reducedMotion ? 'reduce' : 'no-preference',
  });
  await ctx.addInitScript((t) => {
    if (!sessionStorage.getItem('qa-seeded')) {
      localStorage.setItem('maaira-theme', t);
      localStorage.removeItem('maaira-sound');
      sessionStorage.setItem('qa-seeded', '1');
    }
  }, theme);
  const page = await ctx.newPage();
  const tag = `${vpName}-${theme}${reducedMotion ? '-reduced' : ''}`;
  page.on('console', (m) => {
    const t = m.text();
    if (m.type() !== 'error') return;
    if (/res\.cloudinary\.com/.test(t)) return;
    // 404 for the intentional not-found page is expected.
    if (/404 \(Not Found\)/.test(t) && page.url().includes('does-not-exist')) return;
    fail(tag, `console.error on ${new URL(page.url()).pathname}: ${t.slice(0, 160)}`);
  });
  page.on('pageerror', (e) => fail(tag, `pageerror on ${new URL(page.url()).pathname}: ${e.message}`));
  if (args['mock-images']) {
    await page.route('https://res.cloudinary.com/**', (route) => route.fulfill({ status: 200, contentType: 'image/jpeg', body: testCard }));
  }

  // ---------- page sweep ----------
  for (const [name, path] of PAGES) {
    await page.goto(BASE + path, { waitUntil: 'load' });
    await page.waitForTimeout(name === 'home' ? 2600 : 1400);
    await page.screenshot({ path: `${OUT}/${tag}-${name}.png` });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 0) fail(tag, `horizontal overflow on ${path}: ${overflow}px`);
    const h1 = await page.locator('h1').count();
    if (h1 !== 1) fail(tag, `${path} has ${h1} <h1> elements`);
    if (name === 'home' && !reducedMotion) {
      await scrollThrough(page);
      const study = await page.locator('section[aria-labelledby="study-title"]').count();
      if (!study) fail(tag, 'campaign study missing on home');
    }
  }
  ok(tag, `page sweep (${PAGES.length} routes)`);

  // ---------- hero stamp ----------
  await page.goto(BASE + '/', { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  const stamp = await page.evaluate(() => document.querySelector('section[aria-labelledby="hero-title"]')?.dataset.stamp ?? null);
  if (stamp === 'on') ok(tag, 'hero monogram heat-stamped in WebGL');
  else fail(tag, `hero stamp not active (data-stamp=${stamp}) — DOM fallback shown`);

  // ---------- hero CTA → shop ----------
  await page.getByRole('link', { name: 'Explore the pieces' }).first().click();
  await page.waitForURL('**/shop', { timeout: 8000 }).catch(() => fail(tag, 'hero CTA did not navigate to /shop'));
  await page.waitForTimeout(1200);

  // ---------- quick view ----------
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(800);
  const quick = page.getByRole('button', { name: /Quick view/ }).first();
  await quick.focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1500);
  if (!page.url().includes('piece=')) fail(tag, `quick view did not update URL (${page.url()})`);
  const focused = await page.evaluate(() => document.activeElement?.textContent?.trim());
  if (!focused?.includes('Close quick view')) fail(tag, `quick view focus not on close (got ${focused})`);
  await page.screenshot({ path: `${OUT}/${tag}-quickview.png` });
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(700);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1600);
  if (await page.locator('[role="dialog"]').count()) fail(tag, 'quick view still open after Escape');
  const back = await page.evaluate(() => document.activeElement?.textContent?.trim());
  if (!back?.includes('Quick view')) fail(tag, `focus not returned to Quick view trigger (got ${back})`);
  else ok(tag, 'quick view: open, URL sync, focus, arrows, Escape, focus return');

  // ---------- view toggle ----------
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.getByRole('button', { name: 'Grid' }).click();
  await page.waitForTimeout(2200); // crossfade + card reveal settle
  if ((await page.getByRole('button', { name: 'Grid' }).getAttribute('aria-pressed')) !== 'true') fail(tag, 'grid view toggle failed');
  await page.screenshot({ path: `${OUT}/${tag}-shop-grid.png` });

  // ---------- card → product page ----------
  await page.getByRole('link', { name: 'Piece Nº 02' }).first().click();
  await page.waitForURL('**/shop/no-02', { timeout: 8000 }).catch(() => fail(tag, 'card link did not open /shop/no-02'));
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/${tag}-pdp-top.png` });
  const thumbs = page.getByRole('button', { name: /^Show Piece/ });
  if ((await thumbs.count()) !== 3) fail(tag, `expected 3 thumbnails on no-02, got ${await thumbs.count()}`);
  await thumbs.nth(1).click();
  await page.waitForTimeout(800);
  if ((await thumbs.nth(1).getAttribute('aria-current')) !== 'true') fail(tag, 'PDP thumbnail selection failed');
  await page.locator('[aria-roledescription="carousel"]').focus();
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(800);
  if ((await thumbs.nth(2).getAttribute('aria-current')) !== 'true') fail(tag, 'PDP arrow-key navigation failed');
  else ok(tag, 'product page gallery: thumbnails + arrow keys');

  if (vp.hasTouch) {
    const box = await page.locator('[aria-roledescription="carousel"]').boundingBox();
    if (box) {
      const cdp = await ctx.newCDPSession(page);
      const y = Math.round(box.y + box.height / 2);
      const x0 = Math.round(box.x + box.width * 0.8);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y }] });
      for (let i = 1; i <= 10; i++) {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 - i * Math.round(box.width * 0.06), y }] });
        await page.waitForTimeout(16);
      }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await page.waitForTimeout(900);
      if ((await thumbs.nth(0).getAttribute('aria-current')) !== 'true') fail(tag, 'touch swipe did not advance PDP gallery');
      else ok(tag, 'touch swipe on product gallery');
    }
  }

  // ---------- enquiry: validation then real submission ----------
  await page.getByRole('button', { name: 'Enquire about this piece' }).click();
  await page.waitForTimeout(1600);
  const form = page.locator('#enquire form');
  await form.getByRole('button', { name: 'Send enquiry' }).click();
  await page.waitForTimeout(500);
  const invalid = await form.locator('[aria-invalid="true"]').count();
  const activeInvalid = await page.evaluate(() => document.activeElement?.getAttribute('aria-invalid'));
  if (invalid < 3 || activeInvalid !== 'true') fail(tag, `validation: ${invalid} invalid fields, focus on invalid=${activeInvalid}`);
  else ok(tag, 'form validation: errors shown, focus moved to first invalid field');
  await page.waitForTimeout(1600); // past the bot timing trap
  const before = (await storedRecords()).length;
  await form.getByLabel(/Your name/).fill(`QA ${tag}`);
  await form.getByRole('textbox', { name: /^Email/ }).fill('qa@example.com');
  await form.getByLabel(/Your message/).fill('Automated QA enquiry — please ignore. Checking end-to-end delivery.');
  await form.getByLabel(/I agree/).check();
  if ((await form.getByLabel('Piece').inputValue()) !== 'mfb-sample-02') fail(tag, 'piece not preselected on product page form');
  await form.getByRole('button', { name: 'Send enquiry' }).click();
  const success = page.getByText(/your enquiry has been received/);
  await success.waitFor({ timeout: 8000 }).catch(() => {});
  if (await success.count()) {
    const ref = await page.locator('#enquire strong').first().textContent();
    const after = await storedRecords();
    const rec = after.find((r) => r.id === ref?.trim());
    if (after.length !== before + 1 || !rec || rec.pieceId !== 'mfb-sample-02') fail(tag, `server record mismatch for ${ref}`);
    else ok(tag, `enquiry submitted and persisted (${ref?.trim()})`);
    await page.waitForTimeout(1800); // scroll-into-view + fade settle
    const box = await page.locator('#enquire [role="status"]').first().boundingBox();
    if (!box || box.y < 70 || box.y + box.height > page.viewportSize().height) fail(tag, `success panel not fully in view (${JSON.stringify(box)})`);
    else ok(tag, 'success panel scrolled fully into view, clear of the header');
    await page.screenshot({ path: `${OUT}/${tag}-enquiry-success.png` });
  } else {
    fail(tag, 'enquiry success state not shown');
  }

  // ---------- callback via contact page ----------
  await page.goto(BASE + '/contact?mode=callback&piece=no-01', { waitUntil: 'load' });
  await page.waitForTimeout(2200);
  const cform = page.locator('form[aria-labelledby="contact-form-title"]');
  if ((await cform.getByRole('button', { name: 'Request a callback' }).first().getAttribute('aria-pressed')) !== 'true') fail(tag, 'callback mode not preselected from URL');
  await cform.getByLabel(/Your name/).fill(`QA callback ${tag}`);
  await cform.getByLabel(/Phone number to call/).fill('98711 71112');
  await cform.getByRole('radio', { name: 'Evening' }).check();
  await cform.getByLabel(/I agree/).check();
  await page.screenshot({ path: `${OUT}/${tag}-callback-form.png` });
  await cform.locator('button[type="submit"]').click();
  const cbOk = page.getByText(/your callback request has been received/);
  await cbOk.waitFor({ timeout: 8000 }).catch(() => {});
  if (await cbOk.count()) {
    const recs = await storedRecords();
    const last = recs[recs.length - 1];
    if (last?.kind !== 'callback' || last.phone !== '+919871171112' || last.pieceId !== 'mfb-sample-01' || last.callbackWindow !== 'evening')
      fail(tag, `callback record mismatch: ${JSON.stringify(last)}`);
    else ok(tag, `callback submitted and persisted (${last.id})`);
  } else fail(tag, 'callback success state not shown');

  // ---------- theme + sound controls ----------
  await page.goto(BASE + '/', { waitUntil: 'load' });
  await page.waitForTimeout(800);
  const t0 = await page.evaluate(() => document.documentElement.dataset.theme);
  await page.getByRole('button', { name: /Switch to (light|dark) theme/ }).click();
  await page.waitForFunction((b) => document.documentElement.dataset.theme !== b, t0, { timeout: 3000 }).catch(() => {});
  const t1 = await page.evaluate(() => [document.documentElement.dataset.theme, localStorage.getItem('maaira-theme')]);
  if (t1[0] === t0 || t1[1] !== t1[0]) fail(tag, `theme toggle failed: ${t0} -> ${t1}`);
  else ok(tag, 'theme toggle + persistence');

  await page.getByRole('button', { name: /Sound settings/ }).click();
  await page.waitForTimeout(400);
  const soundSwitch = page.getByRole('switch', { name: 'Sound' });
  const ambience = page.getByRole('switch', { name: /Ambience/ });
  if (!(await ambience.isDisabled())) fail(tag, 'ambience should be disabled while sound is off');
  await soundSwitch.click();
  await page.waitForTimeout(300);
  const soundOn = await soundSwitch.getAttribute('aria-checked');
  await ambience.click();
  await page.waitForTimeout(300);
  const ambOn = await ambience.getAttribute('aria-checked');
  const vol = page.getByRole('slider', { name: 'Volume' });
  await vol.focus();
  await page.keyboard.press('ArrowLeft');
  const audio = await page.evaluate(() => JSON.parse(localStorage.getItem('maaira-sound') || '{}'));
  await page.keyboard.press('Escape');
  const panelGone = await page
    .getByRole('group', { name: 'Sound settings' })
    .waitFor({ state: 'detached', timeout: 2000 })
    .then(() => true, () => false);
  if (soundOn !== 'true' || ambOn !== 'true' || !audio.enabled || !audio.ambience || audio.volume >= 0.6 || !panelGone)
    fail(tag, `sound controls: on=${soundOn} amb=${ambOn} saved=${JSON.stringify(audio)} panelClosed=${panelGone}`);
  else ok(tag, 'sound panel: switches, volume, persistence, Escape');
  await page.getByRole('button', { name: /Sound settings/ }).click();
  await page.getByRole('switch', { name: 'Sound' }).click();
  await page.keyboard.press('Escape');

  // ---------- mobile menu ----------
  if (vpName !== 'desktop') {
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${OUT}/${tag}-menu.png` });
    await page.locator('#site-menu').getByRole('link', { name: /The House/ }).click();
    await page.waitForURL('**/house', { timeout: 8000 }).catch(() => fail(tag, 'menu link did not navigate'));
    await page.waitForTimeout(1500);
    if (await page.locator('#site-menu').count()) fail(tag, 'menu still open after navigation');
    else ok(tag, 'mobile menu navigation');
  }

  // ---------- deep link ----------
  await page.goto(BASE + '/shop?piece=no-03', { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  if (!(await page.locator('#piece-title').count())) fail(tag, 'quick-view deep link did not open');
  else ok(tag, 'quick-view deep link');

  await ctx.close();
}

const only = args.only;
const combos = [
  ['desktop', 'dark'],
  ['desktop', 'light'],
  ['tablet', 'light'],
  ['mobile', 'dark'],
  ['mobile', 'light'],
];
for (const [vp, theme] of combos) {
  if (only && only !== `${vp}-${theme}`) continue;
  await run(vp, theme);
}
if (!only || only === 'reduced') await run('desktop', 'light', { reducedMotion: true });

await browser.close();
console.log(passes.join('\n'));
console.log(problems.length ? `\nPROBLEMS (${problems.length}):\n${problems.join('\n')}` : '\nNo problems detected.');
