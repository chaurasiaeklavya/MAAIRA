/**
 * Builds ONE self-contained HTML preview of the storefront — every public
 * page, styles, fonts, textures and logos inlined — for sharing or offline
 * review.
 *
 *   npm run build && npm start              # the store, with its database
 *   npm run build:preview                   # → dist/maaira-store-preview.html
 *   npm run build:preview -- --base=http://localhost:3000 --out=dist/x.html
 *
 * The file is a snapshot of the running store: pages are rendered by the
 * real app (reduced motion, so every reveal is at its end state), then
 * stitched together with a small script for page navigation, theme, menu
 * and dialogs, photo galleries and the enquiry form's modes. Anything that
 * needs the server — cart, checkout, accounts, search, wishlist, sending an
 * enquiry — says so instead of pretending; the enquiry form offers to email
 * the visitor's details instead, exactly as the live form does when it
 * cannot reach the server. Product photographs stay Cloudinary URLs: they
 * need a connection, and without one the brand panel is shown.
 *
 * After writing, the file is opened over file:// with the network blocked
 * and every page is checked (skip with --no-check).
 */
import { chromium } from 'playwright';
import sharp from 'sharp';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')).map(([k, v]) => [k, v ?? true]));
const BASE = String(args.base || 'http://localhost:3000').replace(/\/$/, '');
const TARGET = path.resolve(String(args.out || 'dist/maaira-store-preview.html'));
const MAX_PAGES = 80;
// Routes that only make sense with the server: sessions, carts, payments, search.
const SERVER_ONLY = ['/account', '/search', '/checkout', '/orders', '/admin', '/api'];
const NOT_FOUND = '/__not-found';

