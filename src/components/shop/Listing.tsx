import Form from 'next/form';
import Link from 'next/link';
import { FilterSheet } from './FilterSheet';
import { ShopGrid } from './ShopGrid';
import { SortSelect } from './SortSelect';
import { brand } from '@/data/brand';
import { SORT_LABELS, serializeShopQuery, type ShopQuery } from '@/lib/catalogue/discovery';
import type { Listing as ListingData } from '@/lib/catalogue/listing';
import styles from './Listing.module.css';
import view from './ShopView.module.css';

/**
 * Product listing with filters and sort. Works without JavaScript (GET
 * forms and links); with it, navigation is client-side via next/form.
 */
export function Listing({
  data,
  query,
  basePath,
  emptyTitle = 'No pieces matched your selection.',
  hidden = {},
  forthcoming = false,
}: {
  data: ListingData;
  query: ShopQuery;
  basePath: string;
  emptyTitle?: string;
  /** Params that must survive form submits (e.g. the search query). */
  hidden?: Record<string, string>;
  /** Show the "full collection" panel (the unfiltered shop). */
  forthcoming?: boolean;
}) {
  const active = data.facets.flatMap((g) => g.options.filter((o) => o.selected).map((o) => ({ group: g.key, value: o.value, label: o.label })));
  const without = (group: string, value: string) => {
    const next = { ...query } as ShopQuery;
    if (group === 'price') next.price = null;
    else (next as unknown as Record<string, string[]>)[group] = (query as unknown as Record<string, string[]>)[group].filter((v) => v !== value);
    return `${basePath}${serializeShopQuery(next)}`;
  };
  const controls = (
    <>
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
    </>
  );

  const chips =
    active.length > 0 ? (
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
    ) : null;

  const countLabel = (
    <>
      {data.total === 1 ? '1 piece' : `${data.total} pieces`}
      {data.partial && <span className={view.partial}> · closest matches</span>}
    </>
  );

  return (
    <div className={styles.wrap}>
      {data.items.length ? (
        <ShopGrid items={data.items} countLabel={countLabel} controls={controls} chips={chips} />
      ) : (
        <div className={`container ${view.empty}`}>
          <p className={`${view.emptyTitle} display`}>{emptyTitle}</p>
          <Link href="/shop" className={view.emptyLink} transitionTypes={['nav-back']}>
            <span>Browse all pieces</span>
            <svg viewBox="0 0 32 12" width="28" height="12" aria-hidden="true">
              <path d="M0 6h30m0 0-5-5m5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
          </Link>
        </div>
      )}

      {forthcoming && (
        <section className={`container ${view.forthcoming}`} aria-labelledby="forthcoming-title">
          <div className={`${view.forthcomingPanel} leather stitched`}>
            <span className={`logo-mask logo-mask--monogram ${view.deboss}`} aria-hidden="true" />
            <div>
              <p className="eyebrow">The collection</p>
              <h2 id="forthcoming-title" className={`${view.forthcomingTitle} display`}>
                The full collection will be presented <em>here.</em>
              </h2>
              <p className={view.forthcomingText}>
                The house is photographing and cataloguing every piece. For anything you don’t yet see, the house is happy to help.
              </p>
              <div className={view.forthcomingActions}>
                <Link href="/contact" className={view.forthcomingLink} transitionTypes={['nav-forward']}>
                  Ask the house
                </Link>
                <a href={brand.contact.instagramUrl} target="_blank" rel="noopener noreferrer" className={view.forthcomingLink}>
                  Follow on Instagram<span className="visually-hidden"> (opens in a new tab)</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
