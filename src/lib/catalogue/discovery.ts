/**
 * Product discovery: filters, facet counts, sorting, search and related
 * products. Pure functions over the published catalogue, so the same logic
 * runs on the server (PLP render) and in tests.
 *
 * Rules from the brief:
 *  - a filter or category only appears when real products carry it;
 *  - price filters/sorts only exist once real prices exist;
 *  - no "best selling" (there is no sales data to support it).
 */
import type { CatalogueProduct, Term, TermKind } from './types';

// ─────────────────────────────────────────────────────────────── Params

export type SortKey = 'featured' | 'newest' | 'price-asc' | 'price-desc';
export const SORT_LABELS: Record<SortKey, string> = {
  featured: 'Featured',
  newest: 'Newest',
  'price-asc': 'Price: low to high',
  'price-desc': 'Price: high to low',
};

export interface ShopQuery {
  q: string;
  style: string[];
  occasion: string[];
  colour: string[];
  availability: string[];
  price: string | null;
  sort: SortKey;
}

export const EMPTY_QUERY: ShopQuery = { q: '', style: [], occasion: [], colour: [], availability: [], price: null, sort: 'featured' };

type Params = Record<string, string | string[] | undefined>;

const list = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v : v ? [v] : [])
    .flatMap((x) => x.split(','))
    .map((x) => x.trim().toLowerCase())
    .filter((x) => /^[a-z0-9-]{1,60}$/.test(x));

export function parseShopQuery(params: Params): ShopQuery {
  const one = (k: string) => {
    const v = params[k];
    return (Array.isArray(v) ? v[0] : v) ?? '';
  };
  const sort = one('sort') as SortKey;
  return {
    q: one('q').slice(0, 80).trim(),
    style: list(params.style),
    occasion: list(params.occasion),
    colour: list(params.colour),
    availability: list(params.availability),
    price: /^\d{1,9}-\d{0,9}$/.test(one('price')) ? one('price') : null,
    sort: sort in SORT_LABELS ? sort : 'featured',
  };
}

export function serializeShopQuery(q: Partial<ShopQuery>) {
  const sp = new URLSearchParams();
  if (q.q) sp.set('q', q.q);
  for (const k of ['style', 'occasion', 'colour', 'availability'] as const) if (q[k]?.length) sp.set(k, q[k]!.join(','));
  if (q.price) sp.set('price', q.price);
  if (q.sort && q.sort !== 'featured') sp.set('sort', q.sort);
  const s = sp.toString();
  return s ? `?${s}` : '';
}

// ─────────────────────────────────────────────────────────────── Text

const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'for', 'to', 'of', 'in', 'on', 'with', 'my', 'me', 'i', 'im', 'need', 'want',
  'looking', 'show', 'find', 'some', 'something', 'bag', 'bags', 'maaira', 'piece', 'pieces',
]);

export function normalise(text: string) {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export const slugifyColour = (c: string) => normalise(c).replace(/\s+/g, '-');

/** Damerau–Levenshtein distance with an early exit above `max`. */
export function editDistance(a: string, b: string, max = 2): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    let rowMin = Infinity;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      rowMin = Math.min(rowMin, d[i][j]);
    }
    if (rowMin > max) return max + 1;
  }
  return d[a.length][b.length];
}

function tokenMatch(query: string, word: string): number {
  if (query === word) return 1;
  if (query.length >= 2 && word.startsWith(query)) return 0.85;
  if (query.length >= 4 && word.length >= 4) {
    const allowed = query.length >= 7 ? 2 : 1;
    if (editDistance(query, word, allowed) <= allowed) return 0.6;
    // "officebag" / "crossbodies": allow a fuzzy prefix of the word
    if (word.length > query.length && editDistance(query, word.slice(0, query.length), 1) <= 1) return 0.5;
  }
  return 0;
}

// ─────────────────────────────────────────────────────────────── Search

interface Field {
  weight: number;
  words: string[];
}

