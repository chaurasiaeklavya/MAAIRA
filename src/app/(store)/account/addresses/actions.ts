'use server';

import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getDb } from '@/db';
import * as s from '@/db/schema';
import { addressSchema, fieldErrors } from '@/lib/commerce/checkout-schema';
import { currentUser } from '@/server/auth';

export type AddressState = { ok: boolean; errors?: Record<string, string>; message?: string };

export async function addAddress(_: AddressState, form: FormData): Promise<AddressState> {
  const user = await currentUser();
  if (!user) return { ok: false, message: 'Please sign in again.' };
  const parsed = addressSchema.safeParse({
    fullName: form.get('fullName'),
    phone: form.get('phone'),
    line1: form.get('line1'),
    line2: form.get('line2') ?? '',
    city: form.get('city'),
    state: form.get('state'),
    postalCode: form.get('postalCode'),
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const db = getDb();
  const count = await db.$count(s.addresses, eq(s.addresses.userId, user.id));
  if (count >= 10) return { ok: false, message: 'You can save up to 10 addresses.' };
  await db.insert(s.addresses).values({ userId: user.id, ...parsed.data, line2: parsed.data.line2 || null, isDefault: count === 0 });
  revalidatePath('/account/addresses');
  return { ok: true, message: 'Address saved.' };
}

export async function deleteAddress(form: FormData) {
  const user = await currentUser();
  const id = z.uuid().safeParse(form.get('id'));
  if (!user || !id.success) return;
  // Scoped to the signed-in user: another customer's address id does nothing.
  await getDb().delete(s.addresses).where(and(eq(s.addresses.id, id.data), eq(s.addresses.userId, user.id)));
  revalidatePath('/account/addresses');
}
