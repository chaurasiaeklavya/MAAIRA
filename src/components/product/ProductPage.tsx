'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { useEffect } from 'react';
import { CloudImage } from '../CloudImage';
import { rememberViewed } from '../commerce/WishlistProvider';
import { useExperience } from '../ExperienceProvider';
import { EnquiryForm, type PieceOption } from '../forms/EnquiryForm';
import { GalleryControls, GalleryPhoto } from '../gallery/Gallery';
import { useGallery } from '../gallery/useGallery';
import { RevealText } from '../motion/RevealText';
import { SharedFrame } from '../PageShell';
import { Stage } from '../showcase/Stage';
import { ProductCard } from './ProductCard';
import { PurchasePanel } from './PurchasePanel';
import { RecentlyViewed } from './RecentlyViewed';
import styles from './ProductPage.module.css';
import { brand } from '@/data/brand';
import { pieceIndex, pieceNumber } from '@/lib/catalogue/present';
import { occasionsOf, stylesOf, type CatalogueProduct } from '@/lib/catalogue/types';
import type { PurchaseBlocker } from '@/lib/commerce/purchasable';

const EASE = [0.22, 1, 0.36, 1] as const;

const AVAILABILITY: Record<string, string | null> = {
  in_stock: 'In stock',
  made_to_order: 'Made to order',
  out_of_stock: 'Currently unavailable',
  unconfirmed: null,
};

