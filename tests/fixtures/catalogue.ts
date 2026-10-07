/**
 * TEST-ONLY catalogue fixtures. These are not MAAIRA products and are never
 * seeded into a real database; they exist to exercise discovery logic with
 * prices, colours and categories the real (provisional) catalogue lacks.
 */
import type { CatalogueProduct, Term, TermRef } from '../../src/lib/catalogue/types';
import { ALL_TERMS, termId } from '../../catalogue/taxonomy';

export const TERMS: Term[] = ALL_TERMS.map((t, i) => ({ id: termId(t), kind: t.kind, slug: t.slug, label: t.label, description: t.description, synonyms: t.synonyms, position: i }));

const ref = (id: string, basis: TermRef['basis'] = 'inference'): TermRef => {
  const t = TERMS.find((x) => x.id === id);
  if (!t) throw new Error(`unknown term ${id}`);
  return { id, kind: t.kind, slug: t.slug, label: t.label, basis };
};

let n = 0;
export function fixture(over: Partial<CatalogueProduct> & { termIds?: string[] } = {}): CatalogueProduct {
  n++;
  const { termIds = [], ...rest } = over;
  const paise = rest.price?.paise ?? null;
  return {
    id: `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`,
    reference: `TEST-${n}`,
    sku: null,
    slug: `test-${n}`,
    name: `Test Piece ${n}`,
    summary: null,
    description: null,
    price: { paise, approved: paise !== null, display: paise ? `₹${paise / 100}` : '₹XXXX' },
    availability: 'unconfirmed',
    purchasable: false,
    colour: null,
    material: null,
    dimensions: null,
    features: [],
    tags: [],
    stage: 'ivory-plaster',
    featuredRank: null,
    arrivedAt: null,
    publishedAt: `2026-10-0${(n % 9) + 1}T00:00:00Z`,
    images: [{ assetId: `A${n}`, role: 'primary', alt: 'x', asset: { cloudName: 'test', publicId: `p${n}`, version: 'v1', format: 'jpg', deliveryUrl: `https://res.cloudinary.com/test/image/upload/v1/p${n}.jpg`, width: null, height: null } }],
    ...rest,
    terms: termIds.map((id) => ref(id)),
  };
}
