import 'server-only';
import { createDatabase, type Database } from './connect';

/**
 * Lazily created, process-wide database handle. Throws `DatabaseUnavailable`
 * when DATABASE_URL is missing so callers can render an honest error state.
 */
export class DatabaseUnavailable extends Error {
  constructor() {
    super('DATABASE_URL is not configured');
    this.name = 'DatabaseUnavailable';
  }
}

const globalForDb = globalThis as unknown as { maairaDb?: Database };

export function databaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function getDb(): Database {
  if (globalForDb.maairaDb) return globalForDb.maairaDb;
  const url = process.env.DATABASE_URL;
  if (!url) throw new DatabaseUnavailable();
  const { db } = createDatabase(url, { max: Number(process.env.DATABASE_POOL_MAX) || 10 });
  globalForDb.maairaDb = db;
  return db;
}

export type { Database };
