'use client';

import { useEffect, useState } from 'react';
import { readViewed } from '../commerce/WishlistProvider';
import { ProductCard } from './ProductCard';
import type { CatalogueProduct } from '@/lib/catalogue/types';
import styles from './ProductPage.module.css';

/** Pieces this visitor opened recently (stored only on this device). */
export function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const [items, setItems] = useState<CatalogueProduct[]>([]);
  useEffect(() => {
    const ids = readViewed().filter((id) => id !== excludeId).slice(0, 4);
    if (!ids.length) return;
    let cancelled = false;
    fetch(`/api/products/lookup?ids=${ids.join(',')}`)
      .then((r) => (r.ok ? r.json() : { products: [] }))
      .then((d: { products?: CatalogueProduct[] }) => !cancelled && setItems(d.products ?? []))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [excludeId]);
  if (!items.length) return null;
  return (
    <section className={`container ${styles.more}`} aria-labelledby="recent-title">
      <h2 id="recent-title" className={`${styles.sectionTitle} display`}>
        Recently viewed
      </h2>
      <ul className={styles.moreGrid}>
        {items.map((p) => (
          <li key={p.id}>
            <ProductCard product={p} />
          </li>
        ))}
      </ul>
    </section>
  );
}
