import type { Metadata } from 'next';
import Form from 'next/form';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { PageShell } from '@/components/PageShell';
import { Listing } from '@/components/shop/Listing';
import { parseShopQuery, populatedCategories } from '@/lib/catalogue/discovery';
import { buildListing } from '@/lib/catalogue/listing';
import { getCatalogue } from '@/server/catalogue';
import styles from './search.module.css';

export const metadata: Metadata = { title: 'Search', robots: { index: false, follow: true } };

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = parseShopQuery(await searchParams);
  const { products, terms } = await getCatalogue();
  const data = buildListing(products, terms, query);
  const categories = [...populatedCategories(products, terms, 'style'), ...populatedCategories(products, terms, 'occasion')];
  const missingTerms = data.items.length === 0 ? data.matchedTerms.filter((t) => !categories.some((c) => c.term.id === t.id)) : [];

  return (
    <PageShell>
      <PageHeader compact eyebrow="Search" title={query.q ? `Results for “${query.q}”` : 'Search'}>
        <Form action="/search" className={styles.form} role="search">
          <label htmlFor="search-page-input" className="visually-hidden">
            Search bags
          </label>
          <input id="search-page-input" name="q" type="search" defaultValue={query.q} placeholder="Try “office bag”, “crossbody” or “party”" maxLength={80} autoComplete="off" enterKeyHint="search" />
          <button type="submit" className="btn btn--primary">
            Search
          </button>
        </Form>
      </PageHeader>

      {query.q ? (
        <Listing
          data={data}
          query={query}
          basePath="/search"
          hidden={{ q: query.q }}
          emptyTitle={missingTerms.length ? `We don’t have ${missingTerms.map((t) => t.label.toLowerCase()).join(' or ')} at the moment.` : 'We couldn’t find a match.'}
        />
      ) : (
        <div className={`container ${styles.suggest}`}>
          {categories.length > 0 && (
            <>
              <h2 className={styles.suggestTitle}>Browse by</h2>
              <ul className={styles.links}>
                {categories.map((c) => (
                  <li key={c.term.id}>
                    <Link href={`/shop/${c.term.slug}`} className="text-link">
                      {c.term.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
          <Link href="/shop" className="btn btn--secondary">
            Browse all bags
          </Link>
        </div>
      )}
    </PageShell>
  );
}
