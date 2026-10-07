'use client';

import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import { useExperience } from '../ExperienceProvider';
import styles from './EnquiryForm.module.css';
import { brand, enquiryMailto } from '@/data/brand';
import {
  CALLBACK_WINDOWS,
  LIMITS,
  validateEnquiry,
  type EnquiryKind,
  type FieldErrors,
} from '@/lib/enquiry/schema';

type Status =
  | { state: 'idle' }
  | { state: 'submitting' }
  | { state: 'success'; id: string; kind: EnquiryKind }
  | { state: 'error'; message: string }
  | { state: 'unavailable'; mailto: string };

const newKey = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

/**
 * Enquiry and callback form. Validates in the browser with the same rules
 * the server enforces, submits to /api/enquiries, and only reports success
 * when the server confirms it with a reference. If the enquiry service isn't
 * configured or reachable, it says so and offers email and phone instead —
 * keeping what the visitor typed.
 */
export interface PieceOption {
  slug: string;
  name: string;
}

export function EnquiryForm({
  pieces,
  initialMode = 'enquiry',
  defaultPieceId,
  defaultMessage,
  allowModeSwitch = true,
  headingId,
}: {
  /** Published pieces offered in the "Piece" select (value = product slug). */
  pieces: PieceOption[];
  initialMode?: EnquiryKind;
  /** Product slug to preselect. */
  defaultPieceId?: string;
  defaultMessage?: string;
  allowModeSwitch?: boolean;
  headingId?: string;
}) {
  const PIECE_IDS = pieces.map((p) => p.slug);
  const { play, scrollTo } = useExperience();
  const uid = useId();
  const [mode, setMode] = useState<EnquiryKind>(initialMode);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>({ state: 'idle' });
  const [key, setKey] = useState('');
  const openedAt = useRef(0);
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only values (random key, clock) must not be rendered on the server
    setKey(newKey());
    openedAt.current = Date.now();
  }, []);

  // Follow ?mode=callback links even after hydration (adjusting state during render).
  const [shownInitial, setShownInitial] = useState(initialMode);
  if (shownInitial !== initialMode) {
    setShownInitial(initialMode);
    setMode(initialMode);
  }

  const id = (name: string) => `${uid}-${name}`;
  const err = (name: keyof FieldErrors) =>
    errors[name]
      ? { 'aria-invalid': true, 'aria-describedby': id(`${name}-error`) }
      : { 'aria-invalid': undefined as undefined };

  function readForm() {
    const fd = new FormData(formRef.current!);
    return {
      kind: mode,
      name: fd.get('name'),
      email: fd.get('email') ?? '',
      phone: fd.get('phone') ?? '',
      pieceId: fd.get('pieceId') ?? '',
      message: fd.get('message') ?? '',
      preferredContact: fd.get('preferredContact') || undefined,
      callbackWindow: fd.get('callbackWindow') || undefined,
      consent: fd.get('consent') === 'on',
      website: fd.get('website') ?? '',
      elapsedMs: Date.now() - openedAt.current,
      idempotencyKey: key,
    };
  }

  function mailtoFromForm() {
    const v = readForm();
    const piece = pieces.find((p) => p.slug === v.pieceId);
    const lines = [
      `Name: ${v.name ?? ''}`,
      v.email ? `Email: ${v.email}` : '',
      v.phone ? `Phone: ${v.phone}` : '',
      piece ? `Piece: ${piece.name}` : '',
      mode === 'callback' && v.callbackWindow ? `Preferred time for a call: ${v.callbackWindow}` : '',
      '',
      String(v.message ?? ''),
    ].filter((l, i) => l || i === 5);
    return enquiryMailto(
      `${mode === 'callback' ? 'Callback request' : 'Enquiry'}${piece ? ` — ${piece.name}` : ''} | ${brand.name}`,
      lines.join('\n'),
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status.state === 'submitting') return;
    const payload = readForm();
    const check = validateEnquiry(payload, PIECE_IDS);
    if (!check.ok && !check.spam) {
      setErrors(check.errors);
      play('error');
      // Move focus to the first invalid field.
      const first = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
      requestAnimationFrame(() => (formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]') ?? first)?.focus());
      return;
    }
    setErrors({});
    setStatus({ state: 'submitting' });
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        id?: string;
        kind?: EnquiryKind;
        code?: string;
        errors?: FieldErrors;
      };
      if (res.ok && body.ok && body.id) {
        setStatus({ state: 'success', id: body.id, kind: body.kind ?? mode });
        play('success');
        formRef.current?.reset();
        setKey(newKey());
        openedAt.current = Date.now();
      } else if (res.status === 503 && body.code === 'not_configured') {
        setStatus({ state: 'unavailable', mailto: mailtoFromForm() });
      } else if (res.status === 400 && body.errors) {
        setErrors(body.errors);
        setStatus({ state: 'error', message: body.errors.form ?? 'Please check the highlighted fields.' });
        play('error');
      } else if (res.status === 429) {
        setStatus({ state: 'error', message: 'You have sent several requests in a short time. Please wait a few minutes and try again.' });
        play('error');
      } else {
        setStatus({ state: 'error', message: 'Something went wrong on our side and your request was not sent. Please try again, or use email or phone below.' });
        play('error');
      }
    } catch {
      setStatus({ state: 'unavailable', mailto: mailtoFromForm() });
    }
    // The result panel replaces a taller form, so bring it fully into view
    // (clear of the fixed header) before moving focus to it.
    requestAnimationFrame(() => {
      const el = statusRef.current;
      if (!el) return;
      el.focus({ preventScroll: true });
      const r = el.getBoundingClientRect();
      if (r.top < 96 || r.bottom > window.innerHeight) scrollTo(el);
    });
  }

  const submitting = status.state === 'submitting';

  if (status.state === 'success') {
    return (
      <motion.div
        ref={statusRef}
        tabIndex={-1}
        className={styles.success}
        role="status"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className={`logo-mask logo-mask--monogram ${styles.successMark}`} aria-hidden="true" />
        <h3 className="display">Thank you — your {status.kind === 'callback' ? 'callback request' : 'enquiry'} has been received.</h3>
        <p>
          Your reference is <strong className={styles.ref}>{status.id}</strong>. Please quote it if you contact the house
          about this request.
        </p>
        <button type="button" className={styles.secondaryButton} onClick={() => setStatus({ state: 'idle' })}>
          Send another request
        </button>
      </motion.div>
    );
  }

  return (
    <form ref={formRef} className={styles.form} onSubmit={onSubmit} noValidate aria-labelledby={headingId}>
      {allowModeSwitch && (
        <div className={styles.modes} role="group" aria-label="Type of request">
          {(['enquiry', 'callback'] as const).map((m) => (
            <button
              key={m}
              type="button"
              className={styles.mode}
              aria-pressed={mode === m}
              onClick={() => {
                setMode(m);
                setErrors({});
                play('tick');
              }}
            >
              {m === 'enquiry' ? 'Send an enquiry' : 'Request a callback'}
            </button>
          ))}
        </div>
      )}

      {/* Honeypot: invisible to people, left empty by them. */}
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor={id('website')}>Website</label>
        <input id={id('website')} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className={styles.grid}>
        <Field label="Your name" name="name" id={id('name')} error={errors.name} required>
          <input id={id('name')} name="name" type="text" autoComplete="name" maxLength={LIMITS.name.max} required {...err('name')} />
        </Field>

        {mode === 'enquiry' ? (
          <>
            <Field label="Email" name="email" id={id('email')} error={errors.email} required>
              <input id={id('email')} name="email" type="email" autoComplete="email" inputMode="email" required {...err('email')} />
            </Field>
            <Field label="Phone" name="phone" id={id('phone')} error={errors.phone} hint="Optional">
              <input id={id('phone')} name="phone" type="tel" autoComplete="tel" inputMode="tel" {...err('phone')} />
            </Field>
          </>
        ) : (
          <>
            <Field label="Phone number to call" name="phone" id={id('phone')} error={errors.phone} required hint="With country code if outside India">
              <input id={id('phone')} name="phone" type="tel" autoComplete="tel" inputMode="tel" required {...err('phone')} />
            </Field>
            <Field label="Email" name="email" id={id('email')} error={errors.email} hint="Optional">
              <input id={id('email')} name="email" type="email" autoComplete="email" inputMode="email" {...err('email')} />
            </Field>
          </>
        )}

        <Field label="Piece" name="pieceId" id={id('pieceId')} error={errors.pieceId} hint={mode === 'callback' ? 'Optional' : undefined}>
          <select id={id('pieceId')} name="pieceId" defaultValue={defaultPieceId ?? 'general'} {...err('pieceId')}>
            <option value="general">General enquiry</option>
            {pieces.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35 }}
          className={styles.modeFields}
        >
          {mode === 'callback' ? (
            <fieldset className={styles.fieldset} aria-describedby={errors.callbackWindow ? id('callbackWindow-error') : undefined}>
              <legend>
                Preferred time for a call <span className={styles.req}>(required)</span>
              </legend>
              <div className={styles.chips}>
                {CALLBACK_WINDOWS.map((w) => (
                  <label key={w.value} className={styles.chip}>
                    <input type="radio" name="callbackWindow" value={w.value} />
                    <span>{w.label}</span>
                  </label>
                ))}
              </div>
              <p className={styles.hint}>A preference only; a specific time can’t be guaranteed.</p>
              {errors.callbackWindow && (
                <p id={id('callbackWindow-error')} className={styles.error}>
                  {errors.callbackWindow}
                </p>
              )}
            </fieldset>
          ) : (
            <fieldset className={styles.fieldset}>
              <legend>Preferred way to reply</legend>
              <div className={styles.chips}>
                <label className={styles.chip}>
                  <input type="radio" name="preferredContact" value="email" defaultChecked />
                  <span>Email</span>
                </label>
                <label className={styles.chip}>
                  <input type="radio" name="preferredContact" value="phone" />
                  <span>Phone</span>
                </label>
              </div>
            </fieldset>
          )}

          <Field
            label={mode === 'callback' ? 'Anything we should know?' : 'Your message'}
            name="message"
            id={id('message')}
            error={errors.message}
            required={mode === 'enquiry'}
            hint={mode === 'callback' ? `Optional · up to ${LIMITS.note.max} characters` : `${LIMITS.message.min}–${LIMITS.message.max} characters`}
          >
            <textarea
              id={id('message')}
              name="message"
              rows={mode === 'callback' ? 3 : 5}
              maxLength={mode === 'callback' ? LIMITS.note.max : LIMITS.message.max}
              required={mode === 'enquiry'}
              defaultValue={mode === 'enquiry' ? defaultMessage : undefined}
              {...err('message')}
            />
          </Field>
        </motion.div>
      </AnimatePresence>

      <div className={styles.consent}>
        <label className={styles.check}>
          <input type="checkbox" name="consent" {...err('consent')} />
          <span>
            I agree that {brand.name} ({brand.businessName}) may contact me about this request.{' '}
            <Link href="/client-services/privacy">Privacy</Link>
          </span>
        </label>
        {errors.consent && (
          <p id={id('consent-error')} className={styles.error}>
            {errors.consent}
          </p>
        )}
      </div>

      <div className={styles.footer}>
        <button type="submit" className={styles.submit} disabled={submitting || !key} aria-busy={submitting}>
          <span>{submitting ? 'Sending…' : mode === 'callback' ? 'Request a callback' : 'Send enquiry'}</span>
          {submitting && <span className={styles.spinner} aria-hidden="true" />}
        </button>
        <p className={styles.alt}>
          Or write to <a href={`mailto:${brand.contact.email}`}>{brand.contact.email}</a> · call{' '}
          <a href={brand.contact.phoneHref}>{brand.contact.phoneDisplay}</a>
        </p>
      </div>

      <div ref={statusRef} tabIndex={-1} className={styles.statusRegion} aria-live="polite">
        {status.state === 'error' && (
          <p className={styles.formError} role="alert">
            {status.message}
          </p>
        )}
        {status.state === 'unavailable' && (
          <div className={styles.unavailable} role="alert">
            <p>
              <strong>Online requests aren’t connected yet</strong>, so this form could not send your message. Nothing
              has been submitted.
            </p>
            <p>You can send the same details by email in one step, or call the house directly:</p>
            <div className={styles.unavailableActions}>
              <a className={styles.secondaryButton} href={status.mailto}>
                Email these details
              </a>
              <a className={styles.secondaryButton} href={brand.contact.phoneHref}>
                Call {brand.contact.phoneDisplay}
              </a>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  id,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  name: string;
  id: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.field} data-invalid={error ? true : undefined} data-name={name}>
      <label htmlFor={id}>
        {label}
        {required && <span className={styles.req}> (required)</span>}
        {hint && <span className={styles.hintInline}> · {hint}</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
