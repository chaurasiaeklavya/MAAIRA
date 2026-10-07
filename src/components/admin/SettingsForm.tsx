'use client';

import { useActionState } from 'react';
import { updateSettings, type ActionState } from '@/app/admin/actions';
import styles from '@/app/admin/admin.module.css';

export function SettingsForm({ initial }: { initial: { checkoutEnabled: boolean; shippingFee: string; taxInclusive: boolean; policiesApproved: boolean } }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateSettings, { ok: false });
  return (
    <form action={action} className={styles.stack}>
      <label>
        Delivery charge per order (₹)
        <input name="shippingFee" defaultValue={initial.shippingFee} inputMode="decimal" placeholder="Leave empty until confirmed; 0 = free delivery" />
        {state.errors?.shippingFee && <span className={styles.err}>{state.errors.shippingFee}</span>}
      </label>
      <label className={styles.checkLabel}>
        <input type="checkbox" name="taxInclusive" defaultChecked={initial.taxInclusive} /> Displayed prices include GST (confirmed by the business)
      </label>
      <label className={styles.checkLabel}>
        <input type="checkbox" name="policiesApproved" defaultChecked={initial.policiesApproved} /> Shipping, returns, cancellation, privacy and terms text is approved and published
      </label>
      <label className={styles.checkLabel}>
        <input type="checkbox" name="checkoutEnabled" defaultChecked={initial.checkoutEnabled} /> Open online checkout to customers
      </label>
      <button type="submit" className="btn btn--primary" disabled={pending}>
        Save settings
      </button>
      {state.message && (
        <p role="status" className={state.ok ? styles.good : styles.err}>
          {state.message}
        </p>
      )}
    </form>
  );
}
