import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRateLimiter } from '../src/lib/server/rate-limit.ts';

test('allows up to the limit within the window, then blocks with Retry-After', () => {
  const check = createRateLimiter({ limit: 3, windowMs: 60_000 });
  const t0 = 1_000_000;
  assert.equal(check('ip', t0).ok, true);
  assert.equal(check('ip', t0 + 1).ok, true);
  assert.equal(check('ip', t0 + 2).ok, true);
  const blocked = check('ip', t0 + 3);
  assert.equal(blocked.ok, false);
  if (!blocked.ok) assert.equal(blocked.retryAfterSeconds, 60);
  assert.equal(check('other-ip', t0 + 3).ok, true, 'keys are independent');
});

test('window slides: old hits expire', () => {
  const check = createRateLimiter({ limit: 1, windowMs: 1_000 });
  assert.equal(check('ip', 0).ok, true);
  assert.equal(check('ip', 500).ok, false);
  assert.equal(check('ip', 1_001).ok, true);
});
