/**
 * Verifies dist/maaira-showcase.html works opened straight from disk
 * (file://) with all network access blocked except product images, which are
 * served a neutral test card (--mock-images) or blocked (default).
 *
 *   node scripts/qa-single-html.mjs [--mock-images]
 */
import { chromium } from 'playwright';
import sharp from 'sharp';
import path from 'node:path';
import { mkdir } from 'node:fs/promises';

const FILE = 'file://' + path.resolve('dist/maaira-showcase.html');
const OUT = 'qa/screens/single';
const mock = process.argv.includes('--mock-images');
await mkdir(OUT, { recursive: true });

const card = await sharp({ create: { width: 900, height: 1200, channels: 3, background: '#9a948c' } }).jpeg().toBuffer();
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const problems = [];

for (const [name, vp, theme] of [
  ['desktop', { width: 1440, height: 900 }, 'dark'],
  ['mobile', { width: 390, height: 844 }, 'light'],
]) {
  const ctx = await browser.newContext({ viewport: vp, hasTouch: name === 'mobile', isMobile: name === 'mobile' });
  await ctx.addInitScript((t) => localStorage.setItem('maaira-theme', t), theme);
  const page = await ctx.newPage();
  const tag = `${name}-${theme}`;
  page.on('pageerror', (e) => problems.push(`[${tag}] pageerror: ${e.message}`));
  page.on('console', (m) => m.type() === 'error' && !/res\.cloudinary\.com|ERR_FAILED/.test(m.text()) && problems.push(`[${tag}] console: ${m.text()}`));
  page.on('requestfailed', (r) => {
    if (!r.url().startsWith('https://res.cloudinary.com/')) problems.push(`[${tag}] request failed: ${r.url().slice(0, 120)}`);
  });
  await ctx.route('**/*', (route) => {
    const url = route.request().url();
    if (url.startsWith('file://') || url.startsWith('data:')) return route.continue();
    if (url.startsWith('https://res.cloudinary.com/') && mock) return route.fulfill({ status: 200, contentType: 'image/jpeg', body: card });
    if (!url.startsWith('https://res.cloudinary.com/')) problems.push(`[${tag}] unexpected network request: ${url.slice(0, 120)}`);
    return route.abort();
  });

  await page.goto(FILE, { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  const state = await page.evaluate(async () => {
    await document.fonts.ready;
    return {
      theme: document.documentElement.dataset.theme,
      cormorant: document.fonts.check('40px "Cormorant Garamond Variable"', 'Piece'),
      jost: document.fonts.check('16px "Jost Variable"', 'MAAIRA'),
      glReady: document.querySelector('canvas')?.dataset.ready ?? 'no',
      maskOk: getComputedStyle(document.querySelector('.logo-mask')).maskImage?.startsWith('url("data:') ?? false,
    };
  });
  if (state.theme !== theme) problems.push(`[${tag}] theme not applied: ${state.theme}`);
  if (!state.cormorant || !state.jost) problems.push(`[${tag}] fonts not loaded: ${JSON.stringify(state)}`);
  if (state.glReady !== 'true') problems.push(`[${tag}] WebGL hero not rendered (${state.glReady})`);
  if (!state.maskOk) problems.push(`[${tag}] logo mask not inlined`);
  await page.screenshot({ path: `${OUT}/${tag}-hero.png` });

  await page.evaluate(() => {
    const el = document.querySelector('#pieces article');
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'instant' });
  });
  await page.waitForTimeout(1500);
  await page.getByRole('button', { name: 'View the piece' }).first().click();
  await page.waitForTimeout(1600);
  await page.screenshot({ path: `${OUT}/${tag}-detail.png` });
  if (!(await page.locator('#piece-title').count())) problems.push(`[${tag}] dialog did not open`);
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(800);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1600);
  if (await page.locator('[role="dialog"]').count()) problems.push(`[${tag}] dialog did not close`);
  // The header hides while scrolled down, so return to the top first.
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(900);
  await page.getByRole('button', { name: /Switch to (light|dark) theme/ }).click();
  await page
    .waitForFunction((t) => document.documentElement.dataset.theme !== t, theme, { timeout: 3000 })
    .catch(() => {});
  if ((await page.evaluate(() => document.documentElement.dataset.theme)) === theme) problems.push(`[${tag}] theme toggle failed`);
  await page.evaluate(() => document.getElementById('collection').scrollIntoView());
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/${tag}-collection.png` });
  await ctx.close();
}

await browser.close();
console.log(problems.length ? problems.join('\n') : 'Single-file build: no problems detected.');
