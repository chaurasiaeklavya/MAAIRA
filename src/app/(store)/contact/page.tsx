import type { Metadata } from 'next';
import styles from './contact.module.css';
import { ContactChannels } from '@/components/contact/ContactChannels';
import { EnquiryForm } from '@/components/forms/EnquiryForm';
import { PageHeader } from '@/components/PageHeader';
import { PageShell } from '@/components/PageShell';
import { getCatalogue } from '@/server/catalogue';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Send an enquiry or request a callback from MAAIRA FASHION BAGS.',
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; piece?: string; order?: string; message?: string }>;
}) {
  const { mode, piece, message } = await searchParams;
  const { products } = await getCatalogue();
  const product = products.find((p) => p.slug === piece);
  return (
    <PageShell>
      <PageHeader
        eyebrow="Contact"
        title="Enquiries, *personally.*"
        lede="Ask about a piece, its price or availability — or ask the house to call you back."
      />
      <div className={`container ${styles.grid}`}>
        <aside className={styles.channels} aria-label="Contact details">
          <ContactChannels />
        </aside>
        <section className={styles.form} aria-labelledby="contact-form-title">
          <h2 id="contact-form-title" className="visually-hidden">
            Enquiry form
          </h2>
          <EnquiryForm
            pieces={products.map((p) => ({ slug: p.slug, name: p.name }))}
            initialMode={mode === 'callback' ? 'callback' : 'enquiry'}
            defaultPieceId={product?.slug}
            defaultMessage={typeof message === 'string' ? message.slice(0, 1500) : undefined}
            headingId="contact-form-title"
          />
        </section>
      </div>
    </PageShell>
  );
}