const executablePath = process.env.PW_CHROMIUM || (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
const browser = await chromium.launch({ executablePath });

// Stand-in for product photographs during capture only, so the image
// component keeps its <img> (with the real Cloudinary URL) instead of
// switching to its offline panel. Never written into the file.
const card = await sharp({ create: { width: 900, height: 1200, channels: 3, background: '#a8a29a' } }).jpeg().toBuffer();

const isServerOnly = (p) => SERVER_ONLY.some((s) => p === s || p.startsWith(`${s}/`));
const normalise = (p) => (p.length > 1 ? p.replace(/\/+$/, '') : '/');

/* ───────────────────────────────────────────────────────────── capture */

async function capture(route) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
    colorScheme: 'dark',
    serviceWorkers: 'block',
  });
  const page = await context.newPage();
  await page.route('https://res.cloudinary.com/**', (r) => r.fulfill({ status: 200, contentType: 'image/jpeg', body: card }));
  // Nothing is submitted while capturing.
  await page.route('**/api/enquiries', (r) => r.abort());

  const res = await page.goto(BASE + (route === NOT_FOUND ? '/__maaira-preview-missing-page' : route), { waitUntil: 'load' });
  const status = res?.status() ?? 0;
  const finalPath = normalise(new URL(page.url()).pathname);
  if (route !== NOT_FOUND && (status !== 200 || finalPath !== route)) {
    await context.close();
    return { route, skipped: `HTTP ${status}${finalPath !== route ? ` → ${finalPath}` : ''}` };
  }
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
  await page.evaluate(async () => {
    await document.fonts.ready;
    for (let y = 0; y < document.documentElement.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 30));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(700);

  const data = await page.evaluate(async ({ withChrome }) => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    // Wait, then let every finite animation (enter/exit transitions) finish.
    const settle = async (ms) => {
      await sleep(ms);
      const finite = document.getAnimations().filter((a) => a.effect?.getComputedTiming().endTime !== Infinity);
      await Promise.race([Promise.allSettled(finite.map((a) => a.finished)), sleep(3000)]);
      await sleep(100);
    };

    /** Serialisable copy of an element without runtime-only parts. */
    function clean(el) {
      const c = el.cloneNode(true);
      c.querySelectorAll('script, noscript, canvas, template, next-route-announcer, link[rel="preload"], link[rel="modulepreload"], link[rel="prefetch"]').forEach((x) => x.remove());
      // The sound engine is not part of the file: remove its controls (and a bare "Sound" label).
      c.querySelectorAll('button[aria-label^="Sound settings"]').forEach((b) => {
        const wrap = b.parentElement;
        const host = wrap?.parentElement;
        if (host && host.children.length === 2 && /^\s*Sound\s*$/.test(host.firstElementChild?.textContent ?? '')) host.remove();
        else wrap?.remove();
      });
      c.querySelectorAll('[class^="Cursor-module__"]').forEach((x) => x.remove());
      c.querySelectorAll('img[data-loaded]').forEach((img) => img.removeAttribute('data-loaded'));
      // Without WebGL the hero's own fallback (CSS leather + DOM monogram) is shown.
      c.querySelectorAll('[data-stamp]').forEach((x) => x.removeAttribute('data-stamp'));
      c.querySelectorAll('dialog[open]').forEach((d) => d.removeAttribute('open'));
      c.querySelectorAll('[data-scrolled]').forEach((x) => x.removeAttribute('data-scrolled'));
      if (c.matches?.('dialog[open]')) c.removeAttribute('open');
      return c;
    }

    // Which button opens which dialog (keyed so the same dialog matches on every page).
    for (const btn of document.querySelectorAll('button[aria-haspopup="dialog"]')) {
      const before = new Set(document.querySelectorAll('dialog[open]'));
      btn.click();
      await settle(350);
      const opened = [...document.querySelectorAll('dialog[open]')].find((d) => !before.has(d));
      if (!opened) continue;
      const key = opened.id || opened.getAttribute('aria-labelledby') || opened.getAttribute('aria-label') || opened.className.split(' ')[0];
      opened.dataset.pvDialog = key;
      btn.dataset.pvOpens = key;
      opened.close();
      await settle(250);
    }
    document.documentElement.classList.remove('is-locked');

    // Photo galleries: one frame per photograph.
    const galleries = [];
    const sections = [...document.querySelectorAll('main section[aria-label$=": photographs"]')];
    for (const [gi, section] of sections.entries()) {
      section.dataset.pvGallery = String(gi);
      const thumbs = () => [...section.querySelectorAll('[aria-label="Choose a view"] button')];
      const frames = [];
      for (let i = 0; i < thumbs().length; i++) {
        thumbs()[i].click();
        await settle(900);
        section.dataset.pvIndex = String(i);
        frames.push(clean(section).outerHTML);
      }
      if (thumbs().length) {
        thumbs()[0].click();
        await settle(900);
      }
      section.dataset.pvIndex = '0';
      galleries.push(frames);
    }

    // Enquiry forms: one variant per request type (enquiry / callback).
    const forms = [];
    const formEls = () => [...document.querySelectorAll('main form')];
    for (let fi = 0; fi < formEls().length; fi++) {
      formEls()[fi].dataset.pvForm = String(fi);
      const modes = () => [...formEls()[fi].querySelectorAll('[role="group"][aria-label="Type of request"] button')];
      if (!modes().length) {
        forms.push([]);
        continue;
      }
      const initial = Math.max(0, modes().findIndex((b) => b.getAttribute('aria-pressed') === 'true'));
      const variants = [];
      for (let mi = 0; mi < modes().length; mi++) {
        modes()[mi].click();
        await settle(1000);
        variants.push(clean(formEls()[fi]).outerHTML);
      }
      modes()[initial].click();
      await settle(1000);
      forms.push(variants);
    }

    const main = clean(document.querySelector('main#main'));
    const out = {
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.getAttribute('content') ?? '',
      main: main.innerHTML,
      links: [...document.querySelectorAll('a[href]')].map((a) => a.href),
      // Next splits CSS per route: every page contributes its stylesheets.
      stylesheets: [...document.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.href),
      inlineStyles: [...document.querySelectorAll('head style')].map((st) => st.textContent),
      galleries,
      forms,
    };

    if (withChrome) {
      const body = clean(document.body);
      body.querySelector('main#main').innerHTML = '<!--PV_MAIN-->';
      const attrs = (el) => Object.fromEntries([...el.attributes].map((a) => [a.name, a.value]));
      const mail = document.querySelector('footer a[href^="mailto:"]') ?? document.querySelector('a[href^="mailto:"]');
      const tel = document.querySelector('footer a[href^="tel:"]') ?? document.querySelector('a[href^="tel:"]');
      out.chrome = {
        htmlAttrs: attrs(document.documentElement),
        bodyAttrs: attrs(body),
        body: body.innerHTML,
        icon: document.querySelector('link[rel="icon"]')?.href ?? null,
        themeColors: [...document.querySelectorAll('meta[name="theme-color"]')].map((m) => m.outerHTML),
        email: mail?.getAttribute('href').replace(/^mailto:/, '') ?? '',
        phoneHref: tel?.getAttribute('href') ?? '',
        phoneDisplay: tel?.textContent.trim() ?? '',
      };
    }
    return out;
  }, { withChrome: route === '/' });

  await context.close();
  return { route, ...data };
}

const pages = new Map();
const skipped = [];
const queue = ['/'];
const seen = new Set(queue);
while (queue.length && pages.size < MAX_PAGES) {
  const route = queue.shift();
  const result = await capture(route);
  if (result.skipped) {
    skipped.push(`${route} (${result.skipped})`);
    continue;
  }
  pages.set(route, result);
  console.log(`captured ${route}`);
  for (const href of result.links) {
    const url = new URL(href);
    if (url.origin !== BASE) continue;
    const p = normalise(url.pathname);
    if (seen.has(p) || isServerOnly(p) || /\.[a-z0-9]+$/i.test(p)) continue;
    seen.add(p);
    queue.push(p);
  }
}
const notFound = await capture(NOT_FOUND);
console.log(`captured not-found page`);
if (skipped.length) console.log(`not included: ${skipped.join(', ')}`);

/* ───────────────────────────────────────────────────────────── assets */

