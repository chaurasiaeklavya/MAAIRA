'use client';

import { useEffect, useState } from 'react';
import { readViewed } from '../commerce/WishlistProvider';
import { RevealText } from '../motion/RevealText';
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
    <section className={styles.more} aria-labelledby="recent-title">
      <div className="container">
        <header className={styles.sectionHead}>
          <p className="eyebrow">On this device</p>
          <RevealText as="h2" id="recent-title" className={`${styles.sectionTitle} display`}>
            {'Recently *viewed*'}
          </RevealText>
        </header>
        <div className={styles.moreGrid}>
          {items.map((p, i) => (
            // No shared-element name: the same piece may also appear above.
            <ProductCard key={p.id} product={p} index={i} size="compact" sharedTransition={false} />
          ))}
        </div>
      </div>
    </section>
  );
}
