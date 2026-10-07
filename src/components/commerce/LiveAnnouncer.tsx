'use client';

import { useCart } from './CartProvider';
import { useWishlist } from './WishlistProvider';

/** One polite live region for cart and wishlist feedback (screen readers). */
export function LiveAnnouncer() {
  const { announcement } = useCart();
  const { announcement: wish } = useWishlist();
  return (
    <div className="visually-hidden" aria-live="polite" aria-atomic="true">
      <span>{announcement}</span> <span>{wish}</span>
    </div>
  );
}
