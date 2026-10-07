import { timingSafeEqual } from 'node:crypto';
import { getDb } from '@/db';
import { expireUnpaidOrders } from '@/server/commerce/orders-repo';
import { json } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Scheduled job (e.g. Vercel Cron): cancels expired unpaid orders and releases stock. */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const given = req.headers.get('authorization') ?? '';
  const expected = `Bearer ${secret}`;
  if (!secret || given.length !== expected.length || !timingSafeEqual(Buffer.from(given), Buffer.from(expected))) {
    return json(401, { ok: false });
  }
  return json(200, { ok: true, expired: await expireUnpaidOrders(getDb()) });
}
