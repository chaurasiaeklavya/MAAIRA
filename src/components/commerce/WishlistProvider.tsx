'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

/**
 * Wishlist: kept on this device for guests (localStorage), and in the
 * account for signed-in customers. A guest's saved pieces move into the
 * account the first time they sign in on this device.
 */
interface WishlistContextValue {
  ids: string[];
  has: (productId: string) => boolean;
  toggle: (productId: string, name: string) => Promise<void>;
  announcement: string;
  signedIn: boolean;
}

const KEY = 'maaira-wishlist';
const WishlistContext = createContext<WishlistContextValue | null>(null);

function readLocal(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string').slice(0, 100) : [];
  } catch {
    return [];
  }
}
function writeLocal(ids: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    /* storage unavailable — the in-memory list still works for this visit */
  }
}

async function api(method: 'GET' | 'POST' | 'DELETE', productId?: string) {
  const res = await fetch('/api/wishlist', {
    method,
    headers: method === 'GET' ? undefined : { 'Content-Type': 'application/json' },
    body: productId ? JSON.stringify({ productId }) : undefined,
  });
  if (!res.ok) throw new Error(String(res.status));
  return (await res.json()) as { ids: string[] };
}

export function WishlistProvider({ signedIn, children }: { signedIn: boolean; children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const local = readLocal();
      if (!signedIn) {
        if (!cancelled) setIds(local);
        return;
      }
      try {
        for (const id of local) await api('POST', id).catch(() => {});
        if (local.length) writeLocal([]);
        const { ids: server } = await api('GET');
        if (!cancelled) setIds(server);
      } catch {
        if (!cancelled) setIds(local);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [signedIn]);

  const toggle = useCallback(
    async (productId: string, name: string) => {
      const saved = ids.includes(productId);
      const next = saved ? ids.filter((x) => x !== productId) : [productId, ...ids];
      setIds(next);
      setAnnouncement(saved ? `${name} removed from your wishlist` : `${name} saved to your wishlist`);
      if (!signedIn) {
        writeLocal(next);
        return;
      }
      try {
        const { ids: server } = await api(saved ? 'DELETE' : 'POST', productId);
        setIds(server);
      } catch {
        setIds(ids);
        setAnnouncement('Your wishlist couldn’t be updated. Please try again.');
      }
    },
    [ids, signedIn],
  );

  const value = useMemo(() => ({ ids, has: (id: string) => ids.includes(id), toggle, announcement, signedIn }), [ids, toggle, announcement, signedIn]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside <WishlistProvider>');
  return ctx;
}

/** Recently viewed products on this device (UX only; nothing is sent to the server). */
const RECENT_KEY = 'maaira-recent';
export function rememberViewed(productId: string) {
  try {
    const list = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]') as string[];
    const next = [productId, ...list.filter((x) => x !== productId)].slice(0, 12);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}
export function readViewed(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}
