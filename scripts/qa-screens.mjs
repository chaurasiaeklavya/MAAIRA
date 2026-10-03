/**
 * Visual QA: screenshots across viewports and both themes, plus key states.
 *
 *   node scripts/qa-screens.mjs [--base=http://localhost:3000] [--mock-images] [--only=desktop-dark]
 *
 * --mock-images serves a neutral grey test card for res.cloudinary.com
 * requests. It exists ONLY because the build container cannot reach
 * Cloudinary; it lets layout be reviewed. Screenshots taken with it must never
 * be presented as product imagery.
 */
import { chromium } from 'playwright';
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  }),
);
const BASE = args.base || 'http://localhost:3000';
const OUT = 'qa/screens';
await mkdir(OUT, { recursive: true });

const testCard = await sharp({
  create: { width: 900, height: 1200, channels: 3, background: '#9a948c' },
})
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

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});

const problems = [];

async function run(vpName, theme, { reducedMotion = false } = {}) {
  const vp = VIEWPORTS[vpName];
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    isMobile: vp.isMobile,
    hasTouch: vp.hasTouch,
    reducedMotion: reducedMotion ? 'reduce' : 'no-preference',
  });
  await ctx.addInitScript((t) => localStorage.setItem('maaira-theme', t), theme);
  const page = await ctx.newPage();
  const tag = `${vpName}-${theme}${reducedMotion ? '-reduced' : ''}`;
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') problems.push(`[${tag}] console.${m.type()}: ${m.text()}`);
  });
  page.on('pageerror', (e) => problems.push(`[${tag}] pageerror: ${e.message}`));
  if (args['mock-images']) {
    await page.route('https://res.cloudinary.com/**', (route) =>
      route.fulfill({ status: 200, contentType: 'image/jpeg', body: testCard }),
    );
  }

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2600);
  await page.screenshot({ path: `${OUT}/${tag}-01-hero.png` });

  // Scroll through to trigger reveals, then capture sections.
  for (const id of ['pieces', 'house', 'collection', 'contact']) {
    await page.evaluate((sel) => {
      const el = document.getElementById(sel);
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 0, behavior: 'instant' });
    }, id);
    await page.waitForTimeout(1600);
    await page.screenshot({ path: `${OUT}/${tag}-02-${id}.png` });
  }

  // First product card in view
  await page.evaluate(() => {
    const el = document.querySelector('#pieces article');
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'instant' });
  });
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `${OUT}/${tag}-03-card.png` });

  // Collection mid-way (pinned on desktop)
  await page.evaluate(() => {
    const el = document.getElementById('collection');
    if (el) window.scrollTo({ top: el.offsetTop + el.offsetHeight * 0.45, behavior: 'instant' });
  });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/${tag}-04-collection-mid.png` });

  // Open the first piece
  await page.evaluate(() => {
    const el = document.querySelector('#pieces article');
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'instant' });
  });
  await page.waitForTimeout(600);
  await page.getByRole('button', { name: 'View the piece' }).first().click();
  await page.waitForTimeout(350);
  await page.screenshot({ path: `${OUT}/${tag}-05-detail-transition.png` });
  await page.waitForTimeout(1400);
  await page.screenshot({ path: `${OUT}/${tag}-06-detail.png` });
  const url = page.url();
  if (!url.includes('piece=no-01')) problems.push(`[${tag}] URL not updated on open: ${url}`);
  const focused = await page.evaluate(() => document.activeElement?.textContent?.trim());
  if (!focused?.includes('Back to the pieces')) problems.push(`[${tag}] focus not on close button (got: ${focused})`);

  // Next image via keyboard, then close with Escape
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/${tag}-07-detail-next.png` });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1600);
  if (page.url().includes('piece=')) problems.push(`[${tag}] URL still has piece after close: ${page.url()}`);
  const dialogs = await page.locator('[role="dialog"]').count();
  if (dialogs) problems.push(`[${tag}] dialog still present after Escape`);
  const back = await page.evaluate(() => document.activeElement?.textContent?.trim());
  if (!back?.includes('View the piece')) problems.push(`[${tag}] focus not returned to trigger (got: ${back})`);

  // Deep link
  await page.goto(`${BASE}/?piece=no-03`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/${tag}-08-deeplink.png` });
  if (!(await page.locator('#piece-title').count())) problems.push(`[${tag}] deep link did not open dialog`);

  // Theme toggle persists; sound toggle reflects state
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  const before = await page.evaluate(() => document.documentElement.dataset.theme);
  await page.getByRole('button', { name: /Switch to (light|dark) theme/ }).click();
  await page.waitForTimeout(900);
  const after = await page.evaluate(() => [document.documentElement.dataset.theme, localStorage.getItem('maaira-theme')]);
  if (after[0] === before || after[1] !== after[0]) problems.push(`[${tag}] theme toggle failed: ${before} -> ${after}`);
  const sound = page.getByRole('button', { name: /turn interface sound/ });
  await sound.click();
  if ((await sound.getAttribute('aria-pressed')) !== 'true') problems.push(`[${tag}] sound toggle did not engage`);
  await sound.click();

  // Mobile menu
  if (vpName !== 'desktop') {
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${OUT}/${tag}-09-menu.png` });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1500);
    if (await page.locator('#site-menu').count()) problems.push(`[${tag}] menu did not close on Escape`);
  }

  // Thumbnail selection + swipe in the gallery
  await page.goto(`${BASE}/?piece=no-02`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  const thumbs = page.getByRole('button', { name: /^Show Piece/ });
  if ((await thumbs.count()) !== 3) problems.push(`[${tag}] expected 3 thumbnails for no-02, got ${await thumbs.count()}`);
  await thumbs.nth(2).click();
  await page.waitForTimeout(900);
  if ((await thumbs.nth(2).getAttribute('aria-current')) !== 'true') problems.push(`[${tag}] thumbnail selection failed`);
  if (vp.hasTouch) {
    const box = await page.locator('[role="dialog"] [class*="photo"]').first().boundingBox();
    if (box) {
      // Real touch input (pointerType "touch") via the DevTools protocol.
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
      if ((await thumbs.nth(0).getAttribute('aria-current')) !== 'true') problems.push(`[${tag}] swipe did not advance gallery`);
    }
  }

  // Horizontal overflow check
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (overflow > 0) problems.push(`[${tag}] horizontal overflow: ${overflow}px`);

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
console.log(problems.length ? problems.join('\n') : 'No problems detected.');
