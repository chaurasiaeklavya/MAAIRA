/**
 * Fixed-window rate limiting shared by every server instance (Postgres).
 * One atomic upsert per check — no read-modify-write race.
 */
import { sql } from 'drizzle-orm';
import type { Database } from '../db/connect';

export interface RateResult {
  allowed: boolean;
  remaining: number;
  retryAfterSec: number;
}

export async function hit(db: Database, key: string, limit: number, windowSec: number): Promise<RateResult> {
  const rows = await db.execute<{ count: number; window_start: Date }>(sql`
    insert into rate_limit_buckets as b (key, window_start, count)
    values (${key}, now(), 1)
    on conflict (key) do update set
      count = case when b.window_start < now() - make_interval(secs => ${windowSec}) then 1 else b.count + 1 end,
      window_start = case when b.window_start < now() - make_interval(secs => ${windowSec}) then now() else b.window_start end
    returning count, window_start`);
  const { count, window_start } = rows[0];
  const elapsed = (Date.now() - new Date(window_start).getTime()) / 1000;
  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    retryAfterSec: Math.max(1, Math.ceil(windowSec - elapsed)),
  };
}

/** Housekeeping: drop buckets older than a day. */
export async function prune(db: Database) {
  await db.execute(sql`delete from rate_limit_buckets where window_start < now() - interval '1 day'`);
}
