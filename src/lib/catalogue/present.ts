import type { CatalogueProduct } from './types';

/**
 * Presentation helpers for the editorial product language (cards, quick view,
 * product page). They only reformat stored fields — nothing is invented.
 */

/** "Nº 01" from the internal reference (MFB-P-001 → Nº 01); null if it has no number. */
export function pieceNumber(product: Pick<CatalogueProduct, 'reference'>): string | null {
  const digits = /(\d+)\s*$/.exec(product.reference)?.[1];
  return digits ? `Nº ${String(Number(digits)).padStart(2, '0')}` : null;
}

/** Position label within a list, e.g. "Piece 02 of 03". */
export function pieceIndex(index: number, total: number) {
  return { n: String(index + 1).padStart(2, '0'), total: String(total).padStart(2, '0') };
}
