import { notFound } from 'next/navigation';

/** Unknown storefront URLs render the store's 404 (with header, search and footer). */
export default function CatchAll() {
  notFound();
}
