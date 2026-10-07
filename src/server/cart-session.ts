import 'server-only';
import { cookies } from 'next/headers';
import { getDb } from '@/db';
import { currentUser } from './auth';
import { createCart, findCartId, hashToken, mergeGuestCart, newToken, viewCart } from './commerce/cart-repo';

export const CART_COOKIE = 'maaira_cart';
const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 60 * 24 * 30,
};

/** Read-only lookup for rendering (server components can't set cookies). */
export async function readCartId() {
  const token = (await cookies()).get(CART_COOKIE)?.value;
  const user = await currentUser();
  return findCartId(getDb(), { tokenHash: token ? hashToken(token) : null, userId: user?.id ?? null });
}

export async function readCartView() {
  return viewCart(getDb(), await readCartId());
}

/**
 * For route handlers: returns the visitor's cart, creating it if needed.
 * A signed-in visitor's guest cart is merged into their account cart once.
 */
export async function ensureCart() {
  const db = getDb();
  const jar = await cookies();
  const user = await currentUser();
  const token = jar.get(CART_COOKIE)?.value;
  if (user && token) await mergeGuestCart(db, hashToken(token), user.id);
  const existing = await findCartId(db, { tokenHash: token ? hashToken(token) : null, userId: user?.id ?? null });
  if (existing) return existing;
  const fresh = newToken();
  const id = await createCart(db, hashToken(fresh), user?.id ?? null);
  if (!user) jar.set(CART_COOKIE, fresh, COOKIE_OPTS);
  return id;
}
