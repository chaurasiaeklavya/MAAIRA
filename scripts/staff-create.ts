/**
 * Creates (or promotes) a staff account. Staff can't self-register.
 *   STAFF_PASSWORD='…' npm run staff:create -- --email owner@example.com --name "Owner" --role admin
 * If STAFF_PASSWORD is not set, a strong one-time password is generated and
 * printed once; change it after first sign-in.
 */
import { randomBytes } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { createDatabase } from '../src/db/connect';
import { user } from '../src/db/schema';
import { createAuth } from '../src/server/auth-config';
import { loadEnv } from './db/env';

const arg = (k: string) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > -1 ? process.argv[i + 1] : undefined;
};

async function main() {
  loadEnv();
  const email = arg('email')?.toLowerCase();
  const name = arg('name') ?? 'MAAIRA staff';
  const role = arg('role') ?? 'staff';
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('--email is required');
  if (!['staff', 'admin'].includes(role)) throw new Error('--role must be staff or admin');
  const { db, client } = createDatabase(process.env.DATABASE_URL!, { max: 1 });
  try {
    const [existing] = await db.select().from(user).where(eq(user.email, email));
    let generated: string | null = null;
    if (!existing) {
      const password = process.env.STAFF_PASSWORD || (generated = randomBytes(18).toString('base64url'));
      if (password.length < 12) throw new Error('STAFF_PASSWORD must be at least 12 characters');
      await createAuth(db).api.signUpEmail({ body: { email, password, name } });
    }
    await db.update(user).set({ role }).where(eq(user.email, email));
    console.log(`${existing ? 'Updated' : 'Created'} ${role} account ${email}.`);
    if (generated) console.log(`One-time password (shown once; change it after signing in): ${generated}`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
