/**
 * Initial catalogue import (seed). After launch, staff manage products in
 * /admin and the database is the source of truth; re-running the seed never
 * overwrites a product that already exists.
 *
 * ⚠ PROVISIONAL — awaiting visual review of the 2026-10-07 image intake.
 *
 * The 45 images supplied on 2026-10-07 could not be opened from the build
 * environment (Cloudinary is blocked by its network policy), so they have
 * NOT been grouped into products yet; every one is in the media library as
 * `pending`. The three pieces below carry over from the first showcase and
 * were grouped by camera-filename sequence only (confidence: low). They have
 * no style/occasion tags, no price, no colour and no availability because
 * none of that could be verified. Replace this file's contents (or edit in
 * /admin) once the images have been reviewed — see
 * docs/catalogue-image-analysis.md.
 */
export interface ProductSeed {
  reference: string;
  slug: string;
  name: string;
  nameStatus: 'working' | 'approved';
  summary: string | null;
  description: string | null;
  copyStatus: 'draft' | 'approved';
  pricePaise: number | null;
  priceStatus: 'pending' | 'approved';
  status: 'draft' | 'published' | 'archived';
  availability: 'unconfirmed' | 'in_stock' | 'made_to_order' | 'out_of_stock';
  trackInventory: boolean;
  stock: number | null;
  colour: string | null;
  material: string | null;
  dimensions: string | null;
  features: string[];
  tags: string[];
  featuredRank: number | null;
  arrivedAt: string | null;
  internalNotes: string | null;
  stage: 'champagne-studio' | 'ivory-plaster' | 'espresso-leather';
  images: { assetId: string; role: 'primary' | 'gallery' | 'detail' | 'lifestyle'; alt: string }[];
  terms: { id: string; basis: 'fact' | 'inference' | 'client'; evidence: string }[];
}

const PROVISIONAL_NOTE =
  'PROVISIONAL: grouped by camera filename sequence only; images not visually compared. ' +
  'Confirm grouping, primary image, name, price, colour and availability before launch.';

const base = {
  nameStatus: 'working',
  copyStatus: 'draft',
  pricePaise: null,
  priceStatus: 'pending',
  status: 'published',
  availability: 'unconfirmed',
  trackInventory: false,
  stock: null,
  colour: null,
  material: null,
  dimensions: null,
  features: [],
  tags: [],
  arrivedAt: null,
  terms: [],
} as const;

export const PRODUCT_SEEDS: ProductSeed[] = [
  {
    ...base,
    features: [],
    tags: [],
    terms: [],
    reference: 'MFB-P-001',
    slug: 'no-01',
    stage: 'champagne-studio',
    name: 'Piece Nº 01',
    summary: 'Quiet confidence, in its first appearance.',
    description:
      'The opening piece of this first look. Nº 01 introduces the MAAIRA sensibility — elegance held in restraint, designed to be carried and remembered.',
    featuredRank: 1,
    internalNotes: `${PROVISIONAL_NOTE} Images only exist in the 2026-10-03 batch (cloud h1ztqjkg).`,
    images: [
      { assetId: 'MFB-IMG-8683', role: 'primary', alt: 'Piece Nº 01, view 1' },
      { assetId: 'MFB-IMG-8686', role: 'gallery', alt: 'Piece Nº 01, view 2' },
    ],
  },
  {
    ...base,
    features: [],
    tags: [],
    terms: [],
    reference: 'MFB-P-002',
    slug: 'no-02',
    stage: 'ivory-plaster',
    name: 'Piece Nº 02',
    summary: 'Elegance, held in restraint.',
    description:
      'Nº 02 continues the story with an understated presence — a piece to be appreciated slowly, up close, in every view.',
    featuredRank: 2,
    internalNotes: `${PROVISIONAL_NOTE} IMG_8691 is also in the 2026-10-07 intake; IMG_8692/8693 are not.`,
    images: [
      { assetId: 'MFB-IMG-8691', role: 'primary', alt: 'Piece Nº 02, view 1' },
      { assetId: 'MFB-IMG-8692', role: 'gallery', alt: 'Piece Nº 02, view 2' },
      { assetId: 'MFB-IMG-8693', role: 'gallery', alt: 'Piece Nº 02, view 3' },
    ],
  },
  {
    ...base,
    features: [],
    tags: [],
    terms: [],
    reference: 'MFB-P-003',
    slug: 'no-03',
    stage: 'espresso-leather',
    name: 'Piece Nº 03',
    summary: 'An assured, unhurried finish.',
    description:
      'Nº 03 completes the first look — a refined expression of the house’s taste for elegance without excess.',
    featuredRank: 3,
    internalNotes: `${PROVISIONAL_NOTE} IMG_8694 is also in the 2026-10-07 intake; IMG_8695/8696 are not.`,
    images: [
      { assetId: 'MFB-IMG-8694', role: 'primary', alt: 'Piece Nº 03, view 1' },
      { assetId: 'MFB-IMG-8695', role: 'gallery', alt: 'Piece Nº 03, view 2' },
      { assetId: 'MFB-IMG-8696', role: 'gallery', alt: 'Piece Nº 03, view 3' },
    ],
  },
];

/** Assets deliberately held back from any product, with the reason. */
export const HELD_ASSETS: Record<string, string> = {
  'MFB-IMG-8704': 'Isolated in the filename sequence; held pending visual review.',
};
