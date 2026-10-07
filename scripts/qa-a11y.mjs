/**
 * Automated accessibility audit (axe-core: WCAG 2.0/2.1/2.2 A + AA, best
 * practice) of storefront pages, open dialogs (cart drawer, menu, filters)
 * and — with staff credentials — every admin page, in both themes.
 *
 *   node scripts/qa-a11y.mjs [--base=http://localhost:3000] [--staff=email:password]
 *
 * Automated checks cover only part of WCAG; a manual screen-reader pass is
 * still required (docs/requirements-traceability.md).
 */
import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';

const arg = (k) => process.argv.find((a) => a.startsWith(`--${k}=`))?.split('=').slice(1).join('=');
const BASE = arg('base') || 'http://localhost:3000';
const STAFF = arg('staff');
const axeSource = await readFile(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

const STORE = [
  ['home', '/'],
  ['shop', '/shop'],
  ['shop + filter sheet', '/shop', 'filters'],
  ['search', '/search?q=piece'],
  ['search (no results)', '/search?q=backpack'],
  ['product', '/products/no-02'],
  ['product + cart drawer', '/products/no-02', 'cart'],
  ['cart', '/cart'],
  ['checkout', '/checkout'],
  ['wishlist', '/wishlist'],
  ['about', '/about'],
  ['editorial', '/editorial'],
  ['contact', '/contact'],
  ['contact (callback)', '/contact?mode=callback'],
  ['faq', '/client-services'],
  ['shipping', '/client-services/shipping'],
  ['returns', '/client-services/returns'],
  ['privacy', '/client-services/privacy'],
  ['cookies', '/client-services/cookies'],
  ['sign in', '/account/sign-in'],
  ['register', '/account/register'],
  ['menu (mobile)', '/', 'menu'],
  ['404', '/does-not-exist'],
  ['staff sign in', '/admin/sign-in'],
];
const ADMIN = [
  ['admin overview', '/admin'],
  ['admin products', '/admin/products'],
  ['admin photographs', '/admin/media'],
  ['admin orders', '/admin/orders'],
  ['admin enquiries', '/admin/enquiries'],
  ['admin settings', '/admin/settings'],
  ['admin audit', '/admin/audit'],
];

async function audit(page) {
  await page.addScriptTag({ content: axeSource });
  return page.evaluate(async () => {
    // @ts-expect-error injected global
    const r = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } });
    return r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.slice(0, 3).map((n) => n.target.join(' ')) }));
  });
}

let total = 0;
for (const theme of ['dark', 'light']) {
  const targets = [...STORE];
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await ctx.addInitScript((t) => localStorage.setItem('maaira-theme', t), theme);
  const page = await ctx.newPage();
  await page.route('https://res.cloudinary.com/**', (r) => r.abort());

  if (STAFF) {
    const [email, ...pw] = STAFF.split(':');
    await page.goto(`${BASE}/admin/sign-in`);
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(pw.join(':'));
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL(`${BASE}/admin`).catch(() => {});
    targets.push(...ADMIN);
    targets.splice(targets.findIndex(([l]) => l === 'staff sign in'), 1);
  }

  for (const [label, path, special] of targets) {
    if (special === 'menu') await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE + path, { waitUntil: 'load' });
    await page.waitForTimeout(600);
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 30));
      }
      window.scrollTo(0, 0);
    });
    if (special === 'filters') {
      const btn = page.getByRole('button', { name: /^Filter/ });
      if (await btn.count()) await btn.click();
    }
    if (special === 'cart') await page.locator('header').getByRole('button', { name: /Cart/ }).click();
    if (special === 'menu') await page.getByRole('button', { name: /Menu/ }).click();
    await page.waitForTimeout(600);
    const result = await audit(page);
    total += result.length;
    console.log(`[${theme}/${label}] ${result.length} violation(s)`);
    for (const v of result) console.log(`  - ${v.id} (${v.impact}): ${v.help}\n      ${v.nodes.join('\n      ')}`);
    if (special === 'menu') await page.setViewportSize({ width: 1440, height: 900 });
  }
  await ctx.close();
}
await browser.close();
console.log(`\nTotal violations: ${total}`);
process.exit(total ? 1 : 0);