function documentFor(p: CatalogueProduct, terms: Map<string, Term>): Field[] {
  const f = (weight: number, text: string | null | undefined, extra: string[] = []): Field => ({
    weight,
    words: [text ?? '', ...extra].map(normalise).join(' ').split(' ').filter(Boolean),
  });
  const fields: Field[] = [
    f(5, p.name),
    f(5, [p.reference, p.sku].filter(Boolean).join(' ')),
    f(3, p.colour),
    f(2, p.material),
    f(3, p.tags.join(' ')),
    f(1, [p.summary, p.description].filter(Boolean).join(' ')),
  ];
  for (const ref of p.terms) {
    const t = terms.get(ref.id);
    fields.push(f(4, ref.label, t?.synonyms ?? []));
  }
  return fields;
}

export interface SearchResult {
  products: CatalogueProduct[];
  /** True when not every word matched and the closest matches are shown instead. */
  partial: boolean;
  /** Styles/occasions the query names, e.g. "office" → Office & Work. */
  matchedTerms: Term[];
}

const termWords = (t: Term) =>
  [t.label, ...t.synonyms]
    .map(normalise)
    .flatMap((w) => w.split(' '))
    .filter((w) => w && !STOPWORDS.has(w));

/**
 * Every query word (or multi-word synonym such as "date night") must match
 * something about the product: name, reference, style, occasion, verified
 * colour/material, tags or description. Typos within one or two letters are
 * tolerated. If nothing matches every word, the closest partial matches are
 * returned and flagged so the UI can say so.
 */
export function searchProducts(products: CatalogueProduct[], query: string, allTerms: Term[]): SearchResult {
  const q = normalise(query);
  if (!q) return { products, partial: false, matchedTerms: [] };
  const termMap = new Map(allTerms.map((t) => [t.id, t]));

  let rest = ` ${q} `;
  const phraseTerms: Term[] = [];
  for (const t of allTerms) {
    const phrases = [t.label, ...t.synonyms]
      .map(normalise)
      .filter((ph) => ph.includes(' '))
      .sort((a, b) => b.length - a.length);
    for (const phrase of phrases) {
      if (rest.includes(` ${phrase} `)) {
        phraseTerms.push(t);
        rest = rest.replace(` ${phrase} `, ' ');
        break;
      }
    }
  }
  const tokens = rest.split(' ').filter((w) => w && !STOPWORDS.has(w));
  const wordTerms = allTerms.filter(
    (t) => !phraseTerms.includes(t) && tokens.some((tok) => termWords(t).some((w) => tokenMatch(tok, w) >= 0.85)),
  );
  const matchedTerms = [...phraseTerms, ...wordTerms];
  const clauses = phraseTerms.length + tokens.length;
  if (!clauses) return { products, partial: false, matchedTerms };

  const scored = products.map((p) => {
    const doc = documentFor(p, termMap);
    let score = 0;
    let hits = 0;
    for (const t of phraseTerms) {
      if (p.terms.some((r) => r.id === t.id)) {
        score += 4;
        hits++;
      }
    }
    for (const tok of tokens) {
      let best = 0;
      for (const field of doc) for (const w of field.words) best = Math.max(best, field.weight * tokenMatch(tok, w));
      if (best > 0) hits++;
      score += best;
    }
    return { p, score, hits };
  });
  const byScore = (a: (typeof scored)[number], b: (typeof scored)[number]) => b.score - a.score || featuredOrder(a.p, b.p);

  const complete = scored.filter((x) => x.hits === clauses).sort(byScore);
  if (complete.length) return { products: complete.map((x) => x.p), partial: false, matchedTerms };
  const closest = clauses > 1 ? scored.filter((x) => x.hits > 0).sort(byScore) : [];
  return { products: closest.map((x) => x.p), partial: closest.length > 0, matchedTerms };
}

// ─────────────────────────────────────────────────────────────── Filters & facets

export interface PriceBand {
  value: string;
  label: string;
  min: number;
  max: number | null;
}

