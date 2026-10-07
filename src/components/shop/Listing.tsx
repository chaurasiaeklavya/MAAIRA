import Form from 'next/form';
import Link from 'next/link';
import { ProductCard } from '../product/ProductCard';
import { FilterSheet } from './FilterSheet';
import { SortSelect } from './SortSelect';
import { SORT_LABELS, serializeShopQuery, type ShopQuery } from '@/lib/catalogue/discovery';
import type { Listing as ListingData } from '@/lib/catalogue/listing';
import styles from './Listing.module.css';

/**
 * Product listing with filters and sort. Works without JavaScript (GET
 * forms and links); with it, navigation is client-side via next/form.
 */
export function Listing({
  data,
  query,
  basePath,
  emptyTitle = 'No bags matched your selection.',
  hidden = {},
}: {
  data: ListingData;
  query: ShopQuery;
  basePath: string;
  emptyTitle?: string;
  /** Params that must survive form submits (e.g. the search query). */
  hidden?: Record<string, string>;
}) {
  const active = data.facets.flatMap((g) => g.options.filter((o) => o.selected).map((o) => ({ group: g.key, value: o.value, label: o.label })));
  const without = (group: string, value: string) => {
    const next = { ...query } as ShopQuery;
    if (group === 'price') next.price = null;
    else (next as unknown as Record<string, string[]>)[group] = (query as unknown as Record<string, string[]>)[group].filter((v) => v !== value);
    return `${basePath}${serializeShopQuery(next)}`;
  };
  const cols = data.items.length <= 3 ? 3 : 4;

  return (
    <div className={`container ${styles.wrap}`}>
      <div className={styles.toolbar}>
        <p className={styles.count} aria-live="polite">
          {data.total === 1 ? '1 bag' : `${data.total} bags`}
          {data.partial && <span className={styles.partial}> · closest matches</span>}
        </p>
        <div className={styles.controls}>
          {data.facets.length > 0 && <FilterSheet facets={data.facets} query={query} basePath={basePath} hidden={hidden} activeCount={active.length} />}
          {data.sorts.length > 1 && (
            <Form action={basePath} className={styles.sortForm}>
              {Object.entries(hidden).map(([k, v]) => (
                <input key={k} type="hidden" name={k} value={v} />
              ))}
              {(['style', 'occasion', 'colour', 'availability'] as const).flatMap((k) => query[k].map((v) => <input key={k + v} type="hidden" name={k} value={v} />))}
              {query.price && <input type="hidden" name="price" value={query.price} />}
              <SortSelect sorts={data.sorts.map((s) => ({ value: s, label: SORT_LABELS[s] }))} value={data.sort} />
            </Form>
          )}
        </div>
      </div>

      {active.length > 0 && (
        <ul className={styles.chips} aria-label="Active filters">
          {active.map((a) => (
            <li key={a.group + a.value}>
              <Link href={without(a.group, a.value)} className={styles.chip} scroll={false}>
                {a.label}
                <span aria-hidden="true"> ×</span>
                <span className="visually-hidden"> — remove filter</span>
              </Link>
            </li>
          ))}
          <li>
            <Link href={`${basePath}${serializeShopQuery({ q: query.q, sort: query.sort })}`} className={styles.clear} scroll={false}>
              Clear all
            </Link>
          </li>
        </ul>
      )}

      {data.items.length ? (
        <ul className={styles.grid} data-cols={cols}>
          {data.items.map((p, i) => (
            <li key={p.id}>
              <ProductCard product={p} priority={i < 2} headingLevel="h2" />
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.empty}>
          <p className={`${styles.emptyTitle} display`}>{emptyTitle}</p>
          <Link href="/shop" className="btn btn--primary">
            Browse all bags
          </Link>
        </div>
      )}
    </div>
  );
}
