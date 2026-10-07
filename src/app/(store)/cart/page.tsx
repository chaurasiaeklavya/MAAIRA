import type { Metadata } from 'next';
import { PageHeader } from '@/components/PageHeader';
import { PageShell } from '@/components/PageShell';
import { CartPageView } from '@/components/commerce/CartPageView';
import { getReadiness } from '@/server/checkout-service';

export const metadata: Metadata = { title: 'Your cart', robots: { index: false, follow: false } };

export default async function CartPage() {
  const { readiness } = await getReadiness().catch(() => ({ readiness: { ready: false, blockers: [] } }));
  return (
    <PageShell>
      <PageHeader compact eyebrow="Cart" title="Your cart" />
      <CartPageView checkoutOpen={readiness.ready} />
    </PageShell>
  );
}
