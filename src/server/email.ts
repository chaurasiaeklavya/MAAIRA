/**
 * Transactional email via Resend's REST API. Operational only when
 * RESEND_API_KEY and EMAIL_FROM are set (sender domain verified with
 * Resend). Callers get `{ sent: false }` otherwise — nothing is pretended.
 * Content is HTML-escaped; errors never include provider responses.
 */
export interface EmailMessage {
  to: string | string[];
  subject: string;
  /** Rows rendered as a simple, accessible table (label → value). */
  rows?: [string, string | null | undefined][];
  intro?: string;
  action?: { label: string; url: string };
  replyTo?: string | null;
}

export function emailConfigured(env: Record<string, string | undefined> = process.env) {
  return Boolean(env.RESEND_API_KEY && env.EMAIL_FROM);
}

export const businessInbox = (env: Record<string, string | undefined> = process.env) =>
  (env.BUSINESS_NOTIFY_TO ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s));

export const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export function renderEmail(m: EmailMessage) {
  const rows = (m.rows ?? []).filter(([, v]) => v);
  const html = `<div style="font-family:Arial,sans-serif;font-size:14px;color:#241a15;max-width:560px">
<p style="letter-spacing:.2em;font-size:12px">MAAIRA FASHION BAGS</p>
${m.intro ? `<p>${esc(m.intro)}</p>` : ''}
${rows.length ? `<table cellpadding="6" style="border-collapse:collapse">${rows
    .map(([k, v]) => `<tr><td style="color:#6b5b4f;vertical-align:top">${esc(k)}</td><td>${esc(String(v)).replace(/\n/g, '<br>')}</td></tr>`)
    .join('')}</table>` : ''}
${m.action ? `<p><a href="${esc(m.action.url)}" style="color:#86643f">${esc(m.action.label)}</a></p>` : ''}
<p style="color:#6b5b4f;font-size:12px">Maanya Enterprises</p></div>`;
  const text = [m.intro, ...rows.map(([k, v]) => `${k}: ${v}`), m.action ? `${m.action.label}: ${m.action.url}` : null, 'Maanya Enterprises']
    .filter(Boolean)
    .join('\n');
  return { html, text };
}

export async function sendEmail(m: EmailMessage, fetchImpl: typeof fetch = fetch): Promise<{ sent: boolean }> {
  if (!emailConfigured()) return { sent: false };
  const to = (Array.isArray(m.to) ? m.to : [m.to]).filter(Boolean);
  if (!to.length) return { sent: false };
  const { html, text } = renderEmail(m);
  try {
    const res = await fetchImpl('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: process.env.EMAIL_FROM, to, reply_to: m.replyTo ?? undefined, subject: m.subject, html, text }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error(JSON.stringify({ evt: 'email_failed', status: res.status, subject: m.subject }));
    return { sent: res.ok };
  } catch {
    console.error(JSON.stringify({ evt: 'email_failed', status: 'network', subject: m.subject }));
    return { sent: false };
  }
}
