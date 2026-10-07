/**
 * Applies pending SQL migrations from ./drizzle.
 *   npm run db:migrate            (uses DATABASE_URL; loads .env.local outside production)
 */
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { createDatabase } from '../../src/db/connect';
import { loadEnv } from './env';

async function main() {
  loadEnv();
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set.');
  const { db, client } = createDatabase(url, { max: 1 });
  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Migrations applied.');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
