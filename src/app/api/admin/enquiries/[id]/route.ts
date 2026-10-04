import { NextResponse, type NextRequest } from 'next/server';
import { isAuthorised } from '@/lib/server/admin-auth';
import { ENQUIRY_STATUSES, getStore, type EnquiryStatus } from '@/lib/server/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!isAuthorised(req.headers.get('authorization'))) {
    return NextResponse.json({ ok: false, code: 'unauthorised' }, { status: 401 });
  }
  const store = getStore();
  if (!store) return NextResponse.json({ ok: false, code: 'not_configured' }, { status: 503 });

  const { id } = await ctx.params;
  let status: unknown;
  try {
    status = ((await req.json()) as { status?: unknown }).status;
  } catch {
    return NextResponse.json({ ok: false, code: 'invalid_json' }, { status: 400 });
  }
  if (!ENQUIRY_STATUSES.includes(status as EnquiryStatus) || !/^[A-Z]{2}-[A-Z0-9]+-[A-F0-9]{6}$/.test(id)) {
    return NextResponse.json({ ok: false, code: 'invalid' }, { status: 400 });
  }
  const updated = await store.updateStatus(id, status as EnquiryStatus);
  if (!updated) return NextResponse.json({ ok: false, code: 'not_found' }, { status: 404 });
  return NextResponse.json({ ok: true, id: updated.id, status: updated.status }, { headers: { 'Cache-Control': 'no-store' } });
}
