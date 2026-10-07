# Architecture

## Stack

| Layer | Choice | Why |
|---|---|---|
| App | Next.js 16 (App Router, React 19), TypeScript | Server components for catalogue pages, route handlers for APIs, server actions for admin forms; one deployable |
| Database | PostgreSQL via Drizzle ORM (`postgres` driver) | Transactions and row locks for checkout; typed, parameterised queries; SQL migrations in `drizzle/` |
| Auth | Better Auth (email + password) | Established library: scrypt hashing, DB sessions, CSRF origin checks, rate limits |
| Validation | Zod (strict objects) + shared enquiry validator | Same rules client- and server-side; unknown fields rejected |
| Payments | Razorpay (REST, no SDK) | India-compatible; orders, signatures and webhooks implemented directly and testably |
| Media | Cloudinary delivery URLs (`f_auto,q_auto,c_limit`, srcset) | Originals untouched; responsive AVIF/WebP |
| Email | Resend REST (optional) | Order/enquiry/password emails when configured |
| Tests | node:test + tsx, Playwright, axe-core | Unit, Postgres integration, end-to-end, accessibility |

## Data model (main tables)

```
media_assets ─┐            taxonomy_terms (style | occasion | collection)
              │                 │
product_images ── products ── product_terms (basis: fact | inference | client)
                    │
   cart_items ── carts (token hash | user)        wishlist_items ── user ── addresses
                    │
order_items ── orders ── order_events (status history)
                 │  └── payments ── (provider ids)      payment_events (webhook de-dup)
                 └── inventory_movements (reserve | release | adjustment)

enquiries · store_settings · rate_limit_buckets · audit_log · session/account/verification/rate_limit (auth)
```

Database constraints enforce the business rules as a backstop: positive prices, approved price requires an amount, INR only, stock ≥ 0, cart/order quantities 1–10, line total = unit × quantity, order total = subtotal + shipping + tax, one product per photograph, valid status values.

## Key flows

**Purchase.** `POST /api/cart` (product id + quantity only) → `POST /api/checkout` (contact + address; strict schema) → transaction: lock products, re-check purchasability and stock, compute totals from DB prices, insert order/items/event, reserve stock → create Razorpay order for the server amount → browser opens Razorpay Checkout → `POST /api/checkout/verify` (HMAC signature, then fetch payment and match order/amount/currency/captured) → order `paid`, cart emptied, confirmation emails (if configured). `POST /api/webhooks/razorpay` performs the same settlement idempotently. `GET /api/cron/expire-orders` cancels unpaid orders after 30 minutes and releases stock.

**Order states.** `pending_payment → paid | payment_failed | cancelled`; `paid → processing | cancelled | refunded`; `processing → shipped | cancelled`; `shipped → delivered`; `delivered → refunded`. Only the provider can mark paid; staff move fulfilment states; every change is recorded with actor and note (`src/lib/commerce/order-state.ts`).

**Access.** Customer data is always queried with the session user id; guest order pages need the private token (stored as SHA-256). Admin: proxy pre-check for a session cookie, then `requireStaffPage` / `requireStaff(permission)` in every page and server action; `settings:write` and `audit:read` are admin-only.

## Security controls

See `docs/ecommerce-audit-2026-10-07.md` §3. Headers are set in `next.config.ts` (CSP allowing only Cloudinary images and Razorpay Checkout, HSTS in production). Structured, PII-free logs (`evt` JSON lines) for API errors, payments and webhooks.

## Operations

- **Environments:** separate databases and keys for development, staging and production (`.env.example`). `TEST_DATABASE_URL` is truncated by tests.
- **Migrations:** `npm run db:migrate` on deploy (before switching traffic). Generated with `npm run db:generate`.
- **Seed:** idempotent; never overwrites products that already exist. `--reset-catalogue` is refused in production.
- **Backups:** use the database provider's point-in-time recovery (Supabase/Neon both offer it; enable and test a restore before launch). Order, payment and audit tables are the critical set.
- **Monitoring:** host logs (structured JSON); add an error tracker (e.g. Sentry) before launch — not configured here.
- **Secrets rotation:** `BETTER_AUTH_SECRET` (signs everyone out), Razorpay keys/webhook secret (update the dashboard), `CRON_SECRET`.
- **Database role:** run the app with a role that owns only the app schema; run migrations with the same or a separate migration role.
