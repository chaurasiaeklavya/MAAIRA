'use client';

import styles from './Listing.module.css';

/** Native select (keyboard/touch friendly); submits its GET form on change. */
export function SortSelect({ sorts, value }: { sorts: { value: string; label: string }[]; value: string }) {
  return (
    <label className={styles.sort}>
      <span>Sort by</span>
      <select name="sort" defaultValue={value} onChange={(e) => e.currentTarget.form?.requestSubmit()}>
        {sorts.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <noscript>
        <button type="submit">Apply</button>
      </noscript>
    </label>
  );
}
