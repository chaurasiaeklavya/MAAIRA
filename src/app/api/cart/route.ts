import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/db';
import { ensureCart, readCartView } from '@/server/cart-session';
import { addItem, CartError, removeItem, setQuantity, viewCart } from '@/server/commerce/cart-repo';
import { handle, HttpError, json, limit, readJson } from '@/server/http';
import { BLOCKER_COPY, MAX_QUANTITY } from '@/lib/commerce/purchasable';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const line = z.strictObject({ productId: z.uuid(), quantity: z.number().int().min(0).max(MAX_QUANTITY) });
const removal = z.strictObject({ productId: z.uuid() });

async function mutate(req: NextRequest, schema: z.ZodType<{ productId: string; quantity?: number }>, op: (cartId: string, v: { productId: string; quantity?: number }) => Promise<unknown>) {
  const body = await readJson(req, 2000);
  await limit(req, 'cart', 60, 60);
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new HttpError(400, 'invalid');
  const cartId = await ensureCart();
  try {
    await op(cartId, parsed.data);
  } catch (err) {
    if (err instanceof CartError) {
      throw new HttpError(409, err.code, { message: err.blocker ? BLOCKER_COPY[err.blocker] : err.message });
    }
    throw err;
  }
  return json(200, { ok: true, cart: await viewCart(getDb(), cartId) });
}

export const GET = handle('cart.get', async () => json(200, { ok: true, cart: await readCartView() }));

export const POST = handle('cart.add', (req) =>
  mutate(req, line.refine((v) => v.quantity >= 1), (cartId, v) => addItem(getDb(), cartId, v.productId, v.quantity!)),
);

export const PATCH = handle('cart.update', (req) => mutate(req, line, (cartId, v) => setQuantity(getDb(), cartId, v.productId, v.quantity!)));

export const DELETE = handle('cart.remove', (req) => mutate(req, removal, (cartId, v) => removeItem(getDb(), cartId, v.productId)));
