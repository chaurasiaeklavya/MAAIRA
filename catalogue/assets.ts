/**
 * Media intake — every image URL the business has supplied, parsed into
 * stable asset records. Nothing here is a product decision; grouping lives
 * in `products.ts` and in the database (product_images).
 *
 * Batches
 *  - 2026-10-03 · cloud `h1ztqjkg` · 9 URLs (first showcase brief)
 *  - 2026-10-07 · cloud `nzubasgf` · 48 URLs supplied, 45 unique
 *    (IMG_8707, IMG_8712 and IMG_8769 were each listed twice with identical URLs)
 *
 * IMG_8691, IMG_8694 and IMG_8704 appear in both batches. Same camera
 * filename, so they're presumed to be the same photograph re-uploaded; the
 * current (2026-10-07) URL is used for delivery and the earlier one is kept
 * in `alternateUrls`. Byte-identity has not been verified.
 *
 * VISUAL STATUS: none of these images could be opened from the build
 * environment (res.cloudinary.com is blocked by its network policy), so
 * dimensions are unknown and nothing has been visually reviewed.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface AssetSeed {
  id: string;
  cloudName: string;
  publicId: string;
  version: string;
  format: string;
  deliveryUrl: string;
  alternateUrls: string[];
  originalFilename: string;
  intakeBatch: string;
  reviewStatus: 'pending' | 'assigned' | 'held' | 'rejected';
  reviewNotes: string | null;
}

const URL_RE = /^https:\/\/res\.cloudinary\.com\/([a-z0-9-]+)\/image\/upload\/(v\d+)\/([A-Za-z0-9_-]+)\.(jpg|jpeg|png|webp)$/;

export function parseCloudinaryUrl(url: string) {
  const m = url.trim().match(URL_RE);
  if (!m) return null;
  const [, cloudName, version, publicId, format] = m;
  return { cloudName, version, publicId, format, deliveryUrl: url.trim() };
}

const EARLIER_BATCH = '2026-10-03 · h1ztqjkg';
const CURRENT_BATCH = '2026-10-07 · nzubasgf';

const earlierUrls = [
  'https://res.cloudinary.com/h1ztqjkg/image/upload/v1791058472/IMG_8683.jpg',
  'https://res.cloudinary.com/h1ztqjkg/image/upload/v1791058436/IMG_8686.jpg',
  'https://res.cloudinary.com/h1ztqjkg/image/upload/v1791058537/IMG_8691.jpg',
  'https://res.cloudinary.com/h1ztqjkg/image/upload/v1791058657/IMG_8692.jpg',
  'https://res.cloudinary.com/h1ztqjkg/image/upload/v1791059047/IMG_8693.jpg',
  'https://res.cloudinary.com/h1ztqjkg/image/upload/v1791058508/IMG_8694.jpg',
  'https://res.cloudinary.com/h1ztqjkg/image/upload/v1791058664/IMG_8695.jpg',
  'https://res.cloudinary.com/h1ztqjkg/image/upload/v1791058942/IMG_8696.jpg',
  'https://res.cloudinary.com/h1ztqjkg/image/upload/v1791058336/IMG_8704.jpg',
];

export function readIntake(file: string) {
  return readFileSync(file, 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

export function buildAssets(currentUrls: string[]): { assets: AssetSeed[]; duplicates: string[]; rejected: string[] } {
  const byId = new Map<string, AssetSeed>();
  const duplicates: string[] = [];
  const rejected: string[] = [];

  const add = (url: string, batch: string) => {
    const p = parseCloudinaryUrl(url);
    if (!p) {
      rejected.push(url);
      return;
    }
    const id = `MFB-IMG-${p.publicId.replace(/^IMG_/, '')}`;
    const existing = byId.get(id);
    if (existing) {
      if (existing.deliveryUrl === p.deliveryUrl || existing.alternateUrls.includes(p.deliveryUrl)) {
        duplicates.push(url);
        return;
      }
      // Same camera file from a newer batch: newer URL becomes primary.
      existing.alternateUrls.push(existing.deliveryUrl);
      Object.assign(existing, { ...p, intakeBatch: batch });
      return;
    }
    byId.set(id, {
      id,
      ...p,
      alternateUrls: [],
      originalFilename: `${p.publicId}.${p.format}`,
      intakeBatch: batch,
      reviewStatus: 'pending',
      reviewNotes: null,
    });
  };

  earlierUrls.forEach((u) => add(u, EARLIER_BATCH));
  currentUrls.forEach((u) => add(u, CURRENT_BATCH));
  return { assets: [...byId.values()].sort((a, b) => a.id.localeCompare(b.id)), duplicates, rejected };
}

export function loadAssets(root = process.cwd()) {
  return buildAssets(readIntake(join(root, 'catalogue/intake/2026-10-07-cloudinary-urls.txt')));
}
