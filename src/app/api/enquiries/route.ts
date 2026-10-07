import type { NextRequest } from 'next/server';
import { getDb } from '@/db';
import { validateEnquiry, type EnquiryPayload } from '@/lib/enquiry/schema';
import { businessInbox, sendEmail } from '@/server/email';
import { createEnquiry, knownProductSlugs } from '@/server/enquiries-repo';
import { handle, HttpError, json, limit, readJson } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Enquiry and callback requests. Stored in Postgres (the record of truth);
 * the business is emailed when transactional email is configured. Success is
 * returned only after the record is committed.
 */
export const POST = handle('enquiries', async (req: NextRequest) => {
  const payload = await readJson<EnquiryPayload>(req);
  const db = getDb();
  await limit(req, 'enquiry', Math.max(1, Number(process.env.ENQUIRY_RATE_LIMIT_MAX) || 5), 600);

  const result = validateEnquiry(payload, await knownProductSlugs(db));
  if (!result.ok) throw new HttpError(400, result.spam ? 'rejected' : 'invalid', { errors: result.errors });
  const v = result.value;

  const rec = await createEnquiry(db, v);
  if (rec.duplicate) return json(200, { ok: true, id: rec.id, kind: rec.kind, duplicate: true });

  const inbox = businessInbox();
  if (inbox.length) {
    await sendEmail({
      to: inbox,
      replyTo: v.email,
      subject: `${v.kind === 'callback' ? 'Callback request' : 'New enquiry'} ${rec.id}${rec.productLabel ? ` — ${rec.productLabel}` : ''}`,
      rows: [
        ['Reference', rec.id],
        ['Name', v.name],
        ['Email', v.email],
        ['Phone', v.phone],
        ['Piece', rec.productLabel],
        ['Preferred contact', v.preferredContact],
        ['Preferred time', v.callbackWindow],
        ['Message', v.message],
      ],
    });
  }
  console.info(JSON.stringify({ evt: 'enquiry_received', id: rec.id, kind: rec.kind }));
  return json(201, { ok: true, id: rec.id, kind: rec.kind });
});

export function GET() {
  return json(405, { ok: false, code: 'method_not_allowed' }, { Allow: 'POST' });
}
