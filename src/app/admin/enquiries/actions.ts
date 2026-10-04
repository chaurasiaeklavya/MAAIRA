'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { isAuthorised } from '@/lib/server/admin-auth';
import { ENQUIRY_STATUSES, getStore, type EnquiryStatus } from '@/lib/server/store';

export async function updateStatusAction(formData: FormData) {
  const auth = (await headers()).get('authorization');
  if (!isAuthorised(auth)) throw new Error('Unauthorised');
  const store = getStore();
  if (!store) throw new Error('No enquiry store configured');
  const id = String(formData.get('id') ?? '');
  const status = String(formData.get('status') ?? '') as EnquiryStatus;
  if (!ENQUIRY_STATUSES.includes(status) || !/^[A-Z]{2}-[A-Z0-9]+-[A-F0-9]{6}$/.test(id)) throw new Error('Invalid update');
  await store.updateStatus(id, status);
  revalidatePath('/admin/enquiries');
}
