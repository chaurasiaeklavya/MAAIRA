/**
 * Builds derivative brand assets from the untouched original logo and
 * generates the original, procedural leather-grain textures used by the UI.
 *
 *   node scripts/build-brand-assets.mjs
 *
 * Inputs (never modified):
 *   public/brand/maaira-logo-original.jpg   — official logo as supplied by the client
 *
 * Outputs (derivatives, safe to regenerate):
 *   public/brand/maaira-monogram-mask.png   — monogram only, white + alpha
 *   public/brand/maaira-wordmark-mask.png   — "MAAIRA" + "LUXURY" lines, white + alpha
 *   public/brand/maaira-lockup-mask.png     — full lockup, white + alpha
 *   public/textures/leather-height.webp     — tileable grain height map (WebGL hero)
 *   public/textures/leather-lit.webp        — tileable pre-lit grain (CSS overlays)
 *   src/app/icon.png, src/app/apple-icon.png
 *
 * Logo extraction is a luminance key only: pixels are never redrawn or
 * reshaped, so the letterforms, spacing and proportions stay exactly as
 * supplied. The silver letters (~#e1dfdc) sit on a dark espresso
 * background (~#1c1614, max luminance ≈ 70), so a ramp between 92 and 168
 * separates them cleanly and keeps the bevelled edges anti-aliased.
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const SRC = 'public/brand/maaira-logo-original.jpg';
const LO = 92;
const HI = 168;

// Element bounds measured from the 1080×1080 original (rows/cols with luminance > 150).
const REGIONS = {
  monogram: { left: 346, top: 202, right: 731, bottom: 458 },
  wordmark: { left: 137, top: 568, right: 939, bottom: 740 },
  lockup: { left: 137, top: 202, right: 939, bottom: 740 },
};
const PAD = 10;

await mkdir('public/brand', { recursive: true });
await mkdir('public/textures', { recursive: true });

const original = await readFile(SRC);
console.log('original sha256', createHash('sha256').update(original).digest('hex'));

const { data, info } = await sharp(original).raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

function extract(name, r) {
  const left = Math.max(0, r.left - PAD);
  const top = Math.max(0, r.top - PAD);
  const w = Math.min(width, r.right + PAD + 1) - left;
  const h = Math.min(height, r.bottom + PAD + 1) - top;
  const out = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = ((top + y) * width + (left + x)) * channels;
      const lum = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      let a = (lum - LO) / (HI - LO);
      a = Math.min(1, Math.max(0, a));
      a = a * a * (3 - 2 * a); // smoothstep keeps edges crisp but anti-aliased
      const o = (y * w + x) * 4;
      out[o] = out[o + 1] = out[o + 2] = 255;
      out[o + 3] = Math.round(a * 255);
    }
  }
  return sharp(out, { raw: { width: w, height: h, channels: 4 } })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(`public/brand/maaira-${name}-mask.png`)
    .then((res) => console.log(`maaira-${name}-mask.png`, `${w}×${h}`, `${res.size} B`));
}

for (const [name, r] of Object.entries(REGIONS)) await extract(name, r);

/* ------------------------------------------------------------------ */
/* Procedural leather grain (original work, tileable 512×512)          */
/* ------------------------------------------------------------------ */

const N = 512;

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Tileable Worley sampler: returns { f1, f2 } in cell units at float coords. */
function makeWorley(cells, seed) {
  const rand = mulberry32(seed);
  const pts = new Float32Array(cells * cells * 2);
  for (let i = 0; i < cells * cells; i++) {
    pts[i * 2] = 0.08 + rand() * 0.84;
    pts[i * 2 + 1] = 0.08 + rand() * 0.84;
  }
  const cs = N / cells;
  return (x, y) => {
    const fx = x / cs;
    const fy = y / cs;
    const cx = Math.floor(fx);
    const cy = Math.floor(fy);
    let f1 = 1e9;
    let f2 = 1e9;
    for (let oy = -1; oy <= 1; oy++) {
      for (let ox = -1; ox <= 1; ox++) {
        const gx = cx + ox;
        const gy = cy + oy;
        const wx = ((gx % cells) + cells) % cells;
        const wy = ((gy % cells) + cells) % cells;
        const d = Math.hypot(gx + pts[(wy * cells + wx) * 2] - fx, gy + pts[(wy * cells + wx) * 2 + 1] - fy);
        if (d < f1) {
          f2 = f1;
          f1 = d;
        } else if (d < f2) f2 = d;
      }
    }
    return { f1, f2 };
  };
}

