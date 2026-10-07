# E-commerce Transformation Audit (2026-10-07)

**Specification:** `docs/MAAIRA_MASTER_PROMPT_COMPLETE.md` (master brief + E-commerce-first + Production-grade + traceability).
**Starting point:** commit `b33aa3f` — a multi-page editorial showcase with an enquiry backend (file/Supabase store, HTTP Basic admin), static product data in `src/data/products.ts`, no cart, checkout, accounts, orders or payments.

## 1. Keep / Improve / Rebuild / Remove

| Area (before) | Decision | Why | Result (after) |
|---|---|---|---|
| Brand identity, tokens, two themes (`globals.css`) | **Keep** | Solid, tested contrast in both themes | Extended with `.btn` / form patterns |
| WebGL heat-stamped hero (`hero/LeatherCanvas.tsx`) | **Improve** | Signature brand moment, but CTAs appeared after ~2.2 s and the hero filled 100svh | Copy now "Luxury bags, made to be carried" + **Shop bags** within 0.5 s; 86svh so products start above the fold  **Reversed 2026-10-07 — restored; see `docs/regression-audit-2026-10-07.md`.** |
| Product gallery (`gallery/*`) | **Keep** | Swipe, keys, zoom, accessible controls | Reused on PDP with the database image model |
| Enquiry form + validation (`forms/EnquiryForm.tsx`, `lib/enquiry/schema.ts`) | **Keep / improve** | Honest states, spam traps | Product list now from the database; prefilled order requests |
| Static product data (`data/products.ts`, `data/asset-manifest.ts`) | **Rebuild** | Hard-coded catalogue can't scale or be managed | PostgreSQL catalogue (products, images, taxonomy with evidence basis), admin-managed |
| Shop page (editorial/grid toggle + quick view) | **Rebuild** | No filters, sort or search; quick view duplicated the PDP | Data-driven listing with filters, sort, search, category pages  **Reversed 2026-10-07 — restored; see `docs/regression-audit-2026-10-07.md`.** |
| Product page (`product/ProductPage.tsx`) | **Rebuild** | No purchase path | Purchase panel, availability, cart, wishlist, accordions, related, recently viewed, mobile sticky bar  **Reversed 2026-10-07 — restored; see `docs/regression-audit-2026-10-07.md`.** |
| Header / footer | **Rebuild** | No search, account, wishlist or cart; footer not a commerce footer | Mega menu from populated categories; Search/Account/Wishlist/Cart; full footer  **Reversed 2026-10-07 — restored; see `docs/regression-audit-2026-10-07.md`.** |
| Enquiry store (file JSONL / Supabase REST) | **Replace** | File store not durable on serverless; two code paths | Single Postgres store (Drizzle), same API contract |
| HTTP Basic admin (`proxy.ts`, `lib/server/admin-auth.ts`) | **Replace** | One shared credential, no identity, no audit | Staff accounts with roles, per-action authorisation, audit log |
| 3D "in the round" ring (`home/GalleryRing.tsx`) | **Remove** | Spectacle over shopping; a 3-product ring adds friction | —  **Reversed 2026-10-07 — restored; see `docs/regression-audit-2026-10-07.md`.** |
| Pinned collection slides (`collection/Collection.tsx`) | **Remove** | 300vh scroll-jacking before support content | —  **Reversed 2026-10-07 — restored; see `docs/regression-audit-2026-10-07.md`.** |
| Lenis smooth scrolling | **Remove** | Interfered with drawers, sticky toolbars and native scroll | Native scrolling  **Reversed 2026-10-07 — restored; see `docs/regression-audit-2026-10-07.md`.** |
| Campaign scroll study (home) | **Move** | Long pinned section on the shopping path | Lives on `/editorial`  **Reversed 2026-10-07 — restored; see `docs/regression-audit-2026-10-07.md`.** |
| Quick view dialog (`detail/*`) | **Remove** | Brief: card click goes to the PDP | —  **Reversed 2026-10-07 — restored; see `docs/regression-audit-2026-10-07.md`.** |

## 2. Readiness classification

| Capability | Class | Evidence / reason |
|---|---|---|
| Catalogue (DB-backed), PLP, filters, sort, search, category pages, PDP | **Production ready (code)** · data **pending** | Unit tests (discovery), e2e (filters, typo search, empty categories 404). Real products await visual grouping and client data. |
| Cart (server-side, DB prices) | **Production ready** | Integration + e2e: quantity bounds, stock, price changes reflected, CSRF/origin checks |
| Checkout + orders + inventory reservation | **Production ready (code)** | Transaction with row locks; oversell race test; idempotency; expiry releases stock |
| Payments (Razorpay) | **Partially ready — BLOCKED: provider credentials** | Signature/webhook logic unit-tested; full flow e2e-tested against a local Razorpay stand-in; live API never exercised |
| Transactional email | **Partially ready — BLOCKED: provider credentials** | Integration point (Resend); returns `sent: false` when unconfigured |
| Accounts, addresses, wishlist, order history | **Production ready** | e2e: registration, role not settable, wishlist merge, IDOR checks |
| Admin (products, photographs, orders, enquiries, settings, audit) | **Production ready** | e2e: RBAC (customer 404), state machine, audit actor, price-approval confirmation |
| Enquiries & callbacks | **Production ready** | Validation, spam traps, rate limits, persistence, admin status |
| Legal / policy pages | **Demo only (structure)** | Pages exist with explicit `[CLIENT TO CONFIRM]` placeholders; checkout stays closed until marked approved |
| Analytics | **Missing (by decision)** | No approved tool; none installed |
| Hosting, DNS, HTTPS, backups, monitoring | **Missing — external** | No hosting/DNS credentials in this environment |

## 3. Security review summary

Controls implemented and tested (see `docs/requirements-traceability.md` QA log for results):

- **Price manipulation:** prices never accepted from clients; strict schemas reject extra fields; totals computed in the order transaction; DB constraint `total = subtotal + shipping + tax`.
- **Inventory manipulation / oversell:** `SELECT … FOR UPDATE` + conditional decrement; concurrent checkout test.
- **Payment-state manipulation:** HMAC signature (constant-time), provider fetch with order/amount/currency/status match; browser redirect never marks paid; webhooks signed and de-duplicated by event id.
- **IDOR:** orders visible only to owner session or private token (hashed at rest); wishlist/addresses scoped to the session user in every query.
- **Broken access control:** proxy pre-check + server-side role check in every admin page and server action; customers receive 404 for admin.
- **CSRF:** JSON-only APIs require same-origin `Origin`/`Referer`; Better Auth origin checks; Next server-action origin checks.
- **XSS:** React escaping; JSON-LD `<` escaped; email HTML escaped; CSP.
- **Brute force / abuse:** database-backed rate limits on sign-in/up/reset, cart, checkout, verify, enquiries, wishlist, lookups.
- **Secrets:** only in environment; none in the client bundle or repository (scanned); `.env.local` git-ignored.
- **Headers:** CSP (Cloudinary + Razorpay only), HSTS (production), nosniff, frame denial, Referrer-Policy, Permissions-Policy, COOP.
- **SSRF / uploads:** no server fetch of user-supplied URLs; no file uploads (images are referenced from the managed Cloudinary library).

Residual risks: no staff two-factor authentication yet (recommended); no WAF/bot management beyond rate limits; dependency advisories remain in dev-only tooling (`npm audit --omit=dev`: see QA log).
