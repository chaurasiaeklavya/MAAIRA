'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useCart } from '../commerce/CartProvider';
import { useExperience } from '../ExperienceProvider';
import { WishlistButton } from '../commerce/WishlistButton';
import { BLOCKER_COPY, type PurchaseBlocker } from '@/lib/commerce/purchasable';
import { brand } from '@/data/brand';
import styles from './ProductPage.module.css';

/**
 * The purchase decision: add to cart when the piece can genuinely be bought
 * online; otherwise a clear reason and a working alternative (enquire / call).
 * On phones a slim bar keeps the main action within thumb reach.
 */
export function PurchasePanel({
  productId,
  slug,
  name,
  price,
  purchasable,
  blocker,
  maxQuantity,
}: {
  productId: string;
  slug: string;
  name: string;
  price: string;
  purchasable: boolean;
  blocker: PurchaseBlocker | null;
  maxQuantity: number;
}) {
  const { add, pending, error } = useCart();
  const { scrollTo } = useExperience();
  const [qty, setQty] = useState(1);
  const mainRef = useRef<HTMLDivElement>(null);
  const [showBar, setShowBar] = useState(false);
  const busy = pending === productId;

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShowBar(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const enquire = () => {
    scrollTo('#enquire');
    window.setTimeout(() => document.querySelector<HTMLElement>('#enquire input[name="name"]')?.focus({ preventScroll: true }), 900);
  };

  const primary = purchasable ? (
    <button type="button" className={styles.primary} onClick={() => add(productId, qty)} disabled={busy} aria-describedby={error ? 'purchase-error' : undefined}>
      {busy ? 'Adding…' : 'Add to cart'}
    </button>
  ) : (
    <button type="button" className={styles.primary} onClick={enquire}>
      Enquire about this piece
    </button>
  );

  return (
    <>
      <div ref={mainRef} className={styles.actions}>
        {purchasable && maxQuantity > 1 && (
          <label className={styles.qtyField}>
            <span>Quantity</span>
            <select value={qty} onChange={(e) => setQty(Number(e.target.value))}>
              {Array.from({ length: maxQuantity }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        )}
        {!purchasable && blocker && <p className={styles.blocker}>{BLOCKER_COPY[blocker]}</p>}
        {primary}
        {error && (
          <p id="purchase-error" className={styles.purchaseError} role="alert">
            {error}
          </p>
        )}
        {purchasable ? (
          <button type="button" className={styles.secondary} onClick={enquire}>
            Enquire about this piece
          </button>
        ) : (
          <Link href={`/contact?mode=callback&piece=${slug}`} className={styles.secondary} transitionTypes={['nav-forward']}>
            Request a callback
          </Link>
        )}
        <div className={styles.secondaryActions}>
          <WishlistButton productId={productId} name={name} withLabel />
          <a href={brand.contact.phoneHref} className={styles.tertiary}>
            or call {brand.contact.phoneDisplay}
          </a>
        </div>
      </div>

      <div className={styles.stickyBar} data-show={showBar || undefined} aria-hidden={!showBar}>
        <div className={styles.stickyInfo}>
          <span className={styles.stickyName}>{name}</span>
          <span>{price}</span>
        </div>
        <div className={styles.stickyAction}>{showBar ? primary : null}</div>
      </div>
    </>
  );
}
