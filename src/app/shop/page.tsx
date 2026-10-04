import type { Metadata } from 'next';
import { PageHeader } from '@/components/PageHeader';
import { PageShell } from '@/components/PageShell';
import { ShopView } from '@/components/shop/ShopView';

export const metadata: Metadata = {
  title: 'Shop',
  description: 'A preview selection of pieces from MAAIRA FASHION BAGS. Prices to be confirmed.',
};

export default function ShopPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Shop"
        title="The *pieces*"
        lede="A preview selection from the house. Open a piece for every photographed view, or enquire directly — prices are shown as ₹XXXX until confirmed."
      />
      <ShopView />
    </PageShell>
  );
}
