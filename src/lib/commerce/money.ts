/** Money helpers. Amounts are integer paise everywhere; formatting is display-only. */
export const PRICE_PLACEHOLDER = '₹XXXX';

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2, minimumFractionDigits: 0 });

export function formatPaise(paise: number) {
  if (!Number.isSafeInteger(paise)) throw new RangeError('Amount must be an integer number of paise');
  return inr.format(paise / 100);
}

export function displayPrice(paise: number | null, approved: boolean) {
  return approved && paise !== null ? formatPaise(paise) : PRICE_PLACEHOLDER;
}
