'use client';

import Link from 'next/link';
import { useCart } from './CartProvider';
import styles from './Checkout.module.css';

/** Honest state while online payment isn't configured or approved — with a working alternative. */
export function CheckoutClosed() {
  const { cart } = useCart();
  const message = cart.lines.length ? `I’d like to order:\n${cart.lines.map((l) => `• ${l.name} (${l.reference}) × ${l.quantity}`).join('\n')}` : '';
  return (
    <div className={`container ${styles.closed}`}>
      <h2 className={`${styles.closedTitle} display`}>Online checkout isn’t open yet.</h2>
      <p>
        The house is finalising prices, delivery and payment. Nothing has been charged. You can send your selection as an order request, and the
        house will confirm price, availability and delivery with you directly.
      </p>
      <div className={styles.closedActions}>
        {cart.lines.length > 0 && (
          <Link href={`/contact?order=1&message=${encodeURIComponent(message)}`} className="btn btn--primary">
            Request this order
          </Link>
        )}
        <Link href="/contact?mode=callback" className="btn btn--secondary">
          Request a call back
        </Link>
        <Link href="/shop" className="text-link">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
