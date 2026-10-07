'use client';

import { useActionState } from 'react';
import { adjustStock, type ActionState } from '@/app/admin/actions';
import styles from '@/app/admin/admin.module.css';

export function StockForm({ productId }: { productId: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(adjustStock.bind(null, productId), { ok: false });
  return (
    <form action={action} className={styles.inline}>
      <label>
        Change by
        <input name="delta" type="number" step={1} required placeholder="e.g. 5 or -1" />
      </label>
      <label>
        Reason
        <input name="note" required maxLength={200} placeholder="e.g. stock received" />
      </label>
      <button type="submit" disabled={pending}>
        Adjust stock
      </button>
      {state.message && <span role="status" className={state.ok ? styles.good : styles.err}>{state.message}</span>}
    </form>
  );
}
