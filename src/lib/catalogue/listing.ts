/**
 * One listing pipeline for the shop, category pages and search:
 * search → filters → facets → sort. Pure, so it's unit-testable.
 */
import {
  applyFilters,
  availableSorts,
  computeFacets,
  searchProducts,
  sortProducts,
  type FacetGroup,
  type ShopQuery,
  type SortKey,
} from './discovery';
import type { CatalogueProduct, Term, TermKind } from './types';

export interface Listing {
  items: CatalogueProduct[];
  total: number;
  facets: FacetGroup[];
  sorts: SortKey[];
  sort: SortKey;
  partial: boolean;
  matchedTerms: Term[];
}

export function buildListing(products: CatalogueProduct[], terms: Term[], query: ShopQuery, lock?: { kind: TermKind; slug: string }): Listing {
  const q: ShopQuery = { ...query };
  if (lock?.kind === 'style') q.style = [lock.slug];
  if (lock?.kind === 'occasion') q.occasion = [lock.slug];

  const searched = searchProducts(products, q.q, terms);
  const filtered = applyFilters(searched.products, q);
  const sorts = availableSorts(searched.products);
  const sort = sorts.includes(q.sort) ? q.sort : 'featured';
  // With a search query, relevance order is kept for "featured".
  const items = q.q && sort === 'featured' ? filtered : sortProducts(filtered, sort);
  const facets = computeFacets(searched.products, q, terms).filter((g) => !(lock && g.key === lock.kind));
  return { items, total: items.length, facets, sorts, sort, partial: searched.partial, matchedTerms: searched.matchedTerms };
}
