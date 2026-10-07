import Link from 'next/link';
import { CloudImage } from '../CloudImage';
import { Stage } from '../showcase/Stage';
import { primaryImage, type CatalogueProduct } from '@/lib/catalogue/types';
import styles from './EditorialBand.module.css';

/** One quiet editorial moment on home, leading to the studies — never in the way of shopping. */
export function EditorialBand({ product }: { product: CatalogueProduct }) {
  const img = product.images[1] ?? primaryImage(product);
  return (
    <section className={styles.band} aria-labelledby="editorial-band-title">
      <div className={`container ${styles.inner}`}>
        <div className={styles.media}>
          <Stage preset={product.stage} className={styles.stage} />
          {img && (
            <span className={styles.photo}>
              <CloudImage asset={img.asset} alt={img.alt} sizes="(max-width: 900px) 90vw, 45vw" width={960} maxWidth={1600} variant="natural" />
            </span>
          )}
        </div>
        <div className={styles.text}>
          <p className="eyebrow">Editorial</p>
          <h2 id="editorial-band-title" className={`${styles.title} display`}>
            Studies in <em>light</em>
          </h2>
          <p>Each piece photographed from every side — composed into quiet studies of form and finish.</p>
          <Link href="/editorial" className="btn btn--secondary">
            View the studies
          </Link>
        </div>
      </div>
    </section>
  );
}
