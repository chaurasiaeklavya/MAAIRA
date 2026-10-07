import { existsSync, readFileSync } from 'node:fs';

/** Loads KEY=value pairs from .env.local for local scripts (never overrides real env). */
export function loadEnv(file = '.env.local') {
  if (process.env.NODE_ENV === 'production' || !existsSync(file)) return;
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
  }
}
