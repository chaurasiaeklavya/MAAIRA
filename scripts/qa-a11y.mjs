/**
 * Automated accessibility audit (axe-core, WCAG 2.0/2.1/2.2 A + AA rules and
 * best practices) on every route, the open quick view and the sound panel,
 * in both themes. Optionally audits the admin page when credentials are given.
 *
 *   node scripts/qa-a11y.mjs [--base=http://localhost:3000] [--admin=user:password]
 *
 * Automated checks cover only part of WCAG; manual screen-reader review is
 * still required (docs/requirements-traceability.md, R28).
 */
import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';

const arg = (k) => process.argv.find((a) => a.startsWith(`--${k}=`))?.split('=').slice(1).join('=');
const BASE = arg('base') || 'http://localhost:3000';
const ADMIN = arg('admin');
const axeSource = await readFile(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

const TARGETS = [
  ['home', '/'],
  ['shop', '/shop'],
  ['quick view', '/shop?piece=no-02'],
  ['product', '/shop/no-02'],
  ['house', '/house'],
  ['editorial', '/editorial'],
  ['contact', '/contact'],
  ['contact (callback)', '/contact?mode=callback'],
  ['client services', '/client-services'],
  ['shipping', '/client-services/shipping-returns'],
  ['privacy', '/client-services/privacy'],
  ['terms', '/client-services/terms'],
  ['404', '/does-not-exist'],
  ['sound panel', '/', 'sound'],
];
if (ADMIN) TARGETS.push(['admin', '/admin/enquiries', 'admin']);

let total = 0;
for (const theme of ['dark', 'light']) {
  for (const [label, path, special] of TARGETS) {
    // Reduced motion so every reveal is settled when axe measures contrast.
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: 'reduce',
      ...(special === 'admin' ? { httpCredentials: { username: ADMIN.split(':')[0], password: ADMIN.split(':').slice(1).join(':') } } : {}),
    });
    await ctx.addInitScript((t) => localStorage.setItem('maaira-theme', t), theme);
    const page = await ctx.newPage();
    await page.route('https://res.cloudinary.com/**', (r) => r.abort());
    await page.goto(BASE + path, { waitUntil: 'load' });
    await page.waitForTimeout(900);
    if (!path.includes('piece=') && special !== 'sound') {
      await page.evaluate(async () => {
        for (let y = 0; y < document.documentElement.scrollHeight; y += 600) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 50));
        }
        window.scrollTo(0, 0);
      });
    }
    if (special === 'sound') {
      await page.getByRole('button', { name: /Sound settings/ }).click();
      await page.getByRole('switch', { name: 'Sound' }).click();
    }
    await page.waitForTimeout(1200);
    await page.addScriptTag({ content: axeSource });
    const result = await page.evaluate(async () => {
      // @ts-expect-error injected global
      const r = await window.axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] },
      });
      return r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.slice(0, 3).map((n) => n.target.join(' ')) }));
    });
    total += result.length;
    console.log(`[${theme}/${label}] ${result.length} violation(s)`);
    for (const v of result) console.log(`  - ${v.id} (${v.impact}): ${v.help}\n      ${v.nodes.join('\n      ')}`);
    await ctx.close();
  }
}
await browser.close();
console.log(`\nTotal violations: ${total}`);
