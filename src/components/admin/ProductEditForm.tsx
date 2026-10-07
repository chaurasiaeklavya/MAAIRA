'use client';

import { useActionState } from 'react';
import { updateProduct, type ActionState } from '@/app/admin/actions';
import styles from '@/app/admin/admin.module.css';

interface P {
  name: string;
  slug: string;
  sku: string | null;
  nameStatus: string;
  summary: string | null;
  description: string | null;
  copyStatus: string;
  price: string;
  priceStatus: string;
  status: string;
  availability: string;
  trackInventory: boolean;
  colour: string | null;
  material: string | null;
  dimensions: string | null;
  features: string[];
  tags: string[];
  stage: string;
  featuredRank: number | null;
  arrivedAt: string;
  internalNotes: string | null;
}

/** Product details. Only verified facts belong in customer-facing fields; leave unknowns empty. */
export function ProductEditForm({ productId, product: p, terms }: { productId: string; product: P; terms: { id: string; kind: string; label: string; basis: string }[] }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateProduct.bind(null, productId), { ok: false });
  const e = state.errors ?? {};
  const err = (k: string) => (e[k] ? <p className={styles.err}>{e[k]}</p> : null);

  return (
    <form action={action} className={styles.card} aria-labelledby="details-title">
      <h2 id="details-title" className={styles.h2}>
        Details
      </h2>
      <div className={styles.formGrid}>
        <label>
          Name
          <input name="name" defaultValue={p.name} required maxLength={120} />
          {err('name')}
        </label>
        <label>
          Name status
          <select name="nameStatus" defaultValue={p.nameStatus}>
            <option value="working">Working title</option>
            <option value="approved">Approved by the business</option>
          </select>
        </label>
        <label>
          Web address (slug)
          <input name="slug" defaultValue={p.slug} required pattern="[a-z0-9]+(-[a-z0-9]+)*" />
          {err('slug')}
        </label>
        <label>
          SKU (client-supplied only)
          <input name="sku" defaultValue={p.sku ?? ''} maxLength={60} />
          {err('sku')}
        </label>
        <label className={styles.wide}>
          Short summary
          <input name="summary" defaultValue={p.summary ?? ''} maxLength={300} />
        </label>
        <label className={styles.wide}>
          Description
          <textarea name="description" defaultValue={p.description ?? ''} rows={4} maxLength={4000} />
        </label>
        <label>
          Copy status
          <select name="copyStatus" defaultValue={p.copyStatus}>
            <option value="draft">Draft</option>
            <option value="approved">Approved by the business</option>
          </select>
        </label>
        <label>
          Status
          <select name="status" defaultValue={p.status}>
            <option value="draft">Draft (hidden)</option>
            <option value="published">Published</option>
            <option value="archived">Archived (hidden)</option>
          </select>
          {err('status')}
        </label>
      </div>

      <fieldset className={styles.fieldset}>
        <legend>Price &amp; availability</legend>
        <div className={styles.formGrid}>
          <label>
            Price (₹, inclusive of taxes)
            <input name="price" defaultValue={p.price} inputMode="decimal" placeholder="e.g. 24500" />
            {err('price')}
          </label>
          <label>
            Price status
            <select name="priceStatus" defaultValue={p.priceStatus}>
              <option value="pending">Pending — shows ₹XXXX, not purchasable</option>
              <option value="approved">Approved — shown and purchasable</option>
            </select>
          </label>
          <label className={styles.checkLabel}>
            <input type="checkbox" name="priceConfirm" /> I confirm the business approved this price
            {err('priceConfirm')}
          </label>
          <label>
            Availability
            <select name="availability" defaultValue={p.availability}>
              <option value="unconfirmed">Unconfirmed (not purchasable)</option>
              <option value="in_stock">In stock</option>
              <option value="made_to_order">Made to order</option>
              <option value="out_of_stock">Out of stock</option>
            </select>
          </label>
          <label className={styles.checkLabel}>
            <input type="checkbox" name="trackInventory" defaultChecked={p.trackInventory} /> Track stock quantity
          </label>
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend>Verified attributes (leave empty if unknown)</legend>
        <div className={styles.formGrid}>
          <label>
            Colour
            <input name="colour" defaultValue={p.colour ?? ''} maxLength={60} />
          </label>
          <label>
            Material
            <input name="material" defaultValue={p.material ?? ''} maxLength={120} />
          </label>
          <label>
            Dimensions
            <input name="dimensions" defaultValue={p.dimensions ?? ''} maxLength={120} placeholder="e.g. 30 × 22 × 12 cm" />
          </label>
          <label className={styles.wide}>
            Features (one per line)
            <textarea name="features" defaultValue={p.features.join('\n')} rows={3} />
          </label>
          <label className={styles.wide}>
            Search keywords (comma separated)
            <input name="tags" defaultValue={p.tags.join(', ')} />
          </label>
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend>Categories</legend>
        <p className={styles.muted}>
          A category appears in the store only when at least one published product carries it. Record how each one is known: <strong>fact</strong> (directly visible or supplied), <strong>inference</strong> (strongly supported by the photographs) or <strong>client</strong> (confirmed by the business).
        </p>
        <div className={styles.termGrid}>
          {(['style', 'occasion'] as const).map((kind) => (
            <div key={kind}>
              <p className={styles.h3}>{kind === 'style' ? 'Style' : 'Occasion'}</p>
              {terms
                .filter((t) => t.kind === kind)
                .map((t) => (
                  <label key={t.id} className={styles.termRow}>
                    <span>{t.label}</span>
                    <select name={`term:${t.id}`} defaultValue={t.basis}>
                      <option value="">—</option>
                      <option value="fact">fact</option>
                      <option value="inference">inference</option>
                      <option value="client">client</option>
                    </select>
                  </label>
                ))}
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend>Merchandising</legend>
        <div className={styles.formGrid}>
          <label>
            Backdrop
            <select name="stage" defaultValue={p.stage}>
              <option value="ivory-plaster">Ivory plaster</option>
              <option value="champagne-studio">Champagne studio</option>
              <option value="espresso-leather">Espresso leather</option>
            </select>
          </label>
          <label>
            Featured order (1 = first)
            <input name="featuredRank" type="number" min={1} max={999} defaultValue={p.featuredRank ?? ''} />
            {err('featuredRank')}
          </label>
          <label>
            New arrival date (optional)
            <input name="arrivedAt" type="date" defaultValue={p.arrivedAt} />
            {err('arrivedAt')}
          </label>
          <label className={styles.wide}>
            Internal notes (staff only)
            <textarea name="internalNotes" defaultValue={p.internalNotes ?? ''} rows={3} maxLength={2000} />
          </label>
        </div>
      </fieldset>

      {state.message && (
        <p role={state.ok ? 'status' : 'alert'} className={state.ok ? styles.good : styles.err}>
          {state.message}
        </p>
      )}
      {e.form && <p className={styles.err}>{e.form}</p>}
      <button type="submit" className="btn btn--primary" disabled={pending}>
        {pending ? 'Saving…' : 'Save product'}
      </button>
    </form>
  );
}
