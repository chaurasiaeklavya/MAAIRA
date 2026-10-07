/**
 * Catalogue types shared by server and client. Built from the database by
 * `src/server/catalogue.ts`; never hand-written in UI components.
 */
export type StagePreset = 'champagne-studio' | 'ivory-plaster' | 'espresso-leather';
export type ImageRole = 'primary' | 'gallery' | 'detail' | 'lifestyle';
export type TermKind = 'style' | 'occasion' | 'collection';
export type Availability = 'unconfirmed' | 'in_stock' | 'made_to_order' | 'out_of_stock';

export interface ImageAsset {
  cloudName: string;
  publicId: string;
  version: string | null;
  format: string;
  deliveryUrl: string;
  width: number | null;
  height: number | null;
}

export interface CatalogueImage {
  assetId: string;
  role: ImageRole;
  alt: string;
  asset: ImageAsset;
}

export interface TermRef {
  id: string;
  kind: TermKind;
  slug: string;
  label: string;
  /** fact · inference · client — shown to staff, never presented as more certain than it is. */
  basis: 'fact' | 'inference' | 'client';
}

export interface Term {
  id: string;
  kind: TermKind;
  slug: string;
  label: string;
  description: string | null;
  synonyms: string[];
  position: number;
}

export interface CatalogueProduct {
  id: string;
  reference: string;
  sku: string | null;
  slug: string;
  name: string;
  summary: string | null;
  description: string | null;
  price: {
    paise: number | null;
    approved: boolean;
    /** "₹24,500" when approved, otherwise the agreed placeholder "₹XXXX". */
    display: string;
  };
  availability: Availability;
  /** True only when price, availability and stock all allow purchase. */
  purchasable: boolean;
  colour: string | null;
  material: string | null;
  dimensions: string | null;
  features: string[];
  tags: string[];
  stage: StagePreset;
  featuredRank: number | null;
  arrivedAt: string | null;
  publishedAt: string | null;
  images: CatalogueImage[];
  terms: TermRef[];
}

export const stylesOf = (p: CatalogueProduct) => p.terms.filter((t) => t.kind === 'style');
export const occasionsOf = (p: CatalogueProduct) => p.terms.filter((t) => t.kind === 'occasion');
export const primaryImage = (p: CatalogueProduct) => p.images.find((i) => i.role === 'primary') ?? p.images[0] ?? null;
