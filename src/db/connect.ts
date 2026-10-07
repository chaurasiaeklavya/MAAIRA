/**
 * Database connection factory. Kept free of `server-only` so scripts and
 * tests can create their own connection; the app uses `src/db/index.ts`.
 */
import type { ExtractTablesWithRelations } from 'drizzle-orm';
import type { PgTransaction } from 'drizzle-orm/pg-core';
import { drizzle, type PostgresJsQueryResultHKT } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export type Database = ReturnType<typeof createDatabase>['db'];
export type Transaction = PgTransaction<PostgresJsQueryResultHKT, typeof schema, ExtractTablesWithRelations<typeof schema>>;
/** Either the database or an open transaction. */
export type Executor = Database | Transaction;

export function createDatabase(url: string, options: { max?: number } = {}) {
  const client = postgres(url, {
    max: options.max ?? 10,
    idle_timeout: 20,
    connect_timeout: 10,
    // Prepared statements break behind transaction poolers (e.g. Supabase :6543).
    prepare: false,
    onnotice: () => {},
  });
  return { db: drizzle(client, { schema, casing: 'snake_case' }), client };
}
