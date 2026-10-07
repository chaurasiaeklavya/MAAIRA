import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/db';
import { loadProducts } from '@/server/catalogue-repo';
import { handle, HttpError, json, limit } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ids = z.array(z.uuid()).max(50);

/** Card data for published products by id (wishlist, recently viewed). Read-only. */
export const GET = handle('products.lookup', async (req: NextRequest) => {
  await limit(req, 'lookup', 120, 60);
  const parsed = ids.safeParse((req.nextUrl.searchParams.get('ids') ?? '').split(',').filter(Boolean));
  if (!parsed.success) throw new HttpError(400, 'invalid');
  const found = await loadProducts(getDb(), { ids: parsed.data });
  const order = new Map(parsed.data.map((id, i) => [id, i]));
  found.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
  return json(200, { ok: true, products: found });
});
