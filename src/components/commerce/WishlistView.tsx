'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ProductCard } from '../product/ProductCard';
import { useWishlist } from './WishlistProvider';
import type { CatalogueProduct } from '@/lib/catalogue/types';
import styles from '../shop/Listing.module.css';

export function WishlistView() {
  const { ids, signedIn } = useWishlist();
  const [products, setProducts] = useState<CatalogueProduct[] | null>(null);
  const key = ids.join(',');

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    fetch(`/api/products/lookup?ids=${key}`)
      .then((r) => (r.ok ? r.json() : { products: [] }))
      .then((d: { products?: CatalogueProduct[] }) => !cancelled && setProducts(d.products ?? []))
      .catch(() => !cancelled && setProducts([]));
    return () => {
      cancelled = true;
    };
  }, [key]);

  const shown = key ? (products ?? []).filter((p) => ids.includes(p.id)) : [];
  if (!key || (products && !shown.length)) {
    return (
      <div className={`container ${styles.empty}`}>
        <p className={`${styles.emptyTitle} display`}>Save the pieces you love.</p>
        <Link href="/shop" className="btn btn--primary">
          Explore bags
        </Link>
        {!signedIn && (
          <p>
            <Link href="/account/sign-in?next=/wishlist" className="text-link">
              Sign in
            </Link>{' '}
            to keep your wishlist across devices.
          </p>
        )}
      </div>
    );
  }
  return (
    <div className={`container ${styles.wrap}`}>
      {!signedIn && (
        <p className={styles.count}>
          Saved on this device. <Link href="/account/sign-in?next=/wishlist" className="text-link">Sign in</Link> to keep it in your account.
        </p>
      )}
      <ul className={styles.grid} data-cols={shown.length <= 3 ? 3 : 4} aria-busy={!products || undefined} style={{ marginTop: 24 }}>
        {shown.map((p) => (
          <li key={p.id}>
            <ProductCard product={p} headingLevel="h2" />
          </li>
        ))}
      </ul>
    </div>
  );
}
