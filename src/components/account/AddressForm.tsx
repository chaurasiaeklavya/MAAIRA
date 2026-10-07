'use client';

import { useActionState, useId } from 'react';
import { addAddress, type AddressState } from '@/app/(store)/account/addresses/actions';
import styles from './Account.module.css';

export function AddressForm({ states }: { states: string[] }) {
  const [state, action, pending] = useActionState<AddressState, FormData>(addAddress, { ok: false });
  const uid = useId();
  const f = (name: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div className={styles.field}>
      <label htmlFor={`${uid}-${name}`}>{label}</label>
      <input id={`${uid}-${name}`} name={name} aria-invalid={state.errors?.[name] ? true : undefined} aria-describedby={state.errors?.[name] ? `${uid}-${name}-e` : undefined} {...props} />
      {state.errors?.[name] && (
        <p id={`${uid}-${name}-e`} className={styles.hint} style={{ color: '#b4553f' }}>
          {state.errors[name]}
        </p>
      )}
    </div>
  );
  return (
    <form action={action} className={styles.form} key={state.ok ? state.message : 'form'}>
      {f('fullName', 'Full name', { autoComplete: 'name', required: true })}
      {f('phone', 'Mobile number', { type: 'tel', autoComplete: 'tel', required: true })}
      {f('line1', 'Address', { autoComplete: 'address-line1', required: true })}
      {f('line2', 'Apartment, landmark (optional)', { autoComplete: 'address-line2' })}
      {f('city', 'City', { autoComplete: 'address-level2', required: true })}
      <div className={styles.field}>
        <label htmlFor={`${uid}-state`}>State / union territory</label>
        <select id={`${uid}-state`} name="state" defaultValue="" required>
          <option value="" disabled>
            Choose…
          </option>
          {states.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      {f('postalCode', 'PIN code', { inputMode: 'numeric', maxLength: 6, autoComplete: 'postal-code', required: true })}
      {state.message && (
        <p role="status" className={state.ok ? styles.hint : styles.error}>
          {state.message}
        </p>
      )}
      <button type="submit" className="btn btn--primary" disabled={pending}>
        {pending ? 'Saving…' : 'Save address'}
      </button>
    </form>
  );
}
