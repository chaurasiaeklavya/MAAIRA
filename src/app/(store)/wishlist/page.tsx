import type { Metadata } from 'next';
import { PageHeader } from '@/components/PageHeader';
import { PageShell } from '@/components/PageShell';
import { WishlistView } from '@/components/commerce/WishlistView';

export const metadata: Metadata = { title: 'Wishlist', robots: { index: false, follow: false } };

export default function WishlistPage() {
  return (
    <PageShell>
      <PageHeader eyebrow="Wishlist" title="Saved *pieces*" />
      <WishlistView />
    </PageShell>
  );
}
