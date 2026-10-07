'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { CartLines } from './CartLines';
import { useCart } from './CartProvider';
import { checkoutSchema, fieldErrors } from '@/lib/commerce/checkout-schema';
import { formatPaise } from '@/lib/commerce/money';
import styles from './Checkout.module.css';

interface SavedAddress {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
}

interface StartResponse {
  ok: boolean;
  orderNumber?: string;
  accessToken?: string;
  payment?: { keyId: string; orderId: string; amount: number; currency: string; name: string; description: string; prefill: Record<string, string> };
  code?: string;
  message?: string;
  errors?: Record<string, string>;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void; on: (event: string, cb: (r: unknown) => void) => void };
  }
}

function loadRazorpay(): Promise<boolean> {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.async = true;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

const newKey = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`);

/**
 * Checkout: contact, delivery, summary, payment — one page. The browser
 * never sends a price; the server returns the amount it calculated and the
 * payment provider handles card/UPI details.
 */
export function CheckoutForm({
  states,
  shippingFee,
  shippingFeePaise,
  user,
  addresses,
}: {
  states: string[];
  shippingFee: string;
  shippingFeePaise: number;
  user: { email: string; name: string } | null;
  addresses: SavedAddress[];
}) {
  const { cart } = useCart();
  const router = useRouter();
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<{ state: 'idle' | 'starting' | 'paying' | 'verifying' | 'error'; message?: string }>({ state: 'idle' });
  const [key, setKey] = useState('');
  const [started, setStarted] = useState<StartResponse | null>(null);
  const [preset, setPreset] = useState<SavedAddress | null>(addresses[0] ?? null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the idempotency key must be generated in the browser
    setKey(newKey());
  }, []);

  const id = (n: string) => `${uid}-${n}`;
  const invalid = (n: string) => (errors[n] ? { 'aria-invalid': true as const, 'aria-describedby': id(`${n}-err`) } : {});
  const busy = status.state === 'starting' || status.state === 'verifying';

  function readForm() {
    const fd = new FormData(formRef.current!);
    const get = (k: string) => String(fd.get(k) ?? '');
    return {
      email: get('email'),
      address: { fullName: get('fullName'), phone: get('phone'), line1: get('line1'), line2: get('line2'), city: get('city'), state: get('state'), postalCode: get('postalCode') },
      saveAddress: fd.get('saveAddress') === 'on',
      acceptTerms: fd.get('acceptTerms') === 'on',
      idempotencyKey: key,
    };
  }

  async function pay(start: StartResponse) {
    const ok = await loadRazorpay();
    if (!ok || !window.Razorpay || !start.payment) {
      setStatus({ state: 'error', message: 'The payment window couldn’t load. Check your connection and try again — nothing has been charged.' });
      return;
    }
    setStatus({ state: 'paying' });
    const rzp = new window.Razorpay({
      key: start.payment.keyId,
      order_id: start.payment.orderId,
      amount: start.payment.amount,
      currency: start.payment.currency,
      name: start.payment.name,
      description: start.payment.description,
      prefill: start.payment.prefill,
      theme: { color: '#241a15' },
      handler: async (resp: Record<string, string>) => {
        setStatus({ state: 'verifying' });
        try {
          const res = await fetch('/api/checkout/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ razorpay_order_id: resp.razorpay_order_id, razorpay_payment_id: resp.razorpay_payment_id, razorpay_signature: resp.razorpay_signature }),
          });
          const data = (await res.json()) as { ok?: boolean; status?: string };
          router.push(`/orders/${start.orderNumber}?t=${encodeURIComponent(start.accessToken ?? '')}${data.ok ? '' : '&check=1'}`);
        } catch {
          router.push(`/orders/${start.orderNumber}?t=${encodeURIComponent(start.accessToken ?? '')}&check=1`);
        }
      },
      modal: {
        ondismiss: () => setStatus({ state: 'idle', message: 'Payment wasn’t completed. Your order is held for 30 minutes — you can try again.' }),
      },
    });
    rzp.on('payment.failed', () => setStatus({ state: 'idle', message: 'The payment didn’t go through. Nothing was charged — please try again or use another method.' }));
    rzp.open();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (started?.ok) return pay(started);
    const payload = readForm();
    const check = checkoutSchema.safeParse(payload);
    if (!check.success) {
      setErrors(fieldErrors(check.error));
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    setErrors({});
    setStatus({ state: 'starting' });
    try {
      const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = (await res.json().catch(() => ({ ok: false }))) as StartResponse;
      if (!res.ok || !data.ok) {
        if (data.errors) setErrors(data.errors);
        setStatus({ state: 'error', message: data.message ?? (data.code === 'checkout_closed' ? 'Online checkout has just closed. Please refresh the page.' : 'We couldn’t start checkout. Please review your details and try again.') });
        if (data.code === 'duplicate') setKey(newKey());
        return;
      }
      setStarted(data);
      await pay(data);
    } catch {
      setStatus({ state: 'error', message: 'You appear to be offline. Nothing has been charged — please try again.' });
    }
  }

  if (!cart.lines.length) {
    return (
      <div className={`container ${styles.closed}`}>
        <p className={`${styles.closedTitle} display`}>Your cart is empty.</p>
        <Link href="/shop" className="btn btn--primary">
          Continue shopping
        </Link>
      </div>
    );
  }

  const total = cart.subtotalPaise + shippingFeePaise;
  const field = (name: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div className={styles.field}>
      <label htmlFor={id(name)}>{label}</label>
      <input id={id(name)} name={name} {...props} {...invalid(name.startsWith('email') ? 'email' : `address.${name}`)} />
      {(errors[`address.${name}`] || (name === 'email' && errors.email)) && (
        <p id={id(`${name === 'email' ? 'email' : `address.${name}`}-err`)} className={styles.err}>
          {errors[`address.${name}`] ?? errors.email}
        </p>
      )}
    </div>
  );

  return (
    <form
      ref={formRef}
      className={`container ${styles.layout}`}
      onSubmit={onSubmit}
      onChange={(e) => {
        // Clear a field's error as soon as the customer edits it.
        const name = (e.target as unknown as HTMLInputElement).name;
        const key = name === 'email' || name === 'acceptTerms' ? name : `address.${name}`;
        if (errors[key]) {
          setErrors((prev) => {
            const next = { ...prev };
            delete next[key];
            return next;
          });
        }
      }}
      noValidate
      aria-describedby={status.message ? id('status') : undefined}
    >
      <div className={styles.steps}>
        <fieldset className={styles.section} disabled={Boolean(started?.ok)}>
          <legend>1 · Contact</legend>
          {field('email', 'Email', { type: 'email', autoComplete: 'email', defaultValue: user?.email ?? '', required: true })}
          {!user && (
            <p className={styles.note}>
              Checking out as a guest. <Link href="/account/sign-in?next=/checkout" className="text-link">Sign in</Link> to use saved addresses.
            </p>
          )}
        </fieldset>

        <fieldset className={styles.section} disabled={Boolean(started?.ok)}>
          <legend>2 · Delivery</legend>
          {addresses.length > 0 && (
            <div className={styles.field}>
              <label htmlFor={id('saved')}>Saved addresses</label>
              <select id={id('saved')} onChange={(e) => setPreset(addresses.find((a) => a.id === e.target.value) ?? null)} defaultValue={preset?.id ?? ''}>
                {addresses.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.fullName}, {a.line1}, {a.city}
                  </option>
                ))}
                <option value="">Use a new address</option>
              </select>
            </div>
          )}
          <div key={preset?.id ?? 'new'} className={styles.grid2}>
            {field('fullName', 'Full name', { autoComplete: 'name', defaultValue: preset?.fullName ?? user?.name ?? '', required: true })}
            {field('phone', 'Mobile number', { type: 'tel', autoComplete: 'tel', inputMode: 'tel', defaultValue: preset?.phone ?? '', required: true })}
            {field('line1', 'Address', { autoComplete: 'address-line1', defaultValue: preset?.line1 ?? '', required: true })}
            {field('line2', 'Apartment, landmark (optional)', { autoComplete: 'address-line2', defaultValue: preset?.line2 ?? '' })}
            {field('city', 'City', { autoComplete: 'address-level2', defaultValue: preset?.city ?? '', required: true })}
            <div className={styles.field}>
              <label htmlFor={id('state')}>State / union territory</label>
              <select id={id('state')} name="state" autoComplete="address-level1" defaultValue={preset?.state ?? ''} required {...invalid('address.state')}>
                <option value="" disabled>
                  Choose…
                </option>
                {states.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors['address.state'] && (
                <p id={id('address.state-err')} className={styles.err}>
                  {errors['address.state']}
                </p>
              )}
            </div>
            {field('postalCode', 'PIN code', { autoComplete: 'postal-code', inputMode: 'numeric', maxLength: 6, defaultValue: preset?.postalCode ?? '', required: true })}
          </div>
          {user && (
            <label className={styles.check}>
              <input type="checkbox" name="saveAddress" /> Save this address to my account
            </label>
          )}
        </fieldset>
      </div>

      <aside className={styles.summary} aria-labelledby={id('summary')}>
        <h2 id={id('summary')} className={styles.summaryTitle}>
          3 · Order summary
        </h2>
        <CartLines compact readOnly />
        <Link href="/cart" className="text-link">
          Edit cart
        </Link>
        <p className={styles.row}>
          <span>Subtotal</span>
          <span>{cart.subtotal}</span>
        </p>
        <p className={styles.row}>
          <span>Delivery</span>
          <span>{shippingFee}</span>
        </p>
        <p className={`${styles.row} ${styles.total}`}>
          <span>Total</span>
          <span>{formatPaise(total)}</span>
        </p>
        <p className={styles.note}>Prices include taxes. The final amount is confirmed by our server before payment.</p>

        <h2 className={styles.summaryTitle}>4 · Payment</h2>
        <label className={styles.check}>
          <input type="checkbox" name="acceptTerms" {...invalid('acceptTerms')} disabled={Boolean(started?.ok)} />
          <span>
            I accept the{' '}
            <Link href="/client-services/terms" className="text-link" target="_blank">
              terms
            </Link>
            ,{' '}
            <Link href="/client-services/returns" className="text-link" target="_blank">
              returns
            </Link>{' '}
            and{' '}
            <Link href="/client-services/privacy" className="text-link" target="_blank">
              privacy
            </Link>{' '}
            policies.
          </span>
        </label>
        {errors.acceptTerms && (
          <p id={id('acceptTerms-err')} className={styles.err}>
            {errors.acceptTerms}
          </p>
        )}
        {status.message && (
          <p id={id('status')} className={status.state === 'error' ? styles.errorBox : styles.infoBox} role={status.state === 'error' ? 'alert' : 'status'}>
            {status.message}
          </p>
        )}
        <button type="submit" className="btn btn--primary btn--block" disabled={busy || !cart.checkoutable || !key}>
          {status.state === 'starting' ? 'Preparing payment…' : status.state === 'verifying' ? 'Confirming payment…' : started?.ok ? 'Try payment again' : `Pay ${formatPaise(total)}`}
        </button>
        <p className={styles.note}>Payments are processed securely by Razorpay. Card and UPI details never reach this website.</p>
      </aside>
    </form>
  );
}
