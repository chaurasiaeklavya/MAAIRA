import type { ManifestAsset } from '@/data/asset-manifest';

/**
 * Builds Cloudinary delivery URLs with on-the-fly transformations.
 * Only public delivery URLs are used — no API keys or secrets in the frontend.
 *
 *  f_auto   → AVIF/WebP where the browser supports it
 *  q_auto   → perceptual quality selection (":good" keeps fine texture detail)
 *  c_limit  → never upscale beyond the original
 *  dpr is handled by the srcset width ladder.
 */
const WIDTHS = [480, 720, 960, 1280, 1600, 2000] as const;

export function cloudinaryUrl(asset: ManifestAsset, width: number, quality: 'good' | 'best' = 'good') {
  const t = `f_auto,q_auto:${quality},c_limit,w_${width}`;
  return `https://res.cloudinary.com/${asset.cloudName}/image/upload/${t}/${asset.version}/${asset.publicId}.${asset.format}`;
}

export function cloudinarySrcSet(asset: ManifestAsset, maxWidth = 2000) {
  return WIDTHS.filter((w) => w <= maxWidth)
    .map((w) => `${cloudinaryUrl(asset, w)} ${w}w`)
    .join(', ');
}
