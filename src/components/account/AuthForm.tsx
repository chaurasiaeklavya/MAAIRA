'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useId, useRef, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import styles from './Account.module.css';

type Mode = 'sign-in' | 'register' | 'forgot' | 'reset';

const COPY: Record<Mode, { submit: string; busy: string }> = {
  'sign-in': { submit: 'Sign in', busy: 'Signing in…' },
  register: { submit: 'Create account', busy: 'Creating account…' },
  forgot: { submit: 'Send reset link', busy: 'Sending…' },
  reset: { submit: 'Set new password', busy: 'Saving…' },
};

/** Sign in, register and password reset — plain fields, clear errors, no account enumeration. */
export function AuthForm({ mode, next = '/account', token, staff = false }: { mode: Mode; next?: string; token?: string; staff?: boolean }) {
  const router = useRouter();
  const uid = useId();
  const ref = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/account';

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    const fd = new FormData(ref.current!);
    const email = String(fd.get('email') ?? '').trim();
    const password = String(fd.get('password') ?? '');
    setError(null);
    if ((mode === 'register' || mode === 'reset') && password !== String(fd.get('confirm') ?? '')) {
      setError('The passwords don’t match.');
      return;
    }
    if ((mode === 'register' || mode === 'reset') && password.length < 10) {
      setError('Please use at least 10 characters for your password.');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'sign-in') {
        const { error: err } = await authClient.signIn.email({ email, password });
        if (err) throw new Error(err.status === 429 ? 'Too many attempts. Please wait a few minutes and try again.' : 'That email and password don’t match. Please try again.');
        router.replace(safeNext);
        router.refresh();
      } else if (mode === 'register') {
        const { error: err } = await authClient.signUp.email({ email, password, name: String(fd.get('name') ?? '').trim() });
        if (err) throw new Error(err.status === 429 ? 'Too many attempts. Please try again later.' : err.message?.includes('exist') ? 'An account with this email may already exist — try signing in.' : 'We couldn’t create the account. Please check your details.');
        router.replace(safeNext);
        router.refresh();
      } else if (mode === 'forgot') {
        await authClient.requestPasswordReset({ email, redirectTo: '/account/reset-password' });
        setDone('If an account exists for that email, a reset link is on its way. It’s valid for 30 minutes.');
      } else {
        const { error: err } = await authClient.resetPassword({ newPassword: password, token: token ?? '' });
        if (err) throw new Error('This reset link is invalid or has expired. Please request a new one.');
        setDone('Your password has been changed. You can now sign in.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className={styles.done} role="status">
        <p>{done}</p>
        <Link href={staff ? '/admin/sign-in' : '/account/sign-in'} className="btn btn--secondary">
          Back to sign in
        </Link>
      </div>
    );
  }

  const id = (n: string) => `${uid}-${n}`;
  return (
    <form ref={ref} className={styles.form} onSubmit={onSubmit} noValidate>
      {mode === 'register' && (
        <div className={styles.field}>
          <label htmlFor={id('name')}>Full name</label>
          <input id={id('name')} name="name" autoComplete="name" required minLength={2} maxLength={80} />
        </div>
      )}
      {mode !== 'reset' && (
        <div className={styles.field}>
          <label htmlFor={id('email')}>Email</label>
          <input id={id('email')} name="email" type="email" autoComplete="email" required />
        </div>
      )}
      {mode !== 'forgot' && (
        <div className={styles.field}>
          <label htmlFor={id('password')}>{mode === 'reset' ? 'New password' : 'Password'}</label>
          <input id={id('password')} name="password" type="password" autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} required minLength={mode === 'sign-in' ? 1 : 10} maxLength={128} aria-describedby={mode !== 'sign-in' ? id('pw-hint') : undefined} />
          {mode !== 'sign-in' && (
            <p id={id('pw-hint')} className={styles.hint}>
              At least 10 characters.
            </p>
          )}
        </div>
      )}
      {(mode === 'register' || mode === 'reset') && (
        <div className={styles.field}>
          <label htmlFor={id('confirm')}>Confirm password</label>
          <input id={id('confirm')} name="confirm" type="password" autoComplete="new-password" required />
        </div>
      )}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
        {busy ? COPY[mode].busy : COPY[mode].submit}
      </button>
    </form>
  );
}
