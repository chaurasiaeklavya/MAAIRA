import Link from 'next/link';
import { CloudImage } from '../CloudImage';
import { RevealText } from '../motion/RevealText';
import { Stage } from '../showcase/Stage';
import type { CategorySummary } from '@/lib/catalogue/discovery';
import { primaryImage } from '@/lib/catalogue/types';
import styles from './CategoryTiles.module.css';

/**
 * "Shop by style" / "Shop by occasion": shortcuts into filtered results,
 * illustrated with a real product from each category. Rendered only when
 * at least one category is populated.
 */
export function CategoryTiles({ id, eyebrow, title, categories }: { id: string; eyebrow: string; title: string; categories: CategorySummary[] }) {
  if (!categories.length) return null;
  return (
    <section className={styles.section} aria-labelledby={id}>
      <div className="container">
        <p className="eyebrow">{eyebrow}</p>
        <RevealText as="h2" id={id} className={`${styles.title} display`}>
          {title}
        </RevealText>
        <ul className={styles.grid}>
          {categories.map((c) => {
            const img = primaryImage(c.cover);
            return (
              <li key={c.term.id}>
                <Link href={`/shop/${c.term.slug}`} className={styles.tile} transitionTypes={['nav-forward']}>
                  <span className={styles.media}>
                    <Stage preset={c.cover.stage} className={styles.stage} />
                    {img && (
                      <span className={styles.photo}>
                        <CloudImage asset={img.asset} alt="" sizes="(max-width: 700px) 45vw, 22vw" width={480} maxWidth={960} variant="natural" />
                      </span>
                    )}
                  </span>
                  <span className={styles.label}>{c.term.label}</span>
                  <span className={styles.count}>{c.count === 1 ? '1 bag' : `${c.count} bags`}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
