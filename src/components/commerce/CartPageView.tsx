'use client';

import Link from 'next/link';
import { CartLines } from './CartLines';
import { useCart } from './CartProvider';
import styles from './CartPageView.module.css';

/** Full cart page: lines, summary, and a checkout that only opens when it genuinely can. */
export function CartPageView({ checkoutOpen }: { checkoutOpen: boolean }) {
  const { cart, error } = useCart();
  if (!cart.lines.length) {
    return (
      <div className={`container ${styles.empty}`}>
        <p className={`${styles.emptyTitle} display`}>Your cart is waiting.</p>
        <Link href="/shop" className="btn btn--primary">
          Continue shopping
        </Link>
      </div>
    );
  }
  const orderEnquiry = `I’d like to order:\n${cart.lines.map((l) => `• ${l.name} (${l.reference}) × ${l.quantity}`).join('\n')}`;
  return (
    <div className={`container ${styles.layout}`}>
      <section aria-label="Items in your cart">
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <CartLines />
        <Link href="/shop" className={`text-link ${styles.continue}`}>
          Continue shopping
        </Link>
      </section>
      <aside className={styles.summary} aria-labelledby="summary-title">
        <h2 id="summary-title" className={styles.summaryTitle}>
          Order summary
        </h2>
        <p className={styles.row}>
          <span>Subtotal</span>
          <span>{cart.subtotal}</span>
        </p>
        <p className={styles.small}>Delivery is calculated at checkout.</p>
        {checkoutOpen ? (
          <Link href="/checkout" className={`btn btn--primary btn--block ${cart.checkoutable ? '' : styles.disabled}`} aria-disabled={!cart.checkoutable || undefined}>
            Checkout
          </Link>
        ) : (
          <div className={styles.closed}>
            <p>
              <strong>Online checkout isn’t open yet.</strong> Send these pieces to the house as an order request and they’ll confirm price,
              availability and delivery with you.
            </p>
            <Link href={`/contact?order=1&message=${encodeURIComponent(orderEnquiry)}`} className="btn btn--primary btn--block">
              Request this order
            </Link>
          </div>
        )}
        {!cart.checkoutable && checkoutOpen && <p className={styles.small}>Please resolve the highlighted items to continue.</p>}
      </aside>
    </div>
  );
}
