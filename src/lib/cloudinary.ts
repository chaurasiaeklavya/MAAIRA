import type { ImageAsset } from './catalogue/types';

/**
 * Cloudinary delivery URLs with on-the-fly transformations. Public delivery
 * URLs only — no API keys or secrets reach the browser.
 *
 *  f_auto   → AVIF/WebP where supported
 *  q_auto   → perceptual quality (":good" keeps fine texture detail)
 *  c_limit  → never upscale beyond the original
 */
const WIDTHS = [320, 480, 720, 960, 1280, 1600, 2000] as const;

export function cloudinaryUrl(asset: ImageAsset, width: number, quality: 'good' | 'best' = 'good') {
  const t = `f_auto,q_auto:${quality},c_limit,w_${width}`;
  const version = asset.version ? `${asset.version}/` : '';
  return `https://res.cloudinary.com/${asset.cloudName}/image/upload/${t}/${version}${asset.publicId}.${asset.format}`;
}

export function cloudinarySrcSet(asset: ImageAsset, maxWidth = 2000) {
  return WIDTHS.filter((w) => w <= maxWidth)
    .map((w) => `${cloudinaryUrl(asset, w)} ${w}w`)
    .join(', ');
}
