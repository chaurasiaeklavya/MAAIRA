# MAAIRA FASHION BAGS — online store

The e-commerce platform for **MAAIRA FASHION BAGS**, a brand of **Maanya Enterprises**, *Manufacturer of Luxury Designer Handbags*.

A full-stack Next.js store: catalogue with search and filters, product pages, cart, checkout with Razorpay, orders and inventory, customer accounts, wishlist, enquiries and callbacks, and a staff admin with roles and an audit log — all backed by PostgreSQL.

> ⚠️ **Catalogue data is not final.** The 45 product photographs supplied on 2026-10-07 could not be opened from the build environment (Cloudinary is blocked by its network policy), so they are not yet grouped into products. Three *provisional* pieces from the first brief are shown meanwhile, without prices. See `docs/catalogue-image-analysis.md` — staff can complete the grouping today in **/admin/media**.

## Quick start

```bash
npm install
cp .env.example .env.local        # fill in DATABASE_URL and BETTER_AUTH_SECRET at least
npm run db:migrate                # create/upgrade tables
npm run db:seed                   # media library, taxonomy, provisional catalogue (idempotent)
STAFF_PASSWORD='…' npm run staff:create -- --email you@example.com --name "Your Name" --role admin
npm run build && npm start        # http://localhost:3000  (staff: /admin)
```

Requires Node 22.6+ and PostgreSQL 14+.

| Script | Purpose |
|---|---|
| `npm run dev` · `build` · `start` | Develop · build · serve |
| `npm run lint` · `typecheck` | ESLint · TypeScript |
| `npm test` | Unit + Postgres integration tests (needs `TEST_DATABASE_URL`) |
| `npm run test:e2e` | End-to-end purchase journey, accounts, admin and security probes against a production build and the test database (`npm run build` first) |
| `npm run qa:screens -- --mock-images` | Responsive/visual sweep 360 → 1920 px, both themes, reduced motion |
| `npm run qa:a11y -- --staff=email:password` | axe-core WCAG 2.2 A/AA audit of storefront, dialogs and admin |
| `npm run build:preview` | One self-contained HTML file of the storefront (`dist/maaira-store-preview.html`) captured from the running store, for sharing or offline review — see below |
| `npm run db:generate` · `db:migrate` · `db:seed` | Schema migrations and seed import |
| `npm run staff:create` | Create or promote a staff/admin account |
| `npm run assets:brand` | Regenerate logo masks, icons and leather textures |

## How it works

- **Catalogue** (`src/db/schema.ts`, `src/server/catalogue*.ts`): products, photographs (`media_assets`), styles/occasions (`taxonomy_terms`) with an evidence basis per assignment (fact · inference · client). Categories, filters and navigation appear only when real products carry them. Unknown attributes stay empty and are never displayed.
- **Discovery** (`src/lib/catalogue/discovery.ts`): combinable filters (OR within a group, AND across groups), sort options that exist only when data supports them, search with synonyms ("office bag" → Office & Work) and typo tolerance, related products from shared attributes.
- **Cart & checkout** (`src/server/commerce/*`): the browser holds only an httpOnly cart token; prices come from the database. Checkout creates the order in one transaction (row locks, stock reservation, idempotency key), then a Razorpay order for the server-computed amount. An order becomes **paid** only after the payment signature verifies *and* the payment fetched from Razorpay matches the order, amount and currency — or a signed, de-duplicated webhook confirms it. Unpaid orders expire after 30 minutes and release stock.
- **Checkout readiness**: checkout opens only when payment keys, delivery charge, tax treatment (prices inclusive of GST), approved policies and the staff "open checkout" switch are all set (`/admin/settings`). Until then customers see an honest "not open yet" page that sends their cart as an order request.
- **Accounts** (Better Auth): email + password (scrypt), database sessions, rate-limited sign-in/up/reset; roles `customer` · `staff` · `admin` (never settable at sign-up).
- **Admin** (`/admin`): products and photographs (group photos into products), inventory adjustments with history, orders with a state machine, enquiries, store settings (admin), audit log (admin). Every page and server action re-checks the role; customers get a 404.

Architecture, data model and deployment: `docs/architecture.md`.

## Deployment (summary)

1. Provision PostgreSQL (e.g. Supabase or Neon; use the pooled URL on serverless) and run `npm run db:migrate` and `npm run db:seed`.
2. Set the variables in `.env.example` on the host (Vercel or any Node host). Use **test** Razorpay keys first.
3. Configure the Razorpay webhook to `https://<domain>/api/webhooks/razorpay` (events `payment.captured`, `payment.failed`, `order.paid`).
4. Schedule `GET /api/cron/expire-orders` every 10–15 minutes with `Authorization: Bearer $CRON_SECRET`.
5. Create the first admin with `npm run staff:create`, review `/admin/settings`, then complete the catalogue in `/admin/media`.

Nothing has been deployed from this environment (no hosting, DNS or provider credentials).

## Offline preview file

`npm run build:preview` (with the store running, e.g. `npm run build && npm start`) writes **`dist/maaira-store-preview.html`**: every public page in one file that opens from disk with no server — styles, fonts, textures and logos inlined. Pages are captured from the real app, so the file always reflects the current catalogue and copy.

In the file: the site's motion is replayed. Entrance reveals start from the exact styles the app used; scroll-linked effects (pinned campaign study, collection rail, hero parallax) are sampled from the live page; and the gallery ring, page fades, hide-on-scroll header and theme reveal all run. Page navigation, dark/light theme, the menu, search and cart dialogs, photo galleries, the layout toggle, accordions and the enquiry/callback form modes work. The WebGL leather is the one effect not carried; the hero shows its own leather fallback. Anything that needs the server (cart, checkout, accounts, search, wishlist, sending enquiries) says so; the enquiry form offers to email the visitor's details instead. Product photographs stay Cloudinary URLs, so they need a connection (without one, the brand panel is shown). The builder checks the result offline before finishing.

## Documentation

- `docs/ecommerce-audit-2026-10-07.md` — keep/improve/rebuild/remove audit and readiness classification
- `docs/catalogue-image-analysis.md` — image intake, inventory, blocker and grouping workflow
- `docs/architecture.md` — architecture, data model, security controls, operations
- `docs/requirements-traceability.md` — requirement status with test evidence
- `docs/product-data-gaps.md` — missing product data and client questions
- `docs/access-asset-readiness.md` — what could and couldn't be accessed
- `docs/creative-technical-decisions.md` — design system and creative rationale
- `docs/MAAIRA_MASTER_PROMPT_COMPLETE.md` — the governing specification
