import 'server-only';
import { newArrivals, populatedCategories } from '@/lib/catalogue/discovery';
import type { NavData } from '@/components/Header';
import { EMPTY_CART, type CartView } from './commerce/cart-repo';
import { currentUser } from './auth';
import { readCartView } from './cart-session';
import { getCatalogue } from './catalogue';

/**
 * Data every storefront page needs (navigation categories, cart, sign-in
 * state). Failures degrade to an empty shell so a database outage never
 * takes down the whole layout; pages render their own error states.
 */
export async function loadShell(): Promise<{ nav: NavData; cart: CartView; signedIn: boolean }> {
  const empty: NavData = { styles: [], occasions: [], hasArrivals: false };
  const [catalogue, cart, user] = await Promise.all([
    getCatalogue().catch(() => null),
    readCartView().catch(() => EMPTY_CART),
    currentUser().catch(() => null),
  ]);
  const nav = catalogue
    ? {
        styles: populatedCategories(catalogue.products, catalogue.terms, 'style').map((c) => ({ slug: c.term.slug, label: c.term.label })),
        occasions: populatedCategories(catalogue.products, catalogue.terms, 'occasion').map((c) => ({ slug: c.term.slug, label: c.term.label })),
        hasArrivals: newArrivals(catalogue.products).length > 0,
      }
    : empty;
  return { nav, cart, signedIn: Boolean(user) };
}
