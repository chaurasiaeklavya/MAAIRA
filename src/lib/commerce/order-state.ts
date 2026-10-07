/**
 * Order state machine. Every status change — by the payment provider, a
 * customer or staff — goes through `canTransition`, so an order can't jump
 * from "pending payment" to "shipped" or be "paid" twice.
 */
export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'payment_failed'
  | 'refunded';

export type Actor = 'system' | 'customer' | 'staff' | 'provider';

const TRANSITIONS: Record<OrderStatus, Partial<Record<OrderStatus, Actor[]>>> = {
  pending_payment: { paid: ['provider'], payment_failed: ['provider'], cancelled: ['system', 'staff', 'customer'] },
  payment_failed: { paid: ['provider'], cancelled: ['system', 'staff', 'customer'] },
  paid: { processing: ['staff'], cancelled: ['staff'], refunded: ['staff'] },
  processing: { shipped: ['staff'], cancelled: ['staff'] },
  shipped: { delivered: ['staff'] },
  delivered: { refunded: ['staff'] },
  cancelled: {},
  refunded: {},
};

export function canTransition(from: OrderStatus, to: OrderStatus, actor: Actor) {
  return TRANSITIONS[from]?.[to]?.includes(actor) ?? false;
}

export function nextStatuses(from: OrderStatus, actor: Actor): OrderStatus[] {
  return (Object.entries(TRANSITIONS[from] ?? {}) as [OrderStatus, Actor[]][])
    .filter(([, actors]) => actors.includes(actor))
    .map(([to]) => to);
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: 'Awaiting payment',
  paid: 'Paid',
  processing: 'Being prepared',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  payment_failed: 'Payment failed',
  refunded: 'Refunded',
};

/** Statuses in which reserved stock is still held by the order. */
export const HOLDS_STOCK: OrderStatus[] = ['pending_payment', 'payment_failed', 'paid', 'processing', 'shipped', 'delivered'];