const MIME = {
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
};
const assetCache = new Map();
async function dataUri(absUrl) {
  const key = absUrl.split('#')[0];
  if (assetCache.has(key)) return assetCache.get(key);
  const res = await fetch(key);
  if (!res.ok) throw new Error(`Could not fetch ${key}: HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const type = MIME[path.extname(new URL(key).pathname).toLowerCase()] ?? res.headers.get('content-type') ?? 'application/octet-stream';
  const uri = `data:${type};base64,${buf.toString('base64')}`;
  assetCache.set(key, uri);
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

// Keep Latin and Latin Extended font subsets only (the latter carries ₹).
const KEEP_RANGES = ['u+0000-00ff', 'u+00??', 'u+??,', 'u+0-ff', 'u+0100-02ba', 'u+100-2ba'];
async function inlineCss(css, cssUrl) {
  css = css.replace(/@font-face\s*\{[^}]*\}/g, (block) => {
    const range = (/unicode-range:([^;}]*)/i.exec(block)?.[1] ?? '').toLowerCase().replace(/\s+/g, '');
    return !range || KEEP_RANGES.some((r) => range.includes(r)) ? block : '';
  });
  return replaceAsync(css, /url\(\s*(['"]?)([^'")]+)\1\s*\)/g, async (m, _q, ref) => {
    if (/^(data:|#|%23|https?:\/\/(?!localhost|127\.0\.0\.1))/i.test(ref)) return m;
    const abs = new URL(ref, cssUrl).href;
    if (!abs.startsWith(BASE)) return m;
    return `url("${await dataUri(abs)}")`;
  });
}

const { chrome } = pages.get('/');
const cssParts = [];
const allPages = [...pages.values(), notFound];
for (const href of new Set(allPages.flatMap((p) => p.stylesheets))) {
  const res = await fetch(href);
  if (!res.ok) throw new Error(`Could not fetch ${href}: HTTP ${res.status}`);
  cssParts.push(await inlineCss(await res.text(), href));
}
for (const css of new Set(allPages.flatMap((p) => p.inlineStyles))) cssParts.push(await inlineCss(css, BASE + '/'));

const routeSet = new Set(pages.keys());

/** Internal links → in-file routes; local asset references → data: URIs. */
async function fixMarkup(html) {
  html = html.replace(/<a\b[^>]*>/g, (tag) =>
    tag.replace(/\shref="(\/[^"]*)"/, (m, href) => {
      const url = new URL(href.replace(/&amp;/g, '&'), BASE);
      const p = normalise(url.pathname);
      if (!routeSet.has(p)) return m; // handled by the runtime ("needs the live store")
      const target = `#${p}${url.search}`;
      return ` href="${target.replace(/&/g, '&amp;')}"`;
    }),
  );
  html = await replaceAsync(html, /\s(src|poster)="(\/[^"]*)"/g, async (_m, attr, ref) => ` ${attr}="${await dataUri(BASE + ref.replace(/&amp;/g, '&'))}"`);
  html = await replaceAsync(html, /url\((&quot;|['"])?(\/[^)'"&]+)(&quot;|['"])?\)/g, async (_m, _a, ref) => `url(&quot;${await dataUri(BASE + ref)}&quot;)`);
  return html;
}

/* ───────────────────────────────────────────────────────────── assemble */

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const attrString = (attrs, drop = []) =>
  Object.entries(attrs)
    .filter(([k]) => !drop.includes(k))
    .map(([k, v]) => ` ${k}="${esc(v)}"`)
    .join('');

const htmlClass = (chrome.htmlAttrs.class ?? '')
  .split(/\s+/)
  .filter((c) => c && !['is-locked', 'theme-transition'].includes(c))
  .join(' ');
const htmlAttrs = { ...chrome.htmlAttrs, class: htmlClass };
if (!htmlClass) delete htmlAttrs.class;

const home = pages.get('/');
const brandName = home.title.split(' — ')[0].trim();
const generated = new Date().toISOString().slice(0, 10);

const templates = [];
for (const [route, p] of [...pages, [NOT_FOUND, notFound]]) {
  templates.push(`<template data-pv-page="${esc(route)}" data-title="${esc(p.title)}" data-description="${esc(p.description)}">${await fixMarkup(p.main)}</template>`);
  for (const [gi, frames] of p.galleries.entries())
    for (const [i, frame] of frames.entries()) templates.push(`<template data-pv-frame="${esc(`${route}|${gi}|${i}`)}">${await fixMarkup(frame)}</template>`);
  for (const [fi, variants] of p.forms.entries())
    for (const [mi, form] of variants.entries()) templates.push(`<template data-pv-variant="${esc(`${route}|${fi}|${mi}`)}">${await fixMarkup(form)}</template>`);
}

const config = {
  brand: brandName,
  email: chrome.email,
  phoneHref: chrome.phoneHref,
  phoneDisplay: chrome.phoneDisplay,
  serverOnly: SERVER_ONLY,
  notFound: NOT_FOUND,
  generated,
};

const themeScript = `(function(){try{var t=localStorage.getItem('maaira-theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme=window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}})();`;