export function ProductPage({
  product,
  sequence,
  related,
  more,
  pieces,
  blocker,
  maxQuantity,
  policiesApproved,
}: {
  product: CatalogueProduct;
  /** Every published piece in featured order (position, previous / next). */
  sequence: CatalogueProduct[];
  /** Pieces sharing real attributes ("You may also like"). */
  related: CatalogueProduct[];
  /** Other pieces in featured order, shown only when nothing is related. */
  more: CatalogueProduct[];
  pieces: PieceOption[];
  blocker: PurchaseBlocker | null;
  maxQuantity: number;
  policiesApproved: boolean;
}) {
  const { reducedMotion } = useExperience();
  const images = product.images;
  const gallery = useGallery(images.length);
  const index = Math.max(0, sequence.findIndex((p) => p.id === product.id));
  const prev = sequence.length > 1 ? sequence[(index - 1 + sequence.length) % sequence.length] : null;
  const next = sequence.length > 1 ? sequence[(index + 1) % sequence.length] : null;
  const { n, total } = pieceIndex(index, sequence.length);
  const style = stylesOf(product)[0];
  const terms = [...stylesOf(product), ...occasionsOf(product)];
  const availability = AVAILABILITY[product.availability];
  const others = related.length ? related : more;
  useEffect(() => rememberViewed(product.id), [product.id]);

  const rise = (delay: number) =>
    reducedMotion
      ? { initial: { opacity: 0 }, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.9, delay, ease: EASE },
        };

  const details: [string, string][] = [
    ['Reference', product.sku ?? pieceNumber(product) ?? product.reference],
    ...(product.colour ? ([['Colour', product.colour]] as [string, string][]) : []),
    ...(product.material ? ([['Material', product.material]] as [string, string][]) : []),
    ...(product.dimensions ? ([['Dimensions', product.dimensions]] as [string, string][]) : []),
    ...(images.length ? ([['Views', images.length === 1 ? '1 photograph' : `${images.length} photographs`]] as [string, string][]) : []),
  ];
  const unconfirmedDetails = !product.material || !product.dimensions;

  return (
    <article className={styles.page} aria-labelledby="product-title">
      <div className={`container ${styles.top}`}>
        <section className={styles.galleryCol} aria-label={`${product.name}: photographs`}>
          <div className={styles.stageBox}>
            <Stage preset={product.stage} className={styles.stage} />
            <div className={styles.frameWrap}>
              <SharedFrame name={`piece-${product.slug}`}>
                <div
                  className={styles.frame}
                  tabIndex={images.length > 1 ? 0 : -1}
                  role="group"
                  aria-roledescription="carousel"
                  aria-label={`${product.name}: ${images.length} photographs. Use the left and right arrow keys to change view.`}
                  onKeyDown={gallery.onKeyDown}
                >
                  {images.length ? (
                    <GalleryPhoto images={images} gallery={gallery} sizes="(max-width: 900px) 84vw, 40vw" priority idPrefix={product.slug} />
                  ) : (
                    <p className={styles.noImage}>Photographs coming soon</p>
                  )}
                </div>
              </SharedFrame>
            </div>
          </div>
          <GalleryControls images={images} gallery={gallery} />
        </section>

        <aside className={styles.info}>
          <nav aria-label="Breadcrumb" className={styles.crumbs}>
            <ol>
              <li>
                <Link href="/shop" transitionTypes={['nav-back']}>
                  Shop
                </Link>
              </li>
              {style && (
                <li>
                  <Link href={`/shop/${style.slug}`} transitionTypes={['nav-back']}>
                    {style.label}
                  </Link>
                </li>
              )}
              <li>
                <span aria-current="page">{product.name}</span>
              </li>
            </ol>
          </nav>
          <motion.p className="eyebrow" {...rise(0.1)}>
            Piece {n} <span className={styles.of}>of {total}</span>
          </motion.p>
          <RevealText as="h1" id="product-title" className={`${styles.title} display`} trigger="mount" delay={0.15}>
            {product.name.replace(/\*/g, '')}
          </RevealText>
          {product.summary && (
            <motion.p className={`${styles.tagline} display`} {...rise(0.3)}>
              <em>{product.summary}</em>
            </motion.p>
          )}
          {product.description && (
            <motion.p className={styles.description} {...rise(0.38)}>
              {product.description}
            </motion.p>
          )}

          <motion.dl className={styles.details} {...rise(0.46)}>
            {details.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
            <div>
              <dt>Price</dt>
              <dd className={styles.price}>
                {product.price.display}
                {!product.price.approved && <span className={styles.priceNote}>To be confirmed</span>}
              </dd>
            </div>
          </motion.dl>
          {availability && (
            <motion.p className={styles.availability} {...rise(0.5)}>
              {availability}
            </motion.p>
          )}

          <motion.div {...rise(0.54)}>
            <PurchasePanel
              productId={product.id}
              slug={product.slug}
              name={product.name}
              price={product.price.display}
              purchasable={product.purchasable}
              blocker={blocker}
              maxQuantity={maxQuantity}
            />
          </motion.div>

          <motion.div className={styles.accordions} {...rise(0.6)}>
            {product.features.length > 0 && (
              <details>
                <summary>Features</summary>
                <div className={styles.panel}>
                  <ul className={styles.features}>
                    {product.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </div>
              </details>
            )}
            <details>
              <summary>Delivery &amp; returns</summary>
              <div className={styles.panel}>
                {policiesApproved ? (
                  <p>
                    See our{' '}
                    <Link href="/client-services/shipping" className="text-link">
                      delivery
                    </Link>{' '}
                    and{' '}
                    <Link href="/client-services/returns" className="text-link">
                      returns
                    </Link>{' '}
                    policies.
                  </p>
                ) : (
                  <p>
                    Delivery, returns and cancellation terms are being finalised and will be confirmed before online ordering opens.{' '}
                    <Link href="/contact" className="text-link">
                      Ask the house
                    </Link>{' '}
                    anytime.
                  </p>
                )}
              </div>
            </details>
            {terms.length > 0 && (
              <details>
                <summary>Find similar</summary>
                <div className={styles.panel}>
                  <p className={styles.terms}>
                    {terms.map((t, i) => (
                      <span key={t.id}>
                        {i > 0 && ' · '}
                        <Link href={`/shop/${t.slug}`} className="text-link">
                          {t.label}
                        </Link>
                      </span>
                    ))}
                  </p>
                </div>
              </details>
            )}
          </motion.div>

          {unconfirmedDetails && (
            <motion.p className={styles.note} {...rise(0.66)}>
              Dimensions, materials and care details will be published here once confirmed by {brand.name}.
            </motion.p>
          )}
        </aside>
      </div>

      {images.length > 1 && (
        <section className={styles.views} aria-labelledby="views-title">
          <div className="container">
            <header className={styles.sectionHead}>
              <p className="eyebrow">Every view</p>
              <RevealText as="h2" id="views-title" className={`${styles.sectionTitle} display`}>
                {`${images.length} photographs, *one piece*`}
              </RevealText>
            </header>
            <div className={styles.viewsList}>
              {images.map((img, i) => (
                <motion.figure
                  key={img.assetId}
                  className={styles.viewFigure}
                  data-side={i % 2 ? 'right' : 'left'}
                  initial={reducedMotion ? { opacity: 0 } : { opacity: 0, clipPath: 'inset(10% 6% 10% 6%)' }}
                  whileInView={reducedMotion ? { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' } : { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' }}
                  viewport={{ once: true, margin: '-12% 0px' }}
                  transition={{ duration: 1.2, ease: [0.65, 0, 0.35, 1] }}
                >
                  <div className={styles.viewMat}>
                    <div className={styles.viewPhoto}>
                      <CloudImage asset={img.asset} alt={img.alt} sizes="(max-width: 900px) 90vw, 46vw" width={1280} maxWidth={2000} />
                    </div>
                  </div>
                  <figcaption>
                    <span>{String(i + 1).padStart(2, '0')}</span> View {i + 1} of {images.length}
                  </figcaption>
                </motion.figure>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="enquire" className={styles.enquire} aria-labelledby="enquire-title">
        <div className={`container ${styles.enquireGrid}`}>
          <div className={styles.enquireIntro}>
            <p className="eyebrow">Enquire</p>
            <h2 id="enquire-title" className={`${styles.sectionTitle} display`}>
              About {product.name}
            </h2>
            <p>Ask about availability, pricing or details. The piece is already selected for you.</p>
          </div>
          <div className={styles.enquireForm}>
            <EnquiryForm pieces={pieces} defaultPieceId={product.slug} headingId="enquire-title" allowModeSwitch />
          </div>
        </div>
      </section>

      {others.length > 0 && (
        <section className={styles.more} aria-labelledby="more-title">
          <div className="container">
            <header className={styles.sectionHead}>
              <p className="eyebrow">{related.length ? 'Shares a style or occasion' : 'More from the house'}</p>
              <RevealText as="h2" id="more-title" className={`${styles.sectionTitle} display`}>
                {related.length ? 'You may also *like*' : 'Other *pieces*'}
              </RevealText>
            </header>
            <div className={styles.moreGrid}>
              {others.slice(0, 4).map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} size="compact" />
              ))}
            </div>
          </div>
        </section>
      )}

      <RecentlyViewed excludeId={product.id} />

      {prev && next && (
        <nav className={`container ${styles.pager}`} aria-label="Previous and next piece">
          <Link href={`/products/${prev.slug}`} transitionTypes={['nav-back']} className={styles.pagerLink}>
            <span className={styles.pagerLabel}>← Previous</span>
            <span className={`${styles.pagerName} display`}>{prev.name}</span>
          </Link>
          <Link href={`/products/${next.slug}`} transitionTypes={['nav-forward']} className={`${styles.pagerLink} ${styles.pagerNext}`}>
            <span className={styles.pagerLabel}>Next →</span>
            <span className={`${styles.pagerName} display`}>{next.name}</span>
          </Link>
        </nav>
      )}
    </article>
  );
}
