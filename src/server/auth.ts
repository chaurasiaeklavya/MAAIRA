import 'server-only';
import { headers } from 'next/headers';
import { cache } from 'react';
import { getDb } from '@/db';
import { createAuth, type Auth } from './auth-config';

const globalForAuth = globalThis as unknown as { maairaAuth?: Auth };

export function authConfigured() {
  return Boolean(process.env.DATABASE_URL && process.env.BETTER_AUTH_SECRET && process.env.BETTER_AUTH_SECRET.length >= 32);
}

export function getAuth(): Auth {
  globalForAuth.maairaAuth ??= createAuth(getDb());
  return globalForAuth.maairaAuth;
}

export type Role = 'customer' | 'staff' | 'admin';
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

/** Current signed-in user (validated against the database), or null. */
export const currentUser = cache(async (): Promise<SessionUser | null> => {
  if (!authConfigured()) return null;
  try {
    const session = await getAuth().api.getSession({ headers: await headers() });
    if (!session) return null;
    const u = session.user as typeof session.user & { role?: string };
    const role: Role = u.role === 'admin' || u.role === 'staff' ? u.role : 'customer';
    return { id: u.id, email: u.email, name: u.name, role };
  } catch {
    return null;
  }
});