const previewCss = `
main#main:focus{outline:none}
.pv-toast{position:fixed;left:50%;bottom:calc(20px + env(safe-area-inset-bottom));z-index:2147483000;transform:translate(-50%,12px);width:max-content;max-width:min(560px,calc(100vw - 32px));padding:14px 18px;border:1px solid var(--line-strong);border-radius:var(--radius-m);background:var(--surface-raised);color:var(--ink);font:400 0.95rem/1.5 var(--font-sans);box-shadow:0 18px 40px rgba(var(--shadow-rgb),0.35);opacity:0;pointer-events:none;transition:opacity 240ms var(--ease-out),transform 240ms var(--ease-out)}
.pv-toast[data-show]{opacity:1;transform:translate(-50%,0)}
.pv-notice{position:fixed;left:16px;right:16px;bottom:calc(16px + env(safe-area-inset-bottom));z-index:2147482000;margin-inline:auto;display:flex;gap:16px;align-items:center;justify-content:space-between;max-width:760px;padding:14px 16px 14px 20px;border:1px solid var(--line-strong);border-radius:var(--radius-m);background:var(--surface-raised);color:var(--ink-soft);font:400 0.92rem/1.5 var(--font-sans);box-shadow:0 18px 40px rgba(var(--shadow-rgb),0.35)}
.pv-notice strong{color:var(--ink);font-weight:500}
.pv-notice button{flex:none;min-height:44px;padding:0 18px;border:1px solid var(--line-strong);border-radius:var(--radius-s);background:transparent;color:var(--ink);font:500 0.78rem/1 var(--font-sans);letter-spacing:0.14em;text-transform:uppercase;cursor:pointer}
.pv-notice button:hover{border-color:var(--accent)}
.pv-notice button:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
@media (max-width:600px){.pv-notice{flex-direction:column;align-items:stretch;text-align:left}}
@media (prefers-reduced-motion:reduce){.pv-toast{transition:none}}
`;

const runtime = `(${previewRuntime.toString()})();`.replace(/<\/script/gi, '<\\/script');

let body = await fixMarkup(chrome.body.replace('<!--PV_MAIN-->', home.main));
const iconTag = chrome.icon ? `<link rel="icon" href="${await dataUri(chrome.icon)}">` : '';

const html = `<!doctype html>
<html${attrString(htmlAttrs, ['data-theme', 'style'])}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(home.title)}</title>
<meta name="description" content="${esc(home.description)}">
<meta name="robots" content="noindex, nofollow">
<meta name="generator" content="MAAIRA store preview (${generated})">
${chrome.themeColors.join('\n')}
${iconTag}
<script>${themeScript}</script>
<style>${cssParts.join('\n')}</style>
<style>${previewCss}</style>
</head>
<body${attrString(chrome.bodyAttrs)}>
${body}
${templates.join('\n')}
<script type="application/json" id="pv-config">${JSON.stringify(config).replace(/</g, '\\u003c')}</script>
<script>${runtime}</script>
</body>
</html>
`;

const leftovers = [...html.matchAll(/\s(?:src|srcset|poster)="(\/[^"]*)"|url\((?:&quot;|['"])?(\/[^)'"&]+)/g)].map((m) => m[1] ?? m[2]);
if (leftovers.length) console.warn('Unresolved local references:', [...new Set(leftovers)]);

await mkdir(path.dirname(TARGET), { recursive: true });
await writeFile(TARGET, html);
console.log(`Wrote ${path.relative(process.cwd(), TARGET)} (${(Buffer.byteLength(html) / 1024).toFixed(0)} KB, ${pages.size} pages)`);

/* ───────────────────────────────────────────────────────────── check */

if (!args['no-check']) {
  const problems = [];
  // An element frozen at opacity 0 means a transition was captured mid-way.
  const hidden = [...html.matchAll(/<[a-z]+ class="([^"]*)"[^>]*style="[^"]*opacity: ?0[;"]/g)].map((m) => m[1]);
  if (hidden.length) problems.push(`captured mid-transition (opacity 0): ${[...new Set(hidden)].join(', ')}`);
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && !/res\.cloudinary\.com|ERR_FAILED|Failed to load resource/.test(m.text()) && errors.push(m.text()));
  const external = new Set();
  await context.route('**/*', (r) => {
    const u = r.request().url();
    if (u.startsWith('file:') || u.startsWith('data:')) return r.continue();
    if (!u.startsWith('https://res.cloudinary.com/')) external.add(u);
    return r.abort();
  });
  await page.goto(pathToFileURL(TARGET).href);
  for (const route of [...pages.keys(), NOT_FOUND]) {
    await page.evaluate((r) => (location.hash = r === '/' ? '#/' : `#${r}`), route);
    await page.waitForTimeout(150);
    const r = await page.evaluate(() => ({
      route: document.querySelector('main#main')?.dataset.pvRoute,
      h1: document.querySelectorAll('main h1').length,
      overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      emptyMain: !document.querySelector('main#main')?.children.length,
    }));
    if (r.route !== route) problems.push(`${route}: rendered ${r.route}`);
    if (r.h1 !== 1) problems.push(`${route}: ${r.h1} h1`);
    if (r.overflow) problems.push(`${route}: horizontal overflow at 390px`);
    if (r.emptyMain) problems.push(`${route}: empty main`);
  }
  // Menu opens and closes; theme toggles.
  await page.evaluate(() => (location.hash = '#/'));
  await page.waitForTimeout(150);
  const menuOk = await page.evaluate(async () => {
    const btn = document.querySelector('button[aria-label="Menu"]');
    btn?.click();
    const open = !!document.querySelector('dialog[open]');
    document.querySelector('dialog[open]')?.close();
    return open;
  });
  if (!menuOk) problems.push('menu dialog did not open');
  const themeOk = await page.evaluate(() => {
    const before = document.documentElement.dataset.theme;
    document.querySelector('button[aria-label^="Switch to"]')?.click();
    return before !== document.documentElement.dataset.theme;
  });
  if (!themeOk) problems.push('theme toggle did not change the theme');
  // Product page: the sticky purchase bar appears (with its button) once the panel scrolls away.
  const product = [...pages.keys()].find((r) => r.startsWith('/products/'));
  if (product) {
    await page.evaluate((r) => (location.hash = `#${r}`), product);
    await page.waitForTimeout(150);
    // Scroll as a person would, so the panel passes through the viewport.
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight / 2; y += 200) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 40));
      }
    });
    await page.waitForTimeout(400);
    const bar = await page.evaluate(() => {
      const el = document.querySelector('[class*="__stickyBar"]');
      return el ? { shown: el.hasAttribute('data-show'), button: !!el.querySelector('button') } : null;
    });
    if (bar && !(bar.shown && bar.button)) problems.push(`${product}: sticky purchase bar did not appear`);
  }
  if (external.size) problems.push(`requests outside the file: ${[...external].join(', ')}`);
  if (errors.length) problems.push(`errors: ${errors.join(' | ')}`);
  await context.close();
  console.log(problems.length ? `PROBLEMS:\n- ${problems.join('\n- ')}` : `Checked ${pages.size + 1} pages offline at 390px: no problems.`);
  if (problems.length) process.exitCode = 1;
}

