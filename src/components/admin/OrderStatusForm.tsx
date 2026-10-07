'use client';

import { useActionState, useState } from 'react';
import { changeOrderStatus, type ActionState } from '@/app/admin/actions';
import { STATUS_LABELS, type OrderStatus } from '@/lib/commerce/order-state';
import styles from '@/app/admin/admin.module.css';

export function OrderStatusForm({ orderId, next }: { orderId: string; next: OrderStatus[] }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(changeOrderStatus.bind(null, orderId), { ok: false });
  const [to, setTo] = useState<OrderStatus | ''>(next[0] ?? '');
  if (!next.length) return <p className={styles.muted}>No further status changes are possible for this order.</p>;
  const consequential = to === 'cancelled' || to === 'refunded';
  return (
    <form action={action} className={styles.stack}>
      <label>
        Move to
        <select name="to" value={to} onChange={(e) => setTo(e.target.value as OrderStatus)}>
          {next.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </label>
      <label>
        Note (shown in the order history)
        <input name="note" maxLength={500} placeholder={to === 'shipped' ? 'e.g. courier and tracking number' : ''} />
      </label>
      {to === 'refunded' && <p className={styles.note}>Issue the refund in the Razorpay dashboard first — this only records it.</p>}
      {consequential && (
        <label className={styles.checkLabel}>
          <input type="checkbox" name="confirm" /> I understand this can’t be undone
        </label>
      )}
      <button type="submit" className="btn btn--primary" disabled={pending}>
        Update status
      </button>
      {state.message && (
        <p role={state.ok ? 'status' : 'alert'} className={state.ok ? styles.good : styles.err}>
          {state.message}
        </p>
      )}
    </form>
  );
}
