'use client';

import { useEffect } from 'react';
import { useCart } from './CartProvider';

/** Refreshes the header cart after the server changed it (e.g. emptied on payment). */
export function CartSync({ token }: { token: string }) {
  const { refresh } = useCart();
  useEffect(() => {
    void refresh();
  }, [refresh, token]);
  return null;
}