/** Up to three bands from real prices, rounded to readable rupee steps. */
export function priceBands(products: CatalogueProduct[]): PriceBand[] {
  const prices = products.filter((p) => p.price.approved && p.price.paise !== null).map((p) => p.price.paise!).sort((a, b) => a - b);
  if (prices.length < 3 || prices[0] === prices[prices.length - 1]) return [];
  const round = (paise: number) => {
    const rupees = paise / 100;
    const step = rupees >= 20000 ? 5000 : rupees >= 5000 ? 1000 : 500;
    return Math.max(step, Math.round(rupees / step) * step) * 100;
  };
  const a = round(prices[Math.floor(prices.length / 3)]);
  const b = round(prices[Math.floor((prices.length * 2) / 3)]);
  const fmt = (p: number) => `₹${(p / 100).toLocaleString('en-IN')}`;
  const bands: PriceBand[] =
    a < b
      ? [
          { value: `0-${a}`, label: `Under ${fmt(a)}`, min: 0, max: a },
          { value: `${a}-${b}`, label: `${fmt(a)} – ${fmt(b)}`, min: a, max: b },
          { value: `${b}-`, label: `${fmt(b)} and above`, min: b, max: null },
        ]
      : [
          { value: `0-${a}`, label: `Under ${fmt(a)}`, min: 0, max: a },
          { value: `${a}-`, label: `${fmt(a)} and above`, min: a, max: null },
        ];
  return bands.filter((band) => prices.some((p) => p >= band.min && (band.max === null || p < band.max)));
}

const AVAILABILITY_LABELS: Record<string, string> = { in_stock: 'In stock', made_to_order: 'Made to order' };

type Group = 'style' | 'occasion' | 'colour' | 'availability' | 'price';

function matches(p: CatalogueProduct, q: ShopQuery, skip?: Group): boolean {
  const has = (kind: TermKind, slugs: string[]) => !slugs.length || p.terms.some((t) => t.kind === kind && slugs.includes(t.slug));
  if (skip !== 'style' && !has('style', q.style)) return false;
  if (skip !== 'occasion' && !has('occasion', q.occasion)) return false;
  if (skip !== 'colour' && q.colour.length && !(p.colour && q.colour.includes(slugifyColour(p.colour)))) return false;
  if (skip !== 'availability' && q.availability.length && !q.availability.includes(p.availability)) return false;
  if (skip !== 'price' && q.price) {
    if (!p.price.approved || p.price.paise === null) return false;
    const [min, max] = q.price.split('-');
    if (p.price.paise < Number(min) || (max !== '' && max !== undefined && p.price.paise >= Number(max))) return false;
  }
  return true;
}

export interface FacetOption {
  value: string;
  label: string;
  count: number;
  selected: boolean;
}
export interface FacetGroup {
  key: Group;
  label: string;
  options: FacetOption[];
}

/**
 * Disjunctive facets: each group's counts ignore that group's own selection,
 * so options within a group combine with OR and groups combine with AND.
 * A group is shown only when it actually divides the current results.
 */
export function computeFacets(base: CatalogueProduct[], q: ShopQuery, terms: Term[]): FacetGroup[] {
  const groups: FacetGroup[] = [];
  const byKind = (kind: 'style' | 'occasion', label: string) => {
    const pool = base.filter((p) => matches(p, q, kind));
    const options = terms
      .filter((t) => t.kind === kind)
      .map((t) => ({
        value: t.slug,
        label: t.label,
        count: pool.filter((p) => p.terms.some((r) => r.id === t.id)).length,
        selected: q[kind].includes(t.slug),
      }));
    groups.push({ key: kind, label, options });
  };
  byKind('style', 'Style');
  byKind('occasion', 'Occasion');

  const colourPool = base.filter((p) => matches(p, q, 'colour'));
  const colours = new Map<string, string>();
  base.forEach((p) => p.colour && colours.set(slugifyColour(p.colour), p.colour));
  groups.push({
    key: 'colour',
    label: 'Colour',
    options: [...colours].map(([value, label]) => ({
      value,
      label,
      count: colourPool.filter((p) => p.colour && slugifyColour(p.colour) === value).length,
      selected: q.colour.includes(value),
    })),
  });

  const availPool = base.filter((p) => matches(p, q, 'availability'));
  groups.push({
    key: 'availability',
    label: 'Availability',
    options: Object.entries(AVAILABILITY_LABELS).map(([value, label]) => ({
      value,
      label,
      count: availPool.filter((p) => p.availability === value).length,
      selected: q.availability.includes(value),
    })),
  });

  const pricePool = base.filter((p) => matches(p, q, 'price'));
  groups.push({
    key: 'price',
    label: 'Price',
    options: priceBands(base).map((b) => ({
      value: b.value,
      label: b.label,
      count: pricePool.filter((p) => p.price.approved && p.price.paise !== null && p.price.paise >= b.min && (b.max === null || p.price.paise < b.max)).length,
      selected: q.price === b.value,
    })),
  });

  return groups
    .map((g) => ({ ...g, options: g.options.filter((o) => o.count > 0 || o.selected) }))
    .filter((g) => {
      if (g.options.some((o) => o.selected)) return true;
      const pool = base.filter((p) => matches(p, q, g.key));
      // Useful only if choosing an option would narrow the results.
      return g.options.length > 0 && (g.options.length > 1 || g.options[0].count < pool.length);
    });
}

