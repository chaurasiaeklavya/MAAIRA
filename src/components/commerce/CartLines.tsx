'use client';

import Link from 'next/link';
import { CloudImage } from '../CloudImage';
import { useCart } from './CartProvider';
import styles from './CartLines.module.css';

/** Cart line items with quantity controls — shared by the drawer and the cart page. */
export function CartLines({ compact = false, readOnly = false, onNavigate }: { compact?: boolean; readOnly?: boolean; onNavigate?: () => void }) {
  const { cart, update, remove, pending } = useCart();
  return (
    <ul className={`${styles.lines} ${compact ? styles.compact : ''}`}>
      {cart.lines.map((line) => {
        const busy = pending === line.productId;
        return (
          <li key={line.productId} className={styles.line} data-issue={line.issue ? '' : undefined} aria-busy={busy || undefined}>
            <Link href={`/products/${line.slug}`} className={styles.thumb} onClick={onNavigate} tabIndex={-1} aria-hidden="true">
              {line.image ? <CloudImage asset={line.image} alt="" sizes="96px" width={320} maxWidth={480} variant="natural" /> : null}
            </Link>
            <div className={styles.info}>
              <Link href={`/products/${line.slug}`} className={styles.name} onClick={onNavigate}>
                {line.name}
              </Link>
              <p className={styles.unit}>{line.unitPrice}</p>
              {line.issue && <p className={styles.issue}>{line.issue}</p>}
              {readOnly ? (
                <p className={styles.unit}>Quantity: {line.quantity}</p>
              ) : (
              <div className={styles.controls}>
                <div className={styles.qty} role="group" aria-label={`Quantity for ${line.name}`}>
                  <button type="button" onClick={() => update(line.productId, line.quantity - 1)} disabled={busy} aria-label={line.quantity === 1 ? `Remove ${line.name}` : `Decrease quantity of ${line.name}`}>
                    −
                  </button>
                  <output aria-live="polite" aria-label={`Quantity: ${line.quantity}`}>{line.quantity}</output>
                  <button
                    type="button"
                    onClick={() => update(line.productId, line.quantity + 1)}
                    disabled={busy || line.quantity >= line.maxQuantity || Boolean(line.issue)}
                    aria-label={`Increase quantity of ${line.name}`}
                  >
                    +
                  </button>
                </div>
                <button type="button" className={styles.remove} onClick={() => remove(line.productId)} disabled={busy}>
                  Remove<span className="visually-hidden"> {line.name}</span>
                </button>
              </div>
              )}
            </div>
            <p className={styles.total}>{line.lineTotal ?? '—'}</p>
          </li>
        );
      })}
    </ul>
  );
}
