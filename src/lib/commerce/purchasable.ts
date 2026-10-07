/**
 * Single rule for "can this be bought online right now?", used by the PDP,
 * the cart and — authoritatively — the checkout transaction on the server.
 */
import type { Availability } from '../catalogue/types';

export interface PurchasableInput {
  status: string;
  pricePaise: number | null;
  priceStatus: string;
  availability: Availability | string;
  trackInventory: boolean;
  stock: number | null;
}

export type PurchaseBlocker = 'unpublished' | 'price-pending' | 'availability-unconfirmed' | 'out-of-stock';

export function purchaseBlocker(p: PurchasableInput, quantity = 1): PurchaseBlocker | null {
  if (p.status !== 'published') return 'unpublished';
  if (p.priceStatus !== 'approved' || p.pricePaise === null || p.pricePaise <= 0) return 'price-pending';
  if (p.availability === 'unconfirmed') return 'availability-unconfirmed';
  if (p.availability === 'out_of_stock') return 'out-of-stock';
  if (p.trackInventory && (p.stock ?? 0) < quantity) return 'out-of-stock';
  return null;
}

export const BLOCKER_COPY: Record<PurchaseBlocker, string> = {
  unpublished: 'This piece is no longer available.',
  'price-pending': 'Online purchase opens once the price is confirmed. Enquire and the house will reply.',
  'availability-unconfirmed': 'Online purchase opens once availability is confirmed. Enquire and the house will reply.',
  'out-of-stock': 'Currently unavailable.',
};

export const MAX_QUANTITY = 10;
