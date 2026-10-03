/**
 * Automated accessibility audit (axe-core, WCAG 2.0/2.1/2.2 A + AA rules)
 * on the home page and the open piece dialog, in both themes.
 *
 *   node scripts/qa-a11y.mjs [--base=http://localhost:3000]
 *
 * Automated checks cover only part of WCAG; manual screen-reader review is
 * still required (see docs/requirements-traceability.md, R28).
 */
import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';

const BASE = process.argv.find((a) => a.startsWith('--base='))?.split('=')[1] || 'http://localhost:3000';
const axeSource = await readFile(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
let total = 0;

for (const theme of ['dark', 'light']) {
  for (const [label, path] of [
    ['home', '/'],
    ['dialog', '/?piece=no-02'],
  ]) {
    // Reduced motion so every reveal is settled when axe measures contrast.
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    await ctx.addInitScript((t) => localStorage.setItem('maaira-theme', t), theme);
    const page = await ctx.newPage();
    await page.route('https://res.cloudinary.com/**', (r) => r.abort());
    await page.goto(BASE + path, { waitUntil: 'networkidle' });
    // Scroll through so in-view content is rendered.
    if (label === 'home') {
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 60));
        }
        window.scrollTo(0, 0);
      });
    }
    await page.waitForTimeout(1500);
    await page.addScriptTag({ content: axeSource });
    const result = await page.evaluate(async () => {
      // @ts-expect-error injected global
      const r = await window.axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] },
      });
      return r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.slice(0, 3).map((n) => n.target.join(' ')) }));
    });
    total += result.length;
    console.log(`\n[${theme}/${label}] ${result.length} violation(s)`);
    for (const v of result) console.log(`  - ${v.id} (${v.impact}): ${v.help}\n      ${v.nodes.join('\n      ')}`);
    await ctx.close();
  }
}
await browser.close();
console.log(`\nTotal violations: ${total}`);