await browser.close();

/* ───────────────────────────────────────────────────────────── runtime */

// Runs inside the preview file. Kept dependency-free and self-contained.
function previewRuntime() {
  const cfg = JSON.parse(document.getElementById('pv-config').textContent);
  const main = document.getElementById('main');
  const root = document.documentElement;
  const pageTpl = new Map([...document.querySelectorAll('template[data-pv-page]')].map((t) => [t.dataset.pvPage, t]));
  const frameTpl = new Map([...document.querySelectorAll('template[data-pv-frame]')].map((t) => [t.dataset.pvFrame, t]));
  const variantTpl = new Map([...document.querySelectorAll('template[data-pv-variant]')].map((t) => [t.dataset.pvVariant, t]));
  const header = document.querySelector('header');
  const PREVIEW = 'this file is an offline preview of the store.';
  let lastHash = null;

  main.tabIndex = -1;

  /* toast — inside an open modal dialog when there is one, so it stays visible */
  const toastEl = document.createElement('div');
  toastEl.className = 'pv-toast';
  toastEl.setAttribute('role', 'status');
  let toastTimer = 0;
  function toast(message) {
    (document.querySelector('dialog[open]') || document.body).appendChild(toastEl);
    toastEl.textContent = message;
    requestAnimationFrame(() => toastEl.setAttribute('data-show', ''));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.removeAttribute('data-show'), 5200);
  }
  function needsStore(path) {
    if (path.startsWith('/account')) return `Sign-in and accounts work on the live store — ${PREVIEW}`;
    if (path.startsWith('/search')) return `Search works on the live store — ${PREVIEW} Browse all bags from Shop.`;
    if (path.startsWith('/checkout') || path.startsWith('/orders')) return `Checkout and orders work on the live store — ${PREVIEW}`;
    return `This page needs the live store — ${PREVIEW}`;
  }

  /* routing (#/path?query) */
  function parse(hash) {
    const raw = (hash || '').replace(/^#/, '');
    if (!raw.startsWith('/')) return null;
    const [p, q = ''] = raw.split('?');
    return { path: p.length > 1 ? p.replace(/\/+$/, '') : '/', params: new URLSearchParams(q) };
  }
  function isActive(path, href) {
    return href === '/' ? path === '/' : path === href || path.startsWith(`${href}/`);
  }
  function render(initial) {
    const r = parse(location.hash) || { path: '/', params: new URLSearchParams() };
    let tpl = pageTpl.get(r.path);
    if (!tpl) {
      const serverOnly = cfg.serverOnly.some((s) => r.path === s || r.path.startsWith(`${s}/`));
      if (serverOnly && lastHash !== null) {
        toast(needsStore(r.path));
        history.replaceState(null, '', lastHash);
        return;
      }
      tpl = pageTpl.get(cfg.notFound);
    }
    closeDialogs();
    main.replaceChildren(tpl.content.cloneNode(true));
    main.dataset.pvRoute = pageTpl.get(r.path) ? r.path : cfg.notFound;
    document.title = tpl.dataset.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', tpl.dataset.description || '');
    if (header) {
      if (r.path === '/') header.setAttribute('data-home', '');
      else header.removeAttribute('data-home');
      header.querySelectorAll('nav a[href^="#/"], a[class*="utility"][href^="#/"]').forEach((a) => {
        const href = parse(a.getAttribute('href')).path;
        if (isActive(r.path, href) && href !== '/') a.setAttribute('aria-current', 'page');
        else a.removeAttribute('aria-current');
      });
    }
    applyParams(r);
    sweepImages(main);
    wireStickyBars();
    lastHash = location.hash || '#/';
    if (!initial) {
      window.scrollTo(0, 0);
      main.focus({ preventScroll: true });
    }
  }
  function applyParams(r) {
    const form = main.querySelector('form[data-pv-form]');
    if (!form) return;
    if (r.params.get('mode') === 'callback') {
      const modes = [...form.querySelectorAll('[aria-label="Type of request"] button')];
      const i = modes.findIndex((b) => /callback/i.test(b.textContent));
      if (i >= 0 && modes[i].getAttribute('aria-pressed') !== 'true') swapForm(form, i);
    }
    const f = main.querySelector('form[data-pv-form]');
    const piece = r.params.get('piece');
    const select = f && f.querySelector('select[name="pieceId"]');
    if (piece && select && [...select.options].some((o) => o.value === piece)) select.value = piece;
    const message = r.params.get('message');
    const area = f && f.querySelector('textarea[name="message"]');
    if (message && area && !area.value) area.value = message;
  }
  window.addEventListener('hashchange', () => render(false));

  /* dialogs */
  function openDialog(key) {
    const d = document.querySelector(`dialog[data-pv-dialog="${CSS.escape(key)}"]`);
    if (!d || d.open) return;
    d.showModal();
    root.classList.add('is-locked');
  }
  function closeDialogs() {
    document.querySelectorAll('dialog[open]').forEach((d) => d.close());
  }
  document.addEventListener(
    'close',
    (e) => {
      if (e.target.tagName === 'DIALOG' && !document.querySelector('dialog[open]')) root.classList.remove('is-locked');
    },
    true,
  );

  /* theme */
  function setTheme(next) {
    root.dataset.theme = next;
    try {
      localStorage.setItem('maaira-theme', next);
    } catch {
      /* storage unavailable: the choice lasts for this visit */
    }
    document.querySelectorAll('button[aria-label^="Switch to"]').forEach((b) => {
      b.setAttribute('aria-label', next === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
      b.setAttribute('title', next === 'dark' ? 'Light theme' : 'Dark theme');
      b.querySelector('[data-theme-glyph]')?.setAttribute('data-theme-glyph', next);
    });
  }
  setTheme(root.dataset.theme === 'light' ? 'light' : 'dark');

  /* galleries and form variants (captured from the live components) */
  function swapGallery(section, index, focusSel) {
    const route = main.dataset.pvRoute;
    const thumbs = section.querySelectorAll('[aria-label="Choose a view"] button').length;
    if (!thumbs) return;
    const i = ((index % thumbs) + thumbs) % thumbs;
    const tpl = frameTpl.get(`${route}|${section.dataset.pvGallery}|${i}`);
    if (!tpl) return;
    const next = tpl.content.firstElementChild.cloneNode(true);
    section.replaceWith(next);
    sweepImages(next);
    if (focusSel) next.querySelector(focusSel)?.focus();
  }
  function swapForm(form, modeIndex) {
    const tpl = variantTpl.get(`${main.dataset.pvRoute}|${form.dataset.pvForm}|${modeIndex}`);
    if (!tpl) return;
    const next = tpl.content.firstElementChild.cloneNode(true);
    for (const name of ['name', 'email', 'phone', 'pieceId', 'message']) {
      const from = form.elements.namedItem(name);
      const to = next.elements.namedItem(name);
      if (from && to && 'value' in from && 'value' in to && from.value) to.value = from.value;
    }
    form.replaceWith(next);
    next.querySelectorAll('[aria-label="Type of request"] button')[modeIndex]?.focus();
  }

  /* clicks */
  document.addEventListener('click', (e) => {
    const t = e.target instanceof Element ? e.target : null;
    if (!t) return;
    const a = t.closest('a[href]');
    if (a) {
      const href = a.getAttribute('href');
      if (href.startsWith('#/')) {
        if (href === location.hash) {
          e.preventDefault();
          render(false);
        }
        return;
      }
      if (href.startsWith('#')) {
        e.preventDefault();
        const el = document.getElementById(decodeURIComponent(href.slice(1)));
        if (el) {
          if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
          el.focus();
          el.scrollIntoView();
        }
        return;
      }
      if (href.startsWith('/')) {
        e.preventDefault();
        toast(needsStore(href.split(/[?#]/)[0]));
      }
      return; // external, mailto:, tel:
    }

    const btn = t.closest('button');
    if (!btn) {
      if (t.tagName === 'DIALOG') t.close(); // backdrop
      return;
    }
    if (btn.disabled || (btn.type === 'submit' && btn.form)) return;
    const label = btn.getAttribute('aria-label') || btn.textContent.trim();

    if (btn.dataset.pvOpens) return openDialog(btn.dataset.pvOpens);
    if (btn.closest('dialog') && (/close/i.test(btn.className) || /^close\b/i.test(label))) return btn.closest('dialog').close();
    if (/^Switch to (light|dark) theme$/.test(label)) return setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');

    const gallery = btn.closest('[data-pv-gallery]');
    if (gallery) {
      const cur = Number(gallery.dataset.pvIndex || 0);
      const thumbs = [...gallery.querySelectorAll('[aria-label="Choose a view"] button')];
      const ti = thumbs.indexOf(btn);
      if (ti >= 0) return swapGallery(gallery, ti, `[aria-label="Choose a view"] button:nth-child(${ti + 1})`);
      if (label === 'Previous image') return swapGallery(gallery, cur - 1, '[aria-label="Previous image"]');
      if (label === 'Next image') return swapGallery(gallery, cur + 1, '[aria-label="Next image"]');
    }

    const modes = btn.closest('[aria-label="Type of request"]');
    if (modes) {
      const i = [...modes.querySelectorAll('button')].indexOf(btn);
      if (btn.getAttribute('aria-pressed') !== 'true') swapForm(btn.closest('form'), i);
      return;
    }
    if (/^Enquire/i.test(label) && document.getElementById('enquire')) {
      return document.getElementById('enquire').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (btn.getAttribute('aria-controls') === 'shop-panel') {
      location.hash = '#/shop';
      return;
    }
    if (/wishlist/i.test(label)) return toast(`Saving to your wishlist works on the live store — ${PREVIEW}`);
    if (/cart/i.test(label)) return toast(`The cart works on the live store — ${PREVIEW}`);
    toast(`This needs the live store — ${PREVIEW}`);
  });

  /* gallery keyboard (left/right on the photo frame) */
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const frame = e.target instanceof Element && e.target.closest('[aria-roledescription="carousel"]');
    const gallery = frame && frame.closest('[data-pv-gallery]');
    if (!gallery) return;
    e.preventDefault();
    swapGallery(gallery, Number(gallery.dataset.pvIndex || 0) + (e.key === 'ArrowLeft' ? -1 : 1), '[aria-roledescription="carousel"]');
  });

  /* forms */
  document.addEventListener(
    'submit',
    (e) => {
      const form = e.target;
      e.preventDefault();
      if (form.getAttribute('role') === 'search' || form.querySelector('input[type="search"]')) {
        return toast(`Search works on the live store — ${PREVIEW} Browse all bags from Shop.`);
      }
      if (form.elements.namedItem('message') && form.elements.namedItem('name')) return enquiry(form);
      toast(`This needs the live store — ${PREVIEW}`);
    },
    true,
  );

  function enquiry(form) {
    const prefix = (/(\S+__)form\b/.exec(form.className) || [])[1] || '';
    let region = prefix && form.querySelector(`[class~="${prefix}statusRegion"]`);
    if (!region) {
      region = document.createElement('div');
      region.tabIndex = -1;
      form.append(region);
    }
    form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
    const invalid = [...form.querySelectorAll('input[required], textarea[required], select[required]')].filter(
      (el) => !el.value.trim() || !el.checkValidity(),
    );
    const consent = form.querySelector('input[name="consent"]');
    if (consent && !consent.checked) invalid.push(consent);
    if (invalid.length) {
      invalid.forEach((el) => el.setAttribute('aria-invalid', 'true'));
      const p = document.createElement('p');
      p.className = `${prefix}formError`;
      p.setAttribute('role', 'alert');
      p.textContent = consent && !consent.checked ? 'Please complete the highlighted fields and confirm we may contact you.' : 'Please complete the highlighted fields.';
      region.replaceChildren(p);
      invalid[0].focus();
      return;
    }

    const fd = new FormData(form);
    const pressed = form.querySelector('[aria-label="Type of request"] [aria-pressed="true"]');
    const callback = pressed ? /callback/i.test(pressed.textContent) : false;
    const select = form.querySelector('select[name="pieceId"]');
    const piece = select && select.value && select.value !== 'general' ? select.selectedOptions[0].textContent.trim() : '';
    const slot = callback ? form.querySelector('input[name="callbackWindow"]:checked') : null;
    const slotLabel = slot ? slot.closest('label').textContent.trim() : '';
    const head = [
      `Name: ${fd.get('name') || ''}`,
      fd.get('email') ? `Email: ${fd.get('email')}` : '',
      fd.get('phone') ? `Phone: ${fd.get('phone')}` : '',
      piece ? `Piece: ${piece}` : '',
      slotLabel ? `Preferred time for a call: ${slotLabel}` : '',
    ].filter(Boolean);
    const subject = `${callback ? 'Callback request' : 'Enquiry'}${piece ? ` — ${piece}` : ''} | ${cfg.brand}`;
    const params = new URLSearchParams({ subject, body: [...head, '', String(fd.get('message') || '')].join('\n') });
    const mailto = `mailto:${cfg.email}?${params.toString().replace(/\+/g, '%20')}`;

    const box = document.createElement('div');
    box.className = `${prefix}unavailable`;
    box.setAttribute('role', 'alert');
    const p1 = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = 'This is an offline preview of the store';
    p1.append(strong, ', so the form could not send your message. Nothing has been submitted.');
    const p2 = document.createElement('p');
    p2.textContent = 'You can send the same details by email in one step, or call the house directly:';
    const actions = document.createElement('div');
    actions.className = `${prefix}unavailableActions`;
    const mail = document.createElement('a');
    mail.className = `${prefix}secondaryButton`;
    mail.href = mailto;
    mail.textContent = 'Email these details';
    actions.append(mail);
    if (cfg.phoneHref) {
      const call = document.createElement('a');
      call.className = `${prefix}secondaryButton`;
      call.href = cfg.phoneHref;
      call.textContent = `Call ${cfg.phoneDisplay}`;
      actions.append(call);
    }
    box.append(p1, p2, actions);
    region.replaceChildren(box);
    region.focus({ preventScroll: true });
    region.scrollIntoView({ block: 'nearest' });
  }

  /* product photographs (Cloudinary): fade in on load; on failure retry the
     untransformed delivery URL once, then show the brand panel */
  function markLoaded(img) {
    img.setAttribute('data-loaded', '');
  }
  function fallback(img) {
    const prefix = (/(CloudImage-module__\S+?__)img\b/.exec(img.className) || [])[1] || '';
    const span = document.createElement('span');
    span.className = [prefix && `${prefix}fallback`, ...img.className.split(/\s+/).filter((c) => c && !c.startsWith('CloudImage-module__'))].join(' ');
    if (img.alt) {
      span.setAttribute('role', 'img');
      span.setAttribute('aria-label', `${img.alt} (image unavailable)`);
    } else span.setAttribute('aria-hidden', 'true');
    const mark = document.createElement('span');
    mark.className = `logo-mask logo-mask--monogram ${prefix && `${prefix}fallbackMark`}`;
    mark.setAttribute('aria-hidden', 'true');
    span.append(mark);
    img.replaceWith(span);
  }
  function failed(img) {
    const src = img.getAttribute('src') || '';
    if (!src.includes('res.cloudinary.com')) return;
    if (/\/upload\/f_auto[^/]*\//.test(src)) {
      img.removeAttribute('srcset');
      img.removeAttribute('sizes');
      img.src = src.replace(/\/upload\/f_auto[^/]*\//, '/upload/');
    } else fallback(img);
  }
  function sweepImages(scope) {
    scope.querySelectorAll('img').forEach((img) => {
      if (!img.complete) return;
      if (img.naturalWidth) markLoaded(img);
      else if (img.getAttribute('src')) failed(img);
    });
  }
  document.addEventListener('load', (e) => e.target.tagName === 'IMG' && markLoaded(e.target), true);
  document.addEventListener('error', (e) => e.target.tagName === 'IMG' && failed(e.target), true);

  /* mobile sticky purchase bar: shown once the main purchase panel has scrolled away */
  const barFor = new WeakMap();
  let barObserver = null;
  function wireStickyBars() {
    if (barObserver) barObserver.disconnect();
    const bars = [...main.querySelectorAll('[class*="__stickyBar"]')];
    if (!bars.length || !('IntersectionObserver' in window)) return;
    barObserver = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const bar = barFor.get(e.target);
          const action = bar.querySelector('[class*="__stickyAction"]');
          if (!e.isIntersecting && e.boundingClientRect.top < 0) {
            bar.setAttribute('data-show', '');
            bar.setAttribute('aria-hidden', 'false');
            const primary = e.target.querySelector('.btn--primary');
            if (action && primary && !action.firstElementChild) action.append(primary.cloneNode(true));
          } else {
            bar.removeAttribute('data-show');
            bar.setAttribute('aria-hidden', 'true');
            action?.replaceChildren();
          }
        }
      },
      { threshold: 0 },
    );
    for (const bar of bars) {
      const panel = bar.previousElementSibling;
      if (!panel) continue;
      barFor.set(panel, bar);
      barObserver.observe(panel);
    }
  }

  /* header state on scroll */
  const onScroll = () => {
    if (!header) return;
    if (window.scrollY > 24) header.setAttribute('data-scrolled', '');
    else header.removeAttribute('data-scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  /* one-time notice: what this file is */
  let dismissed = false;
  try {
    dismissed = sessionStorage.getItem('maaira-preview-notice') === 'seen';
  } catch {
    /* storage unavailable */
  }
  if (!dismissed) {
    const notice = document.createElement('div');
    notice.className = 'pv-notice';
    notice.setAttribute('role', 'region');
    notice.setAttribute('aria-label', 'About this preview');
    const text = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = 'Offline preview';
    text.append(strong, ` of the ${cfg.brand} store (${cfg.generated}). Browse every page here; the cart, checkout, accounts, search and sending enquiries work on the live store.`);
    const ok = document.createElement('button');
    ok.type = 'button';
    ok.textContent = 'Got it';
    ok.addEventListener('click', (e) => {
      e.stopPropagation();
      notice.remove();
      try {
        sessionStorage.setItem('maaira-preview-notice', 'seen');
      } catch {
        /* storage unavailable */
      }
    });
    notice.append(text, ok);
    document.body.append(notice);
  }

  render(true);
  onScroll();
}
