import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  applyFilters,
  availableSorts,
  computeFacets,
  editDistance,
  EMPTY_QUERY,
  parseShopQuery,
  populatedCategories,
  priceBands,
  relatedProducts,
  searchProducts,
  serializeShopQuery,
  sortProducts,
} from '../src/lib/catalogue/discovery';
import { fixture, TERMS } from './fixtures/catalogue';

const tote = fixture({ name: 'Arc Tote', colour: 'Black', termIds: ['style:totes', 'occasion:office-and-work', 'occasion:everyday'], price: { paise: 1500000, approved: true, display: '' }, featuredRank: 2 });
const cross = fixture({ name: 'Loop Crossbody', colour: 'Tan', termIds: ['style:crossbody', 'occasion:everyday'], price: { paise: 900000, approved: true, display: '' }, featuredRank: 1 });
const clutch = fixture({ name: 'Nuit Clutch', colour: 'Black', termIds: ['style:clutches', 'occasion:party-and-evening'], price: { paise: 2500000, approved: true, display: '' } });
const unpriced = fixture({ name: 'Draft Piece', termIds: [] });
const all = [tote, cross, clutch, unpriced];

test('parseShopQuery ignores unknown sorts and malformed values', () => {
  const q = parseShopQuery({ style: 'totes,CROSSBODY,<script>', sort: 'best-selling', price: 'abc', q: '  office  ' });
  assert.deepEqual(q.style, ['totes', 'crossbody']);
  assert.equal(q.sort, 'featured');
  assert.equal(q.price, null);
  assert.equal(q.q, 'office');
  assert.equal(serializeShopQuery({ style: ['totes'], sort: 'featured' }), '?style=totes');
});

test('filters combine: OR within a group, AND across groups', () => {
  const both = applyFilters(all, { ...EMPTY_QUERY, style: ['totes', 'crossbody'] });
  assert.deepEqual(both.map((p) => p.name).sort(), ['Arc Tote', 'Loop Crossbody']);
  const black = applyFilters(all, { ...EMPTY_QUERY, style: ['totes', 'crossbody'], colour: ['black'] });
  assert.deepEqual(black.map((p) => p.name), ['Arc Tote']);
  const none = applyFilters(all, { ...EMPTY_QUERY, style: ['clutches'], occasion: ['office-and-work'] });
  assert.equal(none.length, 0);
});

test('facets only expose populated options and are disjunctive', () => {
  const facets = computeFacets(all, { ...EMPTY_QUERY, style: ['totes'] }, TERMS);
  const style = facets.find((f) => f.key === 'style')!;
  assert.deepEqual(style.options.map((o) => o.value).sort(), ['clutches', 'crossbody', 'totes']);
  assert.ok(!style.options.some((o) => o.value === 'backpacks'), 'empty categories are hidden');
  assert.equal(style.options.find((o) => o.value === 'totes')!.selected, true);
  const occ = facets.find((f) => f.key === 'occasion')!;
  // With "Totes" selected, occasion counts reflect totes only.
  assert.deepEqual(Object.fromEntries(occ.options.map((o) => [o.value, o.count])), { everyday: 1, 'office-and-work': 1 });
});

test('facet groups that cannot narrow results are hidden; no price filter without prices', () => {
  const onlyDrafts = [fixture({}), fixture({})];
  assert.deepEqual(computeFacets(onlyDrafts, EMPTY_QUERY, TERMS), []);
  assert.deepEqual(priceBands(onlyDrafts), []);
  assert.deepEqual(availableSorts(onlyDrafts).filter((s) => s.startsWith('price')), []);
});

test('price bands come from real prices and filter correctly', () => {
  const bands = priceBands(all);
  assert.ok(bands.length >= 2);
  const cheapest = applyFilters(all, { ...EMPTY_QUERY, price: bands[0].value });
  assert.ok(cheapest.every((p) => p.price.paise! < bands[0].max!));
  assert.ok(!cheapest.includes(unpriced));
});

test('sorting: featured rank first; unpriced always last in price sorts', () => {
  assert.equal(sortProducts(all, 'featured')[0], cross);
  const asc = sortProducts(all, 'price-asc');
  assert.deepEqual(asc.map((p) => p.name), ['Loop Crossbody', 'Arc Tote', 'Nuit Clutch', 'Draft Piece']);
  const desc = sortProducts(all, 'price-desc');
  assert.equal(desc[0], clutch);
  assert.equal(desc[desc.length - 1], unpriced);
});

test('search understands needs, styles, colours and typos', () => {
  const s = (q: string) => searchProducts(all, q, TERMS).products.map((p) => p.name);
  assert.deepEqual(s('office bag'), ['Arc Tote']);
  assert.deepEqual(s('party'), ['Nuit Clutch']);
  assert.deepEqual(s('crossbody'), ['Loop Crossbody']);
  assert.deepEqual(s('cross body'), ['Loop Crossbody']);
  assert.deepEqual(s('crosbody'), ['Loop Crossbody'], 'one-letter typo');
  assert.deepEqual(s('black bag').sort(), ['Arc Tote', 'Nuit Clutch']);
  assert.deepEqual(s('date night'), ['Nuit Clutch']);
  assert.equal(searchProducts(all, 'bag', TERMS).products.length, all.length, '"bag" alone means all bags');
  const miss = searchProducts(all, 'backpack', TERMS);
  assert.equal(miss.products.length, 0);
  assert.ok(miss.matchedTerms.some((t) => t.slug === 'backpacks'));
  const partial = searchProducts(all, 'black travel', TERMS);
  assert.equal(partial.partial, true);
  assert.ok(partial.products.length > 0);
});

test('related products share real attributes and are never padded', () => {
  assert.deepEqual(relatedProducts(tote, all).map((p) => p.name), ['Loop Crossbody', 'Nuit Clutch']);
  assert.deepEqual(relatedProducts(unpriced, all), []);
});

test('categories only appear when populated', () => {
  const styles = populatedCategories(all, TERMS, 'style').map((c) => c.term.slug);
  assert.deepEqual(styles, ['totes', 'crossbody', 'clutches']);
  assert.deepEqual(populatedCategories([unpriced], TERMS, 'occasion'), []);
});

test('editDistance handles transpositions', () => {
  assert.equal(editDistance('tote', 'toet'), 1);
  assert.equal(editDistance('clutch', 'cltuch'), 1);
  assert.ok(editDistance('tote', 'clutch') > 2);
});
