import type { Metadata } from 'next';
import { and, desc, eq } from 'drizzle-orm';
import { getDb } from '@/db';
import * as s from '@/db/schema';
import { PageHeader } from '@/components/PageHeader';
import { PageShell } from '@/components/PageShell';
import { CheckoutForm } from '@/components/commerce/CheckoutForm';
import { CheckoutClosed } from '@/components/commerce/CheckoutClosed';
import { formatPaise } from '@/lib/commerce/money';
import { INDIAN_STATES } from '@/lib/commerce/checkout-schema';
import { currentUser } from '@/server/auth';
import { getReadiness } from '@/server/checkout-service';

export const metadata: Metadata = { title: 'Checkout', robots: { index: false, follow: false } };

export default async function CheckoutPage() {
  const { settings, readiness } = await getReadiness();
  if (!readiness.ready) {
    return (
      <PageShell>
        <PageHeader eyebrow="Checkout" title="Complete your *order*" />
        <CheckoutClosed />
      </PageShell>
    );
  }
  const user = await currentUser();
  const addresses = user
    ? await getDb().select().from(s.addresses).where(and(eq(s.addresses.userId, user.id))).orderBy(desc(s.addresses.isDefault), desc(s.addresses.createdAt)).limit(5)
    : [];
  return (
    <PageShell>
      <PageHeader eyebrow="Checkout" title="Complete your *order*" />
      <CheckoutForm
        states={[...INDIAN_STATES]}
        shippingFee={formatPaise(settings.shippingFlatPaise ?? 0)}
        shippingFeePaise={settings.shippingFlatPaise ?? 0}
        user={user ? { email: user.email, name: user.name } : null}
        addresses={addresses.map((a) => ({ id: a.id, fullName: a.fullName, phone: a.phone, line1: a.line1, line2: a.line2 ?? '', city: a.city, state: a.state, postalCode: a.postalCode }))}
      />
    </PageShell>
  );
}
