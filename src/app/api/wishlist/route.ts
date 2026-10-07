import type { NextRequest } from 'next/server';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { getDb } from '@/db';
import * as s from '@/db/schema';
import { currentUser } from '@/server/auth';
import { handle, HttpError, json, limit, readJson } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Account wishlist. Each request acts only on the signed-in customer's own list. */
async function requireUser() {
  const user = await currentUser();
  if (!user) throw new HttpError(401, 'sign_in_required');
  return user;
}

async function listIds(userId: string) {
  const rows = await getDb()
    .select({ id: s.wishlistItems.productId })
    .from(s.wishlistItems)
    .where(eq(s.wishlistItems.userId, userId))
    .orderBy(desc(s.wishlistItems.createdAt));
  return rows.map((r) => r.id);
}

const body = z.strictObject({ productId: z.uuid() });

export const GET = handle('wishlist.get', async () => {
  const user = await requireUser();
  return json(200, { ok: true, ids: await listIds(user.id) });
});

export const POST = handle('wishlist.add', async (req: NextRequest) => {
  const user = await requireUser();
  const parsed = body.safeParse(await readJson(req, 500));
  if (!parsed.success) throw new HttpError(400, 'invalid');
  await limit(req, 'wishlist', 60, 60, user.id);
  const db = getDb();
  const [p] = await db.select({ id: s.products.id }).from(s.products).where(and(eq(s.products.id, parsed.data.productId), eq(s.products.status, 'published')));
  if (!p) throw new HttpError(404, 'not_found');
  await db.insert(s.wishlistItems).values({ userId: user.id, productId: p.id }).onConflictDoNothing();
  return json(200, { ok: true, ids: await listIds(user.id) });
});

export const DELETE = handle('wishlist.remove', async (req: NextRequest) => {
  const user = await requireUser();
  const parsed = body.safeParse(await readJson(req, 500));
  if (!parsed.success) throw new HttpError(400, 'invalid');
  await getDb().delete(s.wishlistItems).where(and(eq(s.wishlistItems.userId, user.id), eq(s.wishlistItems.productId, parsed.data.productId)));
  return json(200, { ok: true, ids: await listIds(user.id) });
});
