/**
 * Business rules that gate checkout. Each must be set deliberately by staff
 * (or the environment, for secrets) — none is assumed. Until every item is
 * satisfied, checkout stays closed and says exactly why.
 */
import { eq } from 'drizzle-orm';
import type { Database } from '../../db/connect';
import { storeSettings } from '../../db/schema';

export interface CommerceSettings {
  /** Staff switch: online checkout open to customers. */
  checkoutEnabled: boolean;
  /** Flat delivery fee in paise (0 only if the business confirms free delivery). NULL = not configured. */
  shippingFlatPaise: number | null;
  /** 'inclusive' = displayed prices include GST. NULL = not confirmed. */
  taxMode: 'inclusive' | null;
  /** Shipping, returns, cancellation, privacy and terms text approved by the business. */
  policiesApproved: boolean;
}

export const DEFAULT_SETTINGS: CommerceSettings = {
  checkoutEnabled: false,
  shippingFlatPaise: null,
  taxMode: null,
  policiesApproved: false,
};

export async function loadSettings(db: Database): Promise<CommerceSettings> {
  const rows = await db.select().from(storeSettings).where(eq(storeSettings.key, 'commerce'));
  const v = (rows[0]?.value ?? {}) as Partial<CommerceSettings>;
  return {
    checkoutEnabled: v.checkoutEnabled === true,
    shippingFlatPaise: Number.isSafeInteger(v.shippingFlatPaise) && (v.shippingFlatPaise as number) >= 0 ? (v.shippingFlatPaise as number) : null,
    taxMode: v.taxMode === 'inclusive' ? 'inclusive' : null,
    policiesApproved: v.policiesApproved === true,
  };
}

export async function saveSettings(db: Database, next: CommerceSettings, actorId: string) {
  await db
    .insert(storeSettings)
    .values({ key: 'commerce', value: next, updatedBy: actorId })
    .onConflictDoUpdate({ target: storeSettings.key, set: { value: next, updatedBy: actorId } });
}

export interface Readiness {
  ready: boolean;
  blockers: { key: string; label: string }[];
}

export function checkoutReadiness(settings: CommerceSettings, paymentsConfigured: boolean): Readiness {
  const blockers: Readiness['blockers'] = [];
  if (!paymentsConfigured) blockers.push({ key: 'payments', label: 'Payment provider credentials (Razorpay) are not configured.' });
  if (settings.shippingFlatPaise === null) blockers.push({ key: 'shipping', label: 'Delivery charge has not been confirmed.' });
  if (settings.taxMode === null) blockers.push({ key: 'tax', label: 'Tax treatment (prices inclusive of GST) has not been confirmed.' });
  if (!settings.policiesApproved) blockers.push({ key: 'policies', label: 'Shipping, returns, cancellation, privacy and terms are not approved.' });
  if (!settings.checkoutEnabled) blockers.push({ key: 'switch', label: 'Online checkout has not been switched on.' });
  return { ready: blockers.length === 0, blockers };
}
