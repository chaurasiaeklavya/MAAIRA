/**
 * Builds ONE self-contained HTML file of the showcase — scripts, styles,
 * fonts, textures and logo masks inlined — for sharing or offline review.
 * Product photographs remain Cloudinary URLs, so they need an internet
 * connection (and fall back to the brand panel without one).
 *
 *   npm run build:single     → dist/maaira-showcase.html
 *
 * Steps: static export (webpack) → inline every <link rel=stylesheet> and
 * <script src> → embed local assets as data: URIs → drop non-Latin font
 * subsets (Latin + Latin Extended are kept; the latter carries ₹).
 */
import { execSync } from 'node:child_process';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'out');
const DIST = path.join(ROOT, 'dist');
const TARGET = path.join(DIST, 'maaira-showcase.html');

if (!process.argv.includes('--skip-build')) {
  await rm(path.join(ROOT, '.next'), { recursive: true, force: true });
  await rm(OUT, { recursive: true, force: true });
  execSync('npx next build --webpack', { stdio: 'inherit', env: { ...process.env, STATIC_EXPORT: '1' } });
}

const MIME = { '.woff2': 'font/woff2', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
const cache = new Map();
async function dataUri(urlPath) {
  const clean = urlPath.split(/[?#]/)[0];
  if (cache.has(clean)) return cache.get(clean);
  const file = path.join(OUT, clean);
  const buf = await readFile(file);
  const uri = `data:${MIME[path.extname(clean)] ?? 'application/octet-stream'};base64,${buf.toString('base64')}`;
  cache.set(clean, uri);
  return uri;
}

async function replaceAsync(str, re, fn) {
  const parts = [];
  let last = 0;
  for (const m of str.matchAll(re)) {
    parts.push(str.slice(last, m.index), await fn(...m));
    last = m.index + m[0].length;
  }
  parts.push(str.slice(last));
  return parts.join('');
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Minifiers may write the Latin range as "u+00??".
const KEEP_RANGES = ['u+0000-00ff', 'u+00??', 'u+0100-02ba'];

async function inlineCss(css) {
  // Keep only Latin / Latin Extended @font-face blocks.
  css = css.replace(/@font-face\{[^}]*\}/g, (block) => {
    const range = (/unicode-range:([^;}]*)/i.exec(block)?.[1] ?? '').toLowerCase();
    return !range || KEEP_RANGES.some((r) => range.includes(r)) ? block : '';
  });
  return replaceAsync(css, /url\((['"]?)(\/[^)'"]+)\1\)/g, async (_m, _q, p) => `url("${await dataUri(p)}")`);
}

async function inlineJs(js) {
  js = await replaceAsync(js, /(["'])(\/(?:textures|brand)\/[^"']+)\1/g, async (_m, q, p) => `${q}${await dataUri(p)}${q}`);
  return js.replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');
}

let html = await readFile(path.join(OUT, 'index.html'), 'utf8');
const inlinedCss = [];

// Stylesheets: inline the CSS, and keep a <link> whose href is a tiny data: URI.
// React's hydration payload references each stylesheet by href; rewriting
// every occurrence to the same data: URI keeps React from re-requesting it.
const cssHrefs = [...new Set([...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map((m) => m[1]))];
for (const href of cssHrefs) {
  const css = await readFile(path.join(OUT, href), 'utf8');
  const stub = `data:text/css,%2F*${path.basename(href, '.css')}*%2F`;
  const linkTag = new RegExp(`<link rel="stylesheet" href="${escapeRe(href)}"([^>]*?)/?>`);
  const slot = `__CSS_${inlinedCss.length}__`;
  html = html.replace(linkTag, (_m, attrs) => `<style>${slot}</style><link rel="stylesheet" href="${stub}"${attrs}/>`);
  html = html.split(href).join(stub);
  inlinedCss.push(await inlineCss(css));
}

// Scripts: drop legacy polyfills (noModule) and preloads, inline the rest.
html = html.replace(/<script src="[^"]+" noModule=""><\/script>/g, '');
html = html.replace(/<link rel="preload"[^>]*\/?>/g, '');
html = await replaceAsync(html, /<script src="([^"]+)"([^>]*)><\/script>/g, async (_m, src, attrs) => {
  const js = await readFile(path.join(OUT, src), 'utf8');
  const id = /id="([^"]+)"/.exec(attrs)?.[1];
  return `<script${id ? ` id="${id}"` : ''} data-inline-src="${src}">${await inlineJs(js)}</script>`;
});

// Next's bootstrap derives its asset prefix from document.currentScript.src,
// which is empty for inline scripts. For inlined bundles only, report a
// detached stand-in carrying the original path (detached scripts never load).
const CURRENT_SCRIPT_SHIM = `<script>(function(){var d=Object.getOwnPropertyDescriptor(Document.prototype,'currentScript');if(!d||!d.get)return;Object.defineProperty(document,'currentScript',{configurable:true,get:function(){var s=d.get.call(document);if(s&&!s.src&&s.dataset&&s.dataset.inlineSrc){var f=document.createElement('script');f.src='https://inline.invalid'+s.dataset.inlineSrc;return f}return s}})})();</script>`;
html = html.replace(/<script[^>]*data-inline-src=/, (m) => CURRENT_SCRIPT_SHIM + m);

// Icons → data URIs; remove share-image tags that point at a server origin.
// (every occurrence, including React's hydration payload, so nothing re-requests them)
const iconHrefs = [...new Set([...html.matchAll(/<link rel="(?:icon|apple-touch-icon)" href="([^"]+)"/g)].map((m) => m[1]))];
for (const href of iconHrefs) html = html.split(href).join(await dataUri(href));
html = html.replace(/<meta (?:property|name)="(?:og:image|twitter:image)[^"]*"[^>]*\/?>/g, '');

// Inline style attributes or remaining CSS url(/...) references in markup.
html = await replaceAsync(html, /url\((['"]?)(\/(?:textures|brand)\/[^)'"]+)\1\)/g, async (_m, _q, p) => `url("${await dataUri(p)}")`);

// Insert CSS last so its data: URIs aren't scanned by the replacements above.
inlinedCss.forEach((css, i) => {
  html = html.replace(`__CSS_${i}__`, () => css);
});

// Any tag attribute still pointing at a local path would break offline use.
const leftovers = [...html.matchAll(/<[a-z]+[^>]*\s(?:src|href)="(\/[^"#][^"]*)"/g)].map((m) => m[1]);
if (leftovers.length) console.warn('Unresolved local references:', [...new Set(leftovers)]);

await mkdir(DIST, { recursive: true });
await writeFile(TARGET, html);
console.log(`Wrote ${path.relative(ROOT, TARGET)} (${(Buffer.byteLength(html) / 1024).toFixed(0)} KB)`);
