'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { CartLines } from './CartLines';
import { useCart } from './CartProvider';
import styles from './CartDrawer.module.css';

/**
 * Slide-in cart (native <dialog>: focus is trapped, Escape closes, the page
 * behind is inert, focus returns to the button that opened it).
 */
export function CartDrawer() {
  const { cart, isOpen, close, error, announcement } = useCart();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (isOpen && !d.open) d.showModal();
    if (!isOpen && d.open) d.close();
  }, [isOpen]);

  return (
    <dialog
      ref={ref}
      className={styles.drawer}
      aria-labelledby="cart-drawer-title"
      onClose={close}
      onClick={(e) => {
        if (e.target === ref.current) close();
      }}
    >
      <div className={styles.panel}>
        <header className={styles.head}>
          <h2 id="cart-drawer-title" className={styles.title}>
            Your cart {cart.lines.length > 0 && <span className={styles.count}>({cart.lines.reduce((n, l) => n + l.quantity, 0)})</span>}
          </h2>
          <button type="button" className={styles.close} onClick={close} autoFocus>
            Close<span className="visually-hidden"> cart</span>
          </button>
        </header>

        {announcement === 'Added to cart' && <p className={styles.added}>✓ Added to cart</p>}
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        {cart.lines.length === 0 ? (
          <div className={styles.empty}>
            <p className={`${styles.emptyTitle} display`}>Your cart is waiting.</p>
            <Link href="/shop" className="btn btn--primary" onClick={close}>
              Continue shopping
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.body}>
              <CartLines compact onNavigate={close} />
            </div>
            <footer className={styles.foot}>
              <p className={styles.subtotal}>
                <span>Subtotal</span>
                <span>{cart.subtotal}</span>
              </p>
              <p className={styles.small}>Delivery is calculated at checkout. Prices include taxes where confirmed.</p>
              <Link href="/checkout" className={`btn btn--primary btn--block ${cart.checkoutable ? '' : styles.disabledLink}`} aria-disabled={!cart.checkoutable || undefined} onClick={(e) => (cart.checkoutable ? close() : e.preventDefault())}>
                Checkout
              </Link>
              <Link href="/cart" className="btn btn--secondary btn--block" onClick={close}>
                View cart
              </Link>
            </footer>
          </>
        )}
      </div>
    </dialog>
  );
}
