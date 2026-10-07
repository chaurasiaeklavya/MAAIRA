'use client';

import { useEffect, useRef, useState } from 'react';
import { useCart } from '../commerce/CartProvider';
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
  name,
  price,
  purchasable,
  blocker,
  maxQuantity,
}: {
  productId: string;
  name: string;
  price: string;
  purchasable: boolean;
  blocker: PurchaseBlocker | null;
  maxQuantity: number;
}) {
  const { add, pending, error } = useCart();
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

  const enquire = () => document.getElementById('enquire')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const primary = purchasable ? (
    <button type="button" className="btn btn--primary btn--block" onClick={() => add(productId, qty)} disabled={busy} aria-describedby={error ? 'purchase-error' : undefined}>
      {busy ? 'Adding…' : 'Add to cart'}
    </button>
  ) : (
    <button type="button" className="btn btn--primary btn--block" onClick={enquire}>
      Enquire about this piece
    </button>
  );

  return (
    <>
      <div ref={mainRef} className={styles.purchase}>
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
        <div className={styles.secondaryActions}>
          <WishlistButton productId={productId} name={name} withLabel />
          <a href={brand.contact.phoneHref} className={styles.call}>
            Call {brand.contact.phoneDisplay}
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
