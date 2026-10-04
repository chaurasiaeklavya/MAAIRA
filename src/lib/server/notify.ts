import 'server-only';
import type { EnquiryRecord } from './store';

/**
 * Optional email notification of new enquiries via Resend's REST API.
 * Enabled only when RESEND_API_KEY, ENQUIRY_NOTIFY_TO and ENQUIRY_NOTIFY_FROM
 * are all set (the sender domain must be verified with Resend).
 */
export function notifierConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.ENQUIRY_NOTIFY_TO && process.env.ENQUIRY_NOTIFY_FROM);
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export async function notifyNewEnquiry(rec: EnquiryRecord): Promise<boolean> {
  if (!notifierConfigured()) return false;
  const rows: [string, string | null][] = [
    ['Reference', rec.id],
    ['Type', rec.kind === 'callback' ? 'Callback request' : 'Enquiry'],
    ['Name', rec.name],
    ['Email', rec.email],
    ['Phone', rec.phone],
    ['Piece', rec.pieceName],
    ['Preferred contact', rec.preferredContact],
    ['Preferred time', rec.callbackWindow],
    ['Message', rec.message],
    ['Received', rec.createdAt],
  ];
  const html = `<table cellpadding="6" style="font-family:Arial,sans-serif;font-size:14px">${rows
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="color:#6b5b4f;vertical-align:top">${esc(k)}</td><td>${esc(v!).replace(/\n/g, '<br>')}</td></tr>`)
    .join('')}</table>`;
  const text = rows
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.ENQUIRY_NOTIFY_FROM,
        to: process.env.ENQUIRY_NOTIFY_TO!.split(',').map((s) => s.trim()),
        reply_to: rec.email ?? undefined,
        subject: `${rec.kind === 'callback' ? 'Callback request' : 'New enquiry'} ${rec.id}${rec.pieceName ? ` — ${rec.pieceName}` : ''}`,
        html,
        text,
      }),
      cache: 'no-store',
    });
    return res.ok;
  } catch {
    return false;
  }
}