/** Tileable value noise for fine surface variation. */
function valueNoise(freq, seed) {
  const rand = mulberry32(seed);
  const g = new Float32Array(freq * freq).map(() => rand());
  const out = new Float32Array(N * N);
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const fx = (x / N) * freq;
      const fy = (y / N) * freq;
      const x0 = Math.floor(fx);
      const y0 = Math.floor(fy);
      const tx = fx - x0;
      const ty = fy - y0;
      const sx = tx * tx * (3 - 2 * tx);
      const sy = ty * ty * (3 - 2 * ty);
      const at = (a, b) => g[(((b % freq) + freq) % freq) * freq + (((a % freq) + freq) % freq)];
      const a = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * sx;
      const b = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * sx;
      out[y * N + x] = a + (b - a) * sy;
    }
  }
  return out;
}

const smooth = (e0, e1, v) => {
  const t = Math.min(1, Math.max(0, (v - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

console.time('leather');
const major = makeWorley(22, 7); // primary grain cells
const minor = makeWorley(58, 19); // shallow secondary wrinkles
const warpX = valueNoise(8, 3);
const warpY = valueNoise(8, 9);
const warpFineX = valueNoise(24, 23);
const warpFineY = valueNoise(24, 29);
const micro = valueNoise(128, 11);
const drift = valueNoise(5, 5);

const heightMap = new Float32Array(N * N);
for (let y = 0; y < N; y++) {
  for (let x = 0; x < N; x++) {
    const i = y * N + x;
    // Domain warp (tileable) breaks the regular cell pattern into organic polygons.
    const wx = x + (warpX[i] - 0.5) * 26 + (warpFineX[i] - 0.5) * 7;
    const wy = y + (warpY[i] - 0.5) * 26 + (warpFineY[i] - 0.5) * 7;
    const a = major(wx, wy);
    const b = minor(wx * 1.0 + 7, wy * 1.0 + 3);
    const creaseA = 0.35 + 0.65 * smooth(0.0, 0.22, a.f2 - a.f1); // fine, deep creases between cells
    const creaseB = smooth(0.0, 0.14, b.f2 - b.f1); // shallow wrinkles inside cells
    const dome = 1 - smooth(0.25, 0.9, a.f1) * 0.18;
    heightMap[i] = creaseA * (0.86 + 0.14 * creaseB) * dome * (0.92 + 0.08 * drift[i]) + (micro[i] - 0.5) * 0.07;
  }
}
let mn = Infinity;
let mx = -Infinity;
for (const v of heightMap) {
  mn = Math.min(mn, v);
  mx = Math.max(mx, v);
}
const h8 = Buffer.alloc(N * N);
for (let i = 0; i < N * N; i++) h8[i] = Math.round(((heightMap[i] - mn) / (mx - mn)) * 255);

await sharp(h8, { raw: { width: N, height: N, channels: 1 } })
  .webp({ quality: 92 })
  .toFile('public/textures/leather-height.webp')
  .then((r) => console.log('leather-height.webp', `${r.size} B`));

// Pre-lit version (light from upper-left) for CSS overlay use, centred on mid-grey.
const lit = Buffer.alloc(N * N);
const L = [-0.55, -0.6, 0.58];
const ll = Math.hypot(...L);
const flat = L[2] / ll;
const hAt = (x, y) => heightMap[(((y + N) % N) * N + ((x + N) % N))];
for (let y = 0; y < N; y++) {
  for (let x = 0; x < N; x++) {
    const dx = (hAt(x + 1, y) - hAt(x - 1, y)) * 1.8;
    const dy = (hAt(x, y + 1) - hAt(x, y - 1)) * 1.8;
    const nl = Math.hypot(dx, dy, 1);
    const d = (-dx * L[0] - dy * L[1] + L[2]) / (nl * ll);
    const v = 128 + (d - flat) * 150 + (hAt(x, y) - 0.65) * 34;
    lit[y * N + x] = Math.max(0, Math.min(255, Math.round(v)));
  }
}
await sharp(lit, { raw: { width: N, height: N, channels: 1 } })
  .webp({ quality: 80 })
  .toFile('public/textures/leather-lit.webp')
  .then((r) => console.log('leather-lit.webp', `${r.size} B`));
console.timeEnd('leather');

/* ------------------------------------------------------------------ */
/* App icons: original monogram pixels, silver on espresso             */
/* ------------------------------------------------------------------ */
async function icon(size, file) {
  const mono = await sharp('public/brand/maaira-monogram-mask.png')
    .resize({ width: Math.round(size * 0.66), height: Math.round(size * 0.66), fit: 'inside' })
    .toBuffer();
  const tint = await sharp(mono)
    .composite([{ input: { create: { width: 1, height: 1, channels: 4, background: '#e3e0db' } }, tile: true, blend: 'in' }])
    .toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: '#1c1512' } })
    .composite([{ input: tint, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toFile(file);
  console.log(file);
}
await icon(512, 'src/app/icon.png');
await icon(180, 'src/app/apple-icon.png');
