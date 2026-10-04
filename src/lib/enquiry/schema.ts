/**
 * Enquiry & callback validation — shared by the browser (instant feedback)
 * and the server (authoritative). Dependency-free so it runs anywhere,
 * including Node's built-in test runner.
 */

export type EnquiryKind = 'enquiry' | 'callback';
export type PreferredContact = 'email' | 'phone';
export type CallbackWindow = 'morning' | 'afternoon' | 'evening' | 'any';

export interface EnquiryPayload {
  kind?: unknown;
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  pieceId?: unknown;
  message?: unknown;
  preferredContact?: unknown;
  callbackWindow?: unknown;
  consent?: unknown;
  /** Honeypot: hidden from people, tempting to bots. Must stay empty. */
  website?: unknown;
  /** Milliseconds the form was open before submitting (bot timing trap). */
  elapsedMs?: unknown;
  idempotencyKey?: unknown;
}

export interface CleanEnquiry {
  kind: EnquiryKind;
  name: string;
  email: string | null;
  phone: string | null;
  pieceId: string | null;
  message: string | null;
  preferredContact: PreferredContact | null;
  callbackWindow: CallbackWindow | null;
  idempotencyKey: string;
}

export type FieldErrors = Partial<Record<keyof CleanEnquiry | 'consent' | 'form', string>>;

export type ValidationResult =
  | { ok: true; value: CleanEnquiry }
  | { ok: false; errors: FieldErrors; spam?: boolean };

export const LIMITS = {
  name: { min: 2, max: 80 },
  email: { max: 254 },
  message: { min: 10, max: 2000 },
  note: { max: 500 },
  minElapsedMs: 1500,
} as const;

/** A preference only — no callback time or response window is promised. */
export const CALLBACK_WINDOWS: { value: CallbackWindow; label: string }[] = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
  { value: 'any', label: 'Any time' },
];

// Control characters except tab/newline are stripped from free text.
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[A-Za-z]{2,}$/;

function text(v: unknown, { multiline = false } = {}) {
  if (typeof v !== 'string') return '';
  let s = v.replace(CONTROL, '').trim();
  if (!multiline) s = s.replace(/\s+/g, ' ');
  else s = s.replace(/\r\n?/g, '\n').replace(/\n{3,}/g, '\n\n');
  return s;
}

/**
 * Normalise a phone number. Ten-digit Indian mobile numbers (starting 6–9)
 * get +91; other numbers must include a country code (+ and 8–15 digits).
 */
export function normalisePhone(v: unknown): string | null {
  const raw = text(v);
  if (!raw) return null;
  if (!/^[+\d\s().-]+$/.test(raw)) return null;
  const plus = raw.trim().startsWith('+');
  let digits = raw.replace(/\D/g, '');
  if (!plus) {
    if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
    if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
    if (digits.length === 10 && /^[6-9]/.test(digits)) return `+91${digits}`;
    return null;
  }
  if (digits.length < 8 || digits.length > 15) return null;
  if (digits.startsWith('91') && !(digits.length === 12 && /^91[6-9]/.test(digits))) return null;
  return `+${digits}`;
}

export function validateEnquiry(input: EnquiryPayload, knownPieceIds: readonly string[]): ValidationResult {
  const errors: FieldErrors = {};

  // Bot traps first: never reveal which one tripped.
  const honeypot = text(input.website);
  const elapsed = typeof input.elapsedMs === 'number' ? input.elapsedMs : Number.NaN;
  if (honeypot || (Number.isFinite(elapsed) && elapsed < LIMITS.minElapsedMs)) {
    return { ok: false, spam: true, errors: { form: 'Your request could not be accepted. Please try again.' } };
  }

  const kind: EnquiryKind | null = input.kind === 'enquiry' || input.kind === 'callback' ? input.kind : null;
  if (!kind) errors.form = 'Unknown request type.';

  const name = text(input.name);
  if (name.length < LIMITS.name.min) errors.name = 'Please enter your name.';
  else if (name.length > LIMITS.name.max) errors.name = `Please keep your name under ${LIMITS.name.max} characters.`;

  const emailRaw = text(input.email).toLowerCase();
  let email: string | null = null;
  if (emailRaw) {
    if (emailRaw.length > LIMITS.email.max || !EMAIL.test(emailRaw)) errors.email = 'Please enter a valid email address.';
    else email = emailRaw;
  } else if (kind === 'enquiry') {
    errors.email = 'Please enter your email address.';
  }

  const phoneRaw = text(input.phone);
  let phone: string | null = null;
  if (phoneRaw) {
    phone = normalisePhone(phoneRaw);
    if (!phone) errors.phone = 'Please enter a valid phone number (include the country code if outside India).';
  } else if (kind === 'callback') {
    errors.phone = 'Please enter the number we should call.';
  }

  const pieceRaw = text(input.pieceId);
  let pieceId: string | null = null;
  if (pieceRaw && pieceRaw !== 'general') {
    if (knownPieceIds.includes(pieceRaw)) pieceId = pieceRaw;
    else errors.pieceId = 'Please choose a piece from the list.';
  }

  const message = text(input.message, { multiline: true });
  if (kind === 'enquiry') {
    if (message.length < LIMITS.message.min) errors.message = `Please write a little more (at least ${LIMITS.message.min} characters).`;
    else if (message.length > LIMITS.message.max) errors.message = `Please keep your message under ${LIMITS.message.max} characters.`;
  } else if (message.length > LIMITS.note.max) {
    errors.message = `Please keep your note under ${LIMITS.note.max} characters.`;
  }

  const preferredContact: PreferredContact | null =
    input.preferredContact === 'email' || input.preferredContact === 'phone' ? input.preferredContact : null;
  if (preferredContact === 'phone' && kind === 'enquiry' && !phone && !errors.phone) {
    errors.phone = 'Please add a phone number, or choose email as your preferred contact.';
  }

  const windows = CALLBACK_WINDOWS.map((w) => w.value) as string[];
  const callbackWindow =
    typeof input.callbackWindow === 'string' && windows.includes(input.callbackWindow)
      ? (input.callbackWindow as CallbackWindow)
      : null;
  if (kind === 'callback' && !callbackWindow) errors.callbackWindow = 'Please choose a time that suits you.';

  if (input.consent !== true) errors.consent = 'Please confirm we may contact you about this request.';

  const key = typeof input.idempotencyKey === 'string' ? input.idempotencyKey : '';
  if (!/^[A-Za-z0-9-]{8,64}$/.test(key)) errors.form = errors.form ?? 'Please reload the page and try again.';

  if (Object.keys(errors).length || !kind) return { ok: false, errors };

  return {
    ok: true,
    value: {
      kind,
      name,
      email,
      phone,
      pieceId,
      message: message || null,
      preferredContact,
      callbackWindow: kind === 'callback' ? callbackWindow : null,
      idempotencyKey: key,
    },
  };
}
