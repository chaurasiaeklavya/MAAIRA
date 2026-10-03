/**
 * Asset manifest — every product image supplied for the sample showcase.
 *
 * Source: Cloudinary delivery URLs supplied by the client with the creative
 * direction brief (cloud name `h1ztqjkg`). Originals are never modified; the
 * site only requests on-the-fly delivery transformations (format, quality,
 * width) — see `src/lib/cloudinary.ts`.
 *
 * VERIFICATION STATUS (2026-10-03): NOT VISUALLY VERIFIED.
 * res.cloudinary.com is blocked by the build environment's network policy,
 * so none of these images could be opened, measured or compared. Product
 * grouping in `products.ts` is a provisional hypothesis based only on the
 * camera filename sequence and must be confirmed by visual review.
 * See docs/access-asset-readiness.md.
 */

export type VerificationStatus = 'unverified' | 'verified' | 'flagged';

export interface ManifestAsset {
  /** Stable internal identifier. */
  assetId: string;
  originalFilename: string;
  cloudName: string;
  /** Cloudinary version segment, kept so delivery URLs remain cache-stable. */
  version: string;
  publicId: string;
  format: 'jpg' | 'jpeg' | 'png' | 'webp';
  /** Exact delivery URL as supplied. */
  deliveryUrl: string;
  /** Intrinsic size, when known. Unknown until the asset can be inspected. */
  width: number | null;
  height: number | null;
  verification: VerificationStatus;
  notes: string;
}

const CLOUD = 'h1ztqjkg';

function asset(version: string, publicId: string, notes = ''): ManifestAsset {
  return {
    assetId: `MFB-IMG-${publicId.replace('IMG_', '')}`,
    originalFilename: `${publicId}.jpg`,
    cloudName: CLOUD,
    version,
    publicId,
    format: 'jpg',
    deliveryUrl: `https://res.cloudinary.com/${CLOUD}/image/upload/${version}/${publicId}.jpg`,
    width: null,
    height: null,
    verification: 'unverified',
    notes,
  };
}

/** All supplied assets, in camera-filename order. */
export const manifest: ManifestAsset[] = [
  asset('v1791058472', 'IMG_8683'),
  asset('v1791058436', 'IMG_8686'),
  asset('v1791058537', 'IMG_8691'),
  asset('v1791058657', 'IMG_8692'),
  asset('v1791059047', 'IMG_8693'),
  asset('v1791058508', 'IMG_8694'),
  asset('v1791058664', 'IMG_8695'),
  asset('v1791058942', 'IMG_8696'),
  asset('v1791058336', 'IMG_8704', 'Isolated in the filename sequence; held back from the showcase pending visual review.'),
];

export const manifestById = new Map(manifest.map((a) => [a.assetId, a]));
