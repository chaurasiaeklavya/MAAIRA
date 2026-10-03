/**
 * Sample showcase products — the 2–3 pieces shown for client approval.
 *
 * This is the single place to update when the client confirms names, prices,
 * colours and image groupings. The full catalogue is out of scope until the
 * showcase is approved.
 *
 * ⚠ PROVISIONAL DATA — read before presenting:
 *  - Image grouping is a hypothesis from the camera filename sequence only
 *    (IMG_8683/8686 · IMG_8691–8693 · IMG_8694–8696). The images could not be
 *    opened from the build environment, so silhouettes, colours and angles
 *    have NOT been compared. `grouping.status` stays 'provisional' until a
 *    visual review confirms each group.
 *  - Display names ("Nº 01" …) are neutral catalogue references, not official
 *    model names.
 *  - Descriptions deliberately avoid any physical claim (material, colour,
 *    hardware, size, use) because none could be verified from the imagery.
 *  - Prices are placeholders and must be supplied by the client.
 */
import { manifestById, type ManifestAsset } from './asset-manifest';

export type StagePreset = 'champagne-studio' | 'ivory-plaster' | 'espresso-leather';
export type ImageRole = 'primary' | 'angle' | 'detail';

export interface ProductImageRef {
  assetId: string;
  role: ImageRole;
  alt: string;
}

export interface Product {
  id: string;
  slug: string;
  /** Neutral catalogue reference shown in the UI. */
  number: string;
  displayName: string;
  displayNameStatus: 'working-title' | 'client-approved';
  tagline: string;
  description: string;
  copyStatus: 'draft-pending-visual-review' | 'client-approved';
  price: {
    /** Numeric amount in INR once supplied by the client. */
    amount: number | null;
    display: string;
    status: 'placeholder' | 'client-approved';
  };
  /** Only set when visibly confirmed or supplied by the client. */
  colour: string | null;
  stage: StagePreset;
  images: ProductImageRef[];
  grouping: {
    status: 'provisional' | 'verified';
    confidence: 'low' | 'medium' | 'high';
    basis: string;
  };
  clientConfirmation: string[];
}

const PRICE_PLACEHOLDER = { amount: null, display: '₹XXXX', status: 'placeholder' } as const;

const COMMON_CONFIRMATIONS = [
  'Official product name',
  'Price (INR) and tax treatment',
  'Colour / variant name',
  'Image grouping and primary image',
  'Description copy',
];

export const products: Product[] = [
  {
    id: 'mfb-sample-01',
    slug: 'no-01',
    number: 'Nº 01',
    displayName: 'Piece Nº 01',
    displayNameStatus: 'working-title',
    tagline: 'Quiet confidence, in its first appearance.',
    description:
      'The opening piece of this first look. Nº 01 introduces the MAAIRA sensibility — elegance held in restraint, designed to be carried and remembered.',
    copyStatus: 'draft-pending-visual-review',
    price: PRICE_PLACEHOLDER,
    colour: null,
    stage: 'champagne-studio',
    images: [
      { assetId: 'MFB-IMG-8683', role: 'primary', alt: 'Piece Nº 01 — view 1' },
      { assetId: 'MFB-IMG-8686', role: 'angle', alt: 'Piece Nº 01 — view 2' },
    ],
    grouping: {
      status: 'provisional',
      confidence: 'low',
      basis: 'Adjacent camera filenames (IMG_8683, IMG_8686). Not visually compared.',
    },
    clientConfirmation: COMMON_CONFIRMATIONS,
  },
  {
    id: 'mfb-sample-02',
    slug: 'no-02',
    number: 'Nº 02',
    displayName: 'Piece Nº 02',
    displayNameStatus: 'working-title',
    tagline: 'Elegance, held in restraint.',
    description:
      'Nº 02 continues the story with an understated presence — a piece to be appreciated slowly, up close, in every view.',
    copyStatus: 'draft-pending-visual-review',
    price: PRICE_PLACEHOLDER,
    colour: null,
    stage: 'ivory-plaster',
    images: [
      { assetId: 'MFB-IMG-8691', role: 'primary', alt: 'Piece Nº 02 — view 1' },
      { assetId: 'MFB-IMG-8692', role: 'angle', alt: 'Piece Nº 02 — view 2' },
      { assetId: 'MFB-IMG-8693', role: 'angle', alt: 'Piece Nº 02 — view 3' },
    ],
    grouping: {
      status: 'provisional',
      confidence: 'low',
      basis: 'Consecutive camera filenames (IMG_8691–IMG_8693). Not visually compared.',
    },
    clientConfirmation: COMMON_CONFIRMATIONS,
  },
  {
    id: 'mfb-sample-03',
    slug: 'no-03',
    number: 'Nº 03',
    displayName: 'Piece Nº 03',
    displayNameStatus: 'working-title',
    tagline: 'An assured, unhurried finish.',
    description:
      'Nº 03 completes the first look — a refined expression of the house’s taste for elegance without excess.',
    copyStatus: 'draft-pending-visual-review',
    price: PRICE_PLACEHOLDER,
    colour: null,
    stage: 'espresso-leather',
    images: [
      { assetId: 'MFB-IMG-8694', role: 'primary', alt: 'Piece Nº 03 — view 1' },
      { assetId: 'MFB-IMG-8695', role: 'angle', alt: 'Piece Nº 03 — view 2' },
      { assetId: 'MFB-IMG-8696', role: 'angle', alt: 'Piece Nº 03 — view 3' },
    ],
    grouping: {
      status: 'provisional',
      confidence: 'low',
      basis: 'Consecutive camera filenames (IMG_8694–IMG_8696). Not visually compared.',
    },
    clientConfirmation: COMMON_CONFIRMATIONS,
  },
];

export interface ResolvedImage extends ProductImageRef {
  asset: ManifestAsset;
}

export function resolveImages(product: Product): ResolvedImage[] {
  return product.images.flatMap((ref) => {
    const asset = manifestById.get(ref.assetId);
    return asset ? [{ ...ref, asset }] : [];
  });
}

export function findProduct(slug: string | null | undefined) {
  return products.find((p) => p.slug === slug) ?? null;
}
