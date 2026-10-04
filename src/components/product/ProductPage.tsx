'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { CloudImage } from '../CloudImage';
import { useExperience } from '../ExperienceProvider';
import { EnquiryForm } from '../forms/EnquiryForm';
import { GalleryControls, GalleryPhoto } from '../gallery/Gallery';
import { useGallery } from '../gallery/useGallery';
import { RevealText } from '../motion/RevealText';
import { SharedFrame } from '../PageShell';
import { Stage } from '../showcase/Stage';
import { ProductCard } from './ProductCard';
import styles from './ProductPage.module.css';
import { brand } from '@/data/brand';
import { products, resolveImages, type Product } from '@/data/products';

const EASE = [0.22, 1, 0.36, 1] as const;

export function ProductPage({ product }: { product: Product }) {
  const { reducedMotion, scrollTo } = useExperience();
  const images = resolveImages(product);
  const gallery = useGallery(images.length);
  const index = products.findIndex((p) => p.id === product.id);
  const prev = products[(index - 1 + products.length) % products.length];
  const next = products[(index + 1) % products.length];
  const others = products.filter((p) => p.id !== product.id);
  const n = String(index + 1).padStart(2, '0');

  const rise = (delay: number) =>
    reducedMotion
      ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.9, delay, ease: EASE },
        };

  return (
    <article className={styles.page} aria-labelledby="product-title">
      <div className={`container ${styles.top}`}>
        <section className={styles.galleryCol} aria-label={`${product.displayName} — images`}>
          <div className={styles.stageBox}>
            <Stage preset={product.stage} className={styles.stage} />
            <div className={styles.frameWrap}>
              <SharedFrame name={`piece-${product.slug}`}>
                <div
                  className={styles.frame}
                  tabIndex={0}
                  role="group"
                  aria-roledescription="carousel"
                  aria-label={`${product.displayName}: use the left and right arrow keys to change view`}
                  onKeyDown={gallery.onKeyDown}
                >
                  <GalleryPhoto
                    images={images}
                    gallery={gallery}
                    sizes="(max-width: 900px) 84vw, 40vw"
                    priority
                    idPrefix={product.slug}
                  />
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
              <li>
                <span aria-current="page">{product.displayName}</span>
              </li>
            </ol>
          </nav>
          <motion.p className="eyebrow" {...rise(0.1)}>
            Piece {n} <span className={styles.of}>of {String(products.length).padStart(2, '0')}</span>
          </motion.p>
          <RevealText as="h1" id="product-title" className={`${styles.title} display`} trigger="mount" delay={0.15}>
            {product.displayName}
          </RevealText>
          <motion.p className={`${styles.tagline} display`} {...rise(0.3)}>
            <em>{product.tagline}</em>
          </motion.p>
          <motion.p className={styles.description} {...rise(0.38)}>
            {product.description}
          </motion.p>

          <motion.dl className={styles.details} {...rise(0.46)}>
            <div>
              <dt>Reference</dt>
              <dd>{product.number}</dd>
            </div>
            {product.colour && (
              <div>
                <dt>Colour</dt>
                <dd>{product.colour}</dd>
              </div>
            )}
            <div>
              <dt>Views</dt>
              <dd>{images.length} photographs</dd>
            </div>
            <div>
              <dt>Price</dt>
              <dd className={styles.price}>
                {product.price.display}
                {product.price.status === 'placeholder' && <span className={styles.priceNote}>To be confirmed</span>}
              </dd>
            </div>
          </motion.dl>

          <motion.div className={styles.actions} {...rise(0.54)}>
            <button
              type="button"
              className={styles.primary}
              onClick={() => {
                scrollTo('#enquire');
                window.setTimeout(() => document.querySelector<HTMLElement>('#enquire input[name="name"]')?.focus({ preventScroll: true }), 900);
              }}
            >
              Enquire about this piece
            </button>
            <Link href={`/contact?mode=callback&piece=${product.slug}`} className={styles.secondary} transitionTypes={['nav-forward']}>
              Request a callback
            </Link>
            <a href={brand.contact.phoneHref} className={styles.tertiary}>
              or call {brand.contact.phoneDisplay}
            </a>
          </motion.div>

          <motion.p className={styles.note} {...rise(0.6)}>
            Dimensions, materials and care details will be published here once confirmed by {brand.name}.
          </motion.p>
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
                  whileInView={reducedMotion ? { opacity: 1 } : { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' }}
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
              About {product.displayName}
            </h2>
            <p>Ask about availability, pricing or details. The piece is already selected for you.</p>
          </div>
          <div className={styles.enquireForm}>
            <EnquiryForm defaultPieceId={product.id} headingId="enquire-title" />
          </div>
        </div>
      </section>

      <section className={styles.more} aria-labelledby="more-title">
        <div className="container">
          <header className={styles.sectionHead}>
            <p className="eyebrow">More from the preview</p>
            <h2 id="more-title" className={`${styles.sectionTitle} display`}>
              Other <em>pieces</em>
            </h2>
          </header>
          <div className={styles.moreGrid}>
            {others.map((p) => (
              <ProductCard key={p.id} product={p} index={products.indexOf(p)} size="compact" />
            ))}
          </div>
        </div>
      </section>

      <nav className={`container ${styles.pager}`} aria-label="Previous and next piece">
        <Link href={`/shop/${prev.slug}`} transitionTypes={['nav-back']} className={styles.pagerLink}>
          <span className={styles.pagerLabel}>← Previous</span>
          <span className={`${styles.pagerName} display`}>{prev.displayName}</span>
        </Link>
        <Link href={`/shop/${next.slug}`} transitionTypes={['nav-forward']} className={`${styles.pagerLink} ${styles.pagerNext}`}>
          <span className={styles.pagerLabel}>Next →</span>
          <span className={`${styles.pagerName} display`}>{next.displayName}</span>
        </Link>
      </nav>
    </article>
  );
}
