'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import type { CartView } from '@/server/commerce/cart-repo';
import { useExperience } from '../ExperienceProvider';

interface CartContextValue {
  cart: CartView;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  /** Adds and opens the drawer. Resolves false (with `error` set) if the server refused. */
  add: (productId: string, quantity?: number) => Promise<boolean>;
  update: (productId: string, quantity: number) => Promise<boolean>;
  remove: (productId: string) => Promise<boolean>;
  /** Re-reads the cart from the server (e.g. after payment empties it). */
  refresh: () => Promise<void>;
  pending: string | null;
  error: string | null;
  /** Short status for the polite live region ("Added to cart"). */
  announcement: string;
}

const CartContext = createContext<CartContextValue | null>(null);

const MESSAGES: Record<string, string> = {
  not_purchasable: 'This piece can’t be added to the cart yet.',
  stock: 'There isn’t enough stock for that quantity.',
  quantity: 'Please choose a quantity between 1 and 10.',
  not_found: 'That piece is no longer available.',
  rate_limited: 'Too many changes in a short time. Please wait a moment and try again.',
  not_configured: 'The cart is unavailable right now. Please try again later.',
};

export function CartProvider({ initial, children }: { initial: CartView; children: ReactNode }) {
  const [cart, setCart] = useState(initial);
  const [isOpen, setOpen] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const { play } = useExperience();
  const seq = useRef(0);

  const send = useCallback(
    async (method: 'POST' | 'PATCH' | 'DELETE', body: Record<string, unknown>, done: string) => {
      const id = ++seq.current;
      setPending(String(body.productId));
      setError(null);
      try {
        const res = await fetch('/api/cart', {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = (await res.json().catch(() => ({}))) as { ok?: boolean; cart?: CartView; code?: string; message?: string };
        if (id !== seq.current) return Boolean(data.ok);
        if (!res.ok || !data.ok || !data.cart) {
          setError(data.message ?? MESSAGES[data.code ?? ''] ?? 'Something went wrong. Please try again.');
          setAnnouncement('');
          play('error');
          return false;
        }
        setCart(data.cart);
        setAnnouncement(done);
        return true;
      } catch {
        setError('You appear to be offline. Please check your connection and try again.');
        return false;
      } finally {
        if (id === seq.current) setPending(null);
      }
    },
    [play],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      isOpen,
      open: () => setOpen(true),
      close: () => setOpen(false),
      add: async (productId, quantity = 1) => {
        const ok = await send('POST', { productId, quantity }, 'Added to cart');
        if (ok) {
          setOpen(true);
          play('success');
        }
        return ok;
      },
      update: (productId, quantity) => send('PATCH', { productId, quantity }, quantity === 0 ? 'Removed from cart' : 'Quantity updated'),
      remove: (productId) => send('DELETE', { productId }, 'Removed from cart'),
      refresh: async () => {
        try {
          const res = await fetch('/api/cart', { cache: 'no-store' });
          const data = (await res.json()) as { cart?: CartView };
          if (data.cart) setCart(data.cart);
        } catch {
          /* keep the current view */
        }
      },
      pending,
      error,
      announcement,
    }),
    [cart, isOpen, send, pending, error, announcement, play],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
