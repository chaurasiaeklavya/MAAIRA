'use client';

import Form from 'next/form';
import { useRef } from 'react';
import type { FacetGroup, ShopQuery } from '@/lib/catalogue/discovery';
import styles from './Listing.module.css';

/** Filters in a side sheet (native dialog). Groups combine with AND, options within a group with OR. */
export function FilterSheet({
  facets,
  query,
  basePath,
  hidden,
  activeCount,
}: {
  facets: FacetGroup[];
  query: ShopQuery;
  basePath: string;
  hidden: Record<string, string>;
  activeCount: number;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button type="button" className={styles.filterButton} onClick={() => ref.current?.showModal()} aria-haspopup="dialog">
        Filter{activeCount > 0 && <span className={styles.badge}>{activeCount}</span>}
        {activeCount > 0 && <span className="visually-hidden"> ({activeCount} active)</span>}
      </button>
      <dialog ref={ref} className={styles.sheet} aria-labelledby="filter-title" onClick={(e) => e.target === ref.current && ref.current?.close()}>
        <Form action={basePath} className={styles.sheetForm} onSubmit={() => ref.current?.close()}>
          <header className={styles.sheetHead}>
            <h2 id="filter-title" className={styles.sheetTitle}>
              Filter
            </h2>
            <button type="button" className={styles.sheetClose} onClick={() => ref.current?.close()}>
              Close<span className="visually-hidden"> filters</span>
            </button>
          </header>
          <div className={styles.sheetBody}>
            {Object.entries(hidden).map(([k, v]) => (
              <input key={k} type="hidden" name={k} value={v} />
            ))}
            {query.sort !== 'featured' && <input type="hidden" name="sort" value={query.sort} />}
            {facets.map((g) => (
              <fieldset key={g.key} className={styles.group}>
                <legend>{g.label}</legend>
                {g.options.map((o) => (
                  <label key={o.value} className={styles.option}>
                    <input type={g.key === 'price' ? 'radio' : 'checkbox'} name={g.key} value={o.value} defaultChecked={o.selected} />
                    <span>{o.label}</span>
                    <span className={styles.optionCount} aria-label={`${o.count} ${o.count === 1 ? 'bag' : 'bags'}`}>
                      {o.count}
                    </span>
                  </label>
                ))}
              </fieldset>
            ))}
          </div>
          <footer className={styles.sheetFoot}>
            <a href={`${basePath}${hidden.q ? `?q=${encodeURIComponent(hidden.q)}` : ''}`} className="btn btn--secondary">
              Clear
            </a>
            <button type="submit" className="btn btn--primary">
              Show results
            </button>
          </footer>
        </Form>
      </dialog>
    </>
  );
}
