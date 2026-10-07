'use client';

import { useWishlist } from './WishlistProvider';
import styles from './WishlistButton.module.css';

/** ♡ / ♥ toggle with an explicit accessible name and pressed state. */
export function WishlistButton({ productId, name, className, withLabel = false }: { productId: string; name: string; className?: string; withLabel?: boolean }) {
  const { has, toggle } = useWishlist();
  const saved = has(productId);
  return (
    <button
      type="button"
      className={`${styles.button} ${withLabel ? styles.labelled : ''} ${className ?? ''}`}
      aria-pressed={saved}
      aria-label={withLabel ? undefined : saved ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`}
      onClick={() => toggle(productId, name)}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" className={styles.icon}>
        <path
          d="M12 20.3s-7.6-4.6-9.2-9.4C1.7 7.6 3.8 4.5 7.1 4.5c2 0 3.6 1.1 4.9 2.8 1.3-1.7 2.9-2.8 4.9-2.8 3.3 0 5.4 3.1 4.3 6.4-1.6 4.8-9.2 9.4-9.2 9.4z"
          fill={saved ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
      </svg>
      {withLabel && <span>{saved ? 'Saved to wishlist' : 'Add to wishlist'}</span>}
    </button>
  );
}
