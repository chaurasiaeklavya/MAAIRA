import 'server-only';
import { notFound, redirect } from 'next/navigation';
import { getDb } from '@/db';
import * as s from '@/db/schema';
import { currentUser, type SessionUser } from './auth';

/**
 * Role-based access for the admin. Checked on every admin page AND inside
 * every server action / API handler — never only in the UI.
 */
const PERMISSIONS = {
  'admin:view': ['staff', 'admin'],
  'catalogue:write': ['staff', 'admin'],
  'orders:write': ['staff', 'admin'],
  'enquiries:write': ['staff', 'admin'],
  'settings:write': ['admin'],
  'audit:read': ['admin'],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function can(user: SessionUser | null, perm: Permission) {
  return Boolean(user && (PERMISSIONS[perm] as readonly string[]).includes(user.role));
}

/** For pages: signed-out → sign-in; signed-in without permission → 404 (doesn't reveal the admin). */
export async function requireStaffPage(perm: Permission = 'admin:view') {
  const user = await currentUser();
  if (!user) redirect('/admin/sign-in');
  if (!can(user, perm)) notFound();
  return user;
}

export class Forbidden extends Error {}

/** For server actions and API handlers. */
export async function requireStaff(perm: Permission) {
  const user = await currentUser();
  if (!can(user, perm)) throw new Forbidden('forbidden');
  return user!;
}

export async function audit(
  actor: SessionUser,
  action: string,
  targetType: string,
  targetId: string | null,
  detail?: Record<string, unknown>,
  result: 'ok' | 'denied' | 'error' = 'ok',
) {
  await getDb().insert(s.auditLog).values({ actorId: actor.id, actorEmail: actor.email, action, targetType, targetId, detail: detail ?? null, result });
}