export function applyFilters(products: CatalogueProduct[], q: ShopQuery) {
  return products.filter((p) => matches(p, q));
}

// ─────────────────────────────────────────────────────────────── Sorting

export function featuredOrder(a: CatalogueProduct, b: CatalogueProduct) {
  const ra = a.featuredRank ?? Number.MAX_SAFE_INTEGER;
  const rb = b.featuredRank ?? Number.MAX_SAFE_INTEGER;
  return ra - rb || (b.publishedAt ?? '').localeCompare(a.publishedAt ?? '') || a.name.localeCompare(b.name);
}

const newestKey = (p: CatalogueProduct) => p.arrivedAt ?? p.publishedAt ?? '';

export function availableSorts(products: CatalogueProduct[]): SortKey[] {
  const sorts: SortKey[] = ['featured'];
  if (new Set(products.map(newestKey).filter(Boolean)).size > 1) sorts.push('newest');
  if (products.filter((p) => p.price.approved && p.price.paise !== null).length > 1) sorts.push('price-asc', 'price-desc');
  return sorts;
}

export function sortProducts(products: CatalogueProduct[], sort: SortKey) {
  const list = [...products];
  const price = (p: CatalogueProduct) => (p.price.approved && p.price.paise !== null ? p.price.paise : null);
  switch (sort) {
    case 'newest':
      return list.sort((a, b) => newestKey(b).localeCompare(newestKey(a)) || featuredOrder(a, b));
    case 'price-asc':
    case 'price-desc': {
      const dir = sort === 'price-asc' ? 1 : -1;
      return list.sort((a, b) => {
        const pa = price(a);
        const pb = price(b);
        if (pa === null && pb === null) return featuredOrder(a, b);
        if (pa === null) return 1; // unpriced always last
        if (pb === null) return -1;
        return (pa - pb) * dir || featuredOrder(a, b);
      });
    }
    default:
      return list.sort(featuredOrder);
  }
}

// ─────────────────────────────────────────────────────────────── Related & categories

/** Products related by shared style/occasion/colour/tags. Never padded with unrelated pieces. */
export function relatedProducts(product: CatalogueProduct, all: CatalogueProduct[], limit = 4) {
  const ids = new Set(product.terms.map((t) => t.id));
  return all
    .filter((p) => p.id !== product.id)
    .map((p) => {
      let score = 0;
      for (const t of p.terms) if (ids.has(t.id)) score += t.kind === 'style' ? 3 : t.kind === 'occasion' ? 2 : 1;
      if (product.colour && p.colour && slugifyColour(product.colour) === slugifyColour(p.colour)) score += 1;
      score += p.tags.filter((t) => product.tags.includes(t)).length * 0.5;
      return { p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || featuredOrder(a.p, b.p))
    .slice(0, limit)
    .map((x) => x.p);
}

export interface CategorySummary {
  term: Term;
  count: number;
  cover: CatalogueProduct;
}

/** Populated categories of one kind, in vocabulary order, each with a real product image for its tile. */
export function populatedCategories(products: CatalogueProduct[], terms: Term[], kind: TermKind): CategorySummary[] {
  return terms
    .filter((t) => t.kind === kind)
    .sort((a, b) => a.position - b.position)
    .flatMap((term) => {
      const members = products.filter((p) => p.terms.some((r) => r.id === term.id)).sort(featuredOrder);
      return members.length && members[0].images.length ? [{ term, count: members.length, cover: members[0] }] : [];
    });
}

export const newArrivals = (products: CatalogueProduct[]) =>
  products.filter((p) => p.arrivedAt).sort((a, b) => (b.arrivedAt ?? '').localeCompare(a.arrivedAt ?? ''));
