/**
 * Sliding-window rate limiter (in memory, per server instance).
 * Adequate for a single Node server; on serverless or multi-instance hosting
 * each instance keeps its own window — pair with an edge/WAF limit there.
 */
export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const hits = new Map<string, number[]>();
  let lastSweep = 0;

  return function check(key: string, now = Date.now()) {
    if (now - lastSweep > windowMs) {
      for (const [k, times] of hits) {
        const fresh = times.filter((t) => now - t < windowMs);
        if (fresh.length) hits.set(k, fresh);
        else hits.delete(k);
      }
      lastSweep = now;
    }
    const times = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    if (times.length >= limit) {
      const retryAfterMs = windowMs - (now - times[0]);
      hits.set(key, times);
      return { ok: false as const, retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)) };
    }
    times.push(now);
    hits.set(key, times);
    return { ok: true as const, remaining: limit - times.length };
  };
}
