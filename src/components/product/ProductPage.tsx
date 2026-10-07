'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { rememberViewed } from '../commerce/WishlistProvider';
import { EnquiryForm, type PieceOption } from '../forms/EnquiryForm';
import { GalleryControls, GalleryPhoto } from '../gallery/Gallery';
import { useGallery } from '../gallery/useGallery';
import { SharedFrame } from '../PageShell';
import { Stage } from '../showcase/Stage';
import { ProductCard } from './ProductCard';
import { PurchasePanel } from './PurchasePanel';
import { RecentlyViewed } from './RecentlyViewed';
import { occasionsOf, stylesOf, type CatalogueProduct } from '@/lib/catalogue/types';
import type { PurchaseBlocker } from '@/lib/commerce/purchasable';
import { brand } from '@/data/brand';
import styles from './ProductPage.module.css';

const AVAILABILITY: Record<string, string | null> = {
  in_stock: 'In stock',
  made_to_order: 'Made to order',
  out_of_stock: 'Currently unavailable',
  unconfirmed: null,
};

export function ProductPage({
  product,
  related,
  more,
  pieces,
  blocker,
  maxQuantity,
  policiesApproved,
}: {
  product: CatalogueProduct;
  /** Pieces sharing real attributes ("You may also like"). */
  related: CatalogueProduct[];
  /** Other pieces in featured order, shown only when nothing is related. */
  more: CatalogueProduct[];
  pieces: PieceOption[];
  blocker: PurchaseBlocker | null;
  maxQuantity: number;
  policiesApproved: boolean;
}) {
  const gallery = useGallery(product.images.length);
  const style = stylesOf(product)[0];
  const terms = [...stylesOf(product), ...occasionsOf(product)];
  const availability = AVAILABILITY[product.availability];
  useEffect(() => rememberViewed(product.id), [product.id]);

  const details: [string, string][] = [
    ['Reference', product.sku ?? product.reference],
    ...(product.colour ? ([['Colour', product.colour]] as [string, string][]) : []),
    ...(product.material ? ([['Material', product.material]] as [string, string][]) : []),
    ...(product.dimensions ? ([['Dimensions', product.dimensions]] as [string, string][]) : []),
  ];

  return (
    <article className={styles.page} aria-labelledby="product-title">
      <div className={`container ${styles.top}`}>
        <nav aria-label="Breadcrumb" className={styles.crumbs}>
          <ol>
            <li>
              <Link href="/shop">Shop</Link>
            </li>
            {style && (
              <li>
                <Link href={`/shop/${style.slug}`}>{style.label}</Link>
              </li>
            )}
            <li>
              <span aria-current="page">{product.name}</span>
            </li>
          </ol>
        </nav>

        <section className={styles.galleryCol} aria-label={`${product.name}: photographs`}>
          <div className={styles.stageBox}>
            <Stage preset={product.stage} className={styles.stage} />
            <div className={styles.frameWrap}>
              <SharedFrame name={`piece-${product.slug}`}>
                <div
                  className={styles.frame}
                  tabIndex={product.images.length > 1 ? 0 : -1}
                  role="group"
                  aria-roledescription="carousel"
                  aria-label={`${product.name}: ${product.images.length} photographs. Use the left and right arrow keys to change view.`}
                  onKeyDown={gallery.onKeyDown}
                >
                  {product.images.length ? (
                    <GalleryPhoto images={product.images} gallery={gallery} sizes="(max-width: 900px) 92vw, 52vw" priority idPrefix={product.slug} />
                  ) : (
                    <p className={styles.noImage}>Photographs coming soon</p>
                  )}
                </div>
              </SharedFrame>
            </div>
          </div>
          <GalleryControls images={product.images} gallery={gallery} />
        </section>

        <div className={styles.info}>
          <h1 id="product-title" className={`${styles.title} display`}>
            {product.name}
          </h1>
          <p className={styles.price}>
            {product.price.display}
            {!product.price.approved && <span className={styles.priceNote}>Price to be confirmed</span>}
          </p>
          {availability && <p className={styles.availability}>{availability}</p>}
          {product.summary && <p className={styles.summary}>{product.summary}</p>}

          <PurchasePanel
            productId={product.id}
            name={product.name}
            price={product.price.display}
            purchasable={product.purchasable}
            blocker={blocker}
            maxQuantity={maxQuantity}
          />

          <div className={styles.accordions}>
            <details open>
              <summary>Product details</summary>
              <div className={styles.panel}>
                {product.description && <p>{product.description}</p>}
                {product.features.length > 0 && (
                  <ul className={styles.features}>
                    {product.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                )}
                <dl className={styles.details}>
                  {details.map(([k, v]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
                {terms.length > 0 && (
                  <p className={styles.terms}>
                    Find similar:{' '}
                    {terms.map((t, i) => (
                      <span key={t.id}>
                        {i > 0 && ' · '}
                        <Link href={`/shop/${t.slug}`} className="text-link">
                          {t.label}
                        </Link>
                      </span>
                    ))}
                  </p>
                )}
              </div>
            </details>
            <details>
              <summary>Delivery &amp; returns</summary>
              <div className={styles.panel}>
                {policiesApproved ? (
                  <p>
                    See our <Link href="/client-services/shipping" className="text-link">delivery</Link> and{' '}
                    <Link href="/client-services/returns" className="text-link">returns</Link> policies.
                  </p>
                ) : (
                  <p>
                    Delivery, returns and cancellation terms are being finalised and will be confirmed before online ordering opens.{' '}
                    <Link href="/contact" className="text-link">Ask the house</Link> anytime.
                  </p>
                )}
              </div>
            </details>
            <details>
              <summary>Help &amp; contact</summary>
              <div className={styles.panel}>
                <ul className={styles.help}>
                  <li>
                    Call <a href={brand.contact.phoneHref} className="text-link">{brand.contact.phoneDisplay}</a>
                  </li>
                  <li>
                    Email <a href={`mailto:${brand.contact.email}`} className="text-link">{brand.contact.email}</a>
                  </li>
                  <li>
                    <Link href={`/contact?mode=callback&piece=${product.slug}`} className="text-link">Request a call back</Link>
                  </li>
                </ul>
              </div>
            </details>
          </div>
        </div>
      </div>

      <section id="enquire" className={`container ${styles.enquire}`} aria-labelledby="enquire-title">
        <div className={styles.enquireIntro}>
          <h2 id="enquire-title" className={`${styles.sectionTitle} display`}>
            Ask about {product.name}
          </h2>
          <p>Availability, pricing or details — the piece is already selected for you.</p>
        </div>
        <EnquiryForm pieces={pieces} defaultPieceId={product.slug} headingId="enquire-title" allowModeSwitch />
      </section>

      {(related.length > 0 || more.length > 0) && (
        <section className={`container ${styles.more}`} aria-labelledby="more-title">
          <h2 id="more-title" className={`${styles.sectionTitle} display`}>
            {related.length ? 'You may also like' : 'More from MAAIRA'}
          </h2>
          <ul className={styles.moreGrid}>
            {(related.length ? related : more).slice(0, 4).map((p) => (
              <li key={p.id}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <RecentlyViewed excludeId={product.id} />
    </article>
  );
}
