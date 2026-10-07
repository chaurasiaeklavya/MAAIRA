# Requirements Traceability

**Edition:** e-commerce platform · **Updated:** 2026-10-07 · **Spec:** `docs/MAAIRA_MASTER_PROMPT_COMPLETE.md`
**Status vocabulary:** Not started · In progress · Passed · Partial · Blocked · Not applicable

Evidence keys:
- **UT** — `npm test` (unit + Postgres integration, `tests/`)
- **E2E** — `npm run test:e2e` (production build + test DB; `scripts/e2e/run.ts`)
- **QA** — `npm run qa:screens` (responsive/visual sweep)
- **A11Y** — `npm run qa:a11y` (axe-core)

Results are in the QA log at the end. "Passed" means implemented **and** tested; external services are never marked passed without a live test.

## Master brief baseline (R01–R42)

| ID | Requirement | Status | Evidence / reason · dependency · next action |
|---|---|---|---|
| R01 | Real e-commerce, not a prototype | Partial | Full purchase flow implemented and e2e-tested end to end (cart → checkout → verified payment → order → admin). **Blocked for live use:** Razorpay credentials, real product data, approved policies. |
| R02 | Brand / business-name clarity | Passed | Brand, business and logo lockup used correctly (header, footer, About, metadata). |
| R03 | Supplied credentials, no fabrication | Partial | Award and figure shown exactly as supplied; verification pending (client). No reviews, ratings, scarcity or discounts anywhere. |
| R04 | Drive / Instagram / logo access verified | Passed | `docs/access-asset-readiness.md` incl. 2026-10-07 re-check (Cloudinary + Drive files blocked). |
| R05 | Asset inventory, originals preserved | Passed (inventory) · Blocked (inspection) | All 57 URLs (51 unique assets across two batches) recorded with IDs, batches, duplicates and overlaps (`docs/catalogue-image-analysis.md`, `media_assets`). Contents not inspectable here. |
| R06 | Product mapping + gap report | Blocked | Visual grouping impossible without image access; staff workflow ready in /admin/media; gaps in `docs/product-data-gaps.md`. |
| R07 | Luxury research, originality | Partial | Principles applied (clear hierarchy, simple filters, product-first); no layouts/assets copied. No formal research write-up. |
| R08 | Logo fidelity + palette | Passed | Unchanged from earlier editions (derived masks; original preserved). |
| R09 | Typography & design system | Passed | Tokens + shared button/form patterns; storefront and admin consistent. |
| R10 | Independently art-directed dark/light | Passed | Both themes on every page incl. 404 (theme re-applied after not-found renders); A11Y in both themes. |
| R11 | Non-blocking entrance | Passed | "Shop bags" visible within 0.5 s; hero 86svh with products below; reduced-motion end states fixed. |
| R12 | Purposeful motion + reduced motion | Passed | Spectacle removed from the shopping path; reveal bugs under reduced motion fixed (QA reduced run). |
| R13 | WebGL only where justified | Passed | Single hero shader; no 3D on commerce paths. |
| R14 | Authentic product imagery | Partial | Photos never altered; natural aspect ratio, never cropped in cards. No AI/background editing performed (images not accessible). |
| R15 | Complete site architecture | Passed | Home, shop, categories, search, new arrivals (data-driven), PDP, cart, checkout, orders, account (sign-in/up/reset, addresses, orders), wishlist, about, editorial, contact, FAQ, 6 policy pages, 404/error, admin. |
| R16 | Search / filter / sort | Passed | UT (discovery) + E2E: combinable filters, typo search, no-result recovery, empty categories hidden (404). |
| R17 | Product detail & gallery | Passed (data pending) | PDP purchase panel, gallery, verified-only details, related/recently viewed, mobile sticky bar (E2E). |
| R18 | Cart, server totals | Passed | UT + E2E: DB prices only, quantity/stock validation, tamper probes rejected. |
| R19 | Checkout & payment security | Partial — BLOCKED: provider credentials | Signature/webhook/amount matching tested (UT, E2E with Razorpay stand-in). Live Razorpay sandbox not exercised (no keys). |
| R20 | Orders, fulfilment, notifications | Partial | Orders, state machine, history, inventory reservation/release tested. Emails need Resend credentials; no carrier tracking integration (not invented). |
| R21 | Customer accounts | Passed | Better Auth; E2E registration, role lock, wishlist merge, IDOR. Password reset needs email credentials (honest fallback shown). |
| R22 | Optional commerce enhancements | Not applicable | No promotions, gift services or abandoned-cart flows without business rules. |
| R23 | Backend / database | Passed | PostgreSQL schema + 4 migrations, constraints, transactions (UT integration). |
| R24 | Admin dashboard | Passed | RBAC, products/photographs/inventory/orders/enquiries/settings/audit (E2E). Staff 2FA recommended (not implemented). |
| R25 | Security, privacy, legal readiness | Partial | Controls tested (see audit §3, QA log). Policies are drafts with `[CLIENT TO CONFIRM]`; legal review pending. |
| R26 | Optional user-controlled sound | Passed | Off by default; control in footer and menu; no autoplay. Licensed recordings still not supplied. |
| R27 | Mobile-first responsive | Passed | QA 360/390/768/1024/1440/1920; E2E full purchase at 390 px. |
| R28 | WCAG 2.2 AA target | Partial | A11Y results below; keyboard dialogs (native `<dialog>`). Manual screen-reader pass not done. |
| R29 | Performance / CWV | Partial | Lean pages, no third-party scripts, Razorpay script only on checkout. Lighthouse/CWV not measured (needs deployed preview). |
| R30 | SEO & structured data | Partial | Per-page metadata, canonical, sitemap, robots, Product JSON-LD from verified fields only. Indexing intentionally off until data approved. |
| R31 | Privacy-conscious analytics | Not started | No approved tool. |
| R32 | Tool / service review | Passed | `docs/architecture.md` stack table. |
| R33 | Architecture & docs | Passed | README, architecture, audit, analysis, traceability. |
| R34 | Efficiency without quality loss | Passed | Data-driven UI; reusable listing pipeline; automated suites. |
| R35 | Phased workflow & gates | Partial | Audit + intake before implementation; catalogue gate (visual grouping) honestly blocked. |
| R36 | QA across journeys | Passed (automated) | UT, E2E, QA, A11Y below. No real-device or cross-browser runs (Chromium only). |
| R37 | Deployment readiness | Partial | Build passes; env, migrations, cron, webhook and deploy steps documented. Not deployed (no credentials). |
| R38 | Final audit & handover | Passed | This document + docs listed in README. |
| R39 | Exact naming & official links | Passed | Email, phone, Instagram verified in markup. |
| R40 | Drive → library → Cloudinary workflow | Partial | Library + manifest implemented in the database; Drive and Cloudinary inspection blocked; no uploads (no credentials). |
| R41 | Image quality & responsive delivery | Partial | `f_auto,q_auto:good,c_limit` srcset 320–2000 px, natural ratio; delivered quality unverified (blocked). |
| R42 | Contact, enquiry & callback | Passed (email pending) | DB persistence, validation, spam/rate limits, admin status (QA, E2E probes). Email notification needs credentials; WhatsApp off pending verification. |

## Production checklist (spec §5, R01–R20)

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| R01 | Real luxury e-commerce | Partial | See master R01 |
| R02 | Correct brand identity | Complete | Master R02 |
| R03 | No fabricated data | Complete | No invented products, prices, specs, reviews, stock or claims; unknowns hidden |
| R04 | Drive/assets assessment | Complete | Access report + intake |
| R05 | Product catalogue intelligence | Blocked | Image grouping needs image access (two routes documented) |
| R06 | Cloudinary production media | Partial | Responsive delivery code complete; assets unverified |
| R07 | Product discovery | Complete | UT + E2E |
| R08 | Product detail | Complete | E2E |
| R09 | Cart and checkout | Complete (code) | UT + E2E |
| R10 | Payments | Blocked — provider credentials | Logic tested with stand-in; live untested |
| R11 | Orders / inventory | Complete | Integration (race, expiry) + E2E |
| R12 | Authentication / admin | Complete | E2E RBAC, audit |
| R13 | Security hardening | Complete (tested controls) · residual risks noted | E2E probes, integration tests, audit §3 |
| R14 | Accessibility | Partial | A11Y automated; manual SR pending |
| R15 | Mobile/device reliability | Complete (Chromium) | QA 360–1920 |
| R16 | Performance / SEO | Partial | SEO done; CWV unmeasured |
| R17 | Legal/trust readiness | Partial | Structure + placeholders; approval pending |
| R18 | Testing / QA | Complete (automated) | QA log |
| R19 | Deployment readiness | Partial | Documented; not deployed |
| R20 | Final production report | Complete | Final report to client |

## QA log (2026-10-07, local production build, Chromium)

| Suite | Result | Notes |
|---|---|---|
| `npm run typecheck` · `npm run lint` | Pass · Pass | — |
| `npm run build` | Pass | Clean production build (Next.js 16) |
| **UT** `npm test` | **31 / 31** pass | Discovery (filters, facets, typo search, related), cart validation and token isolation, guest→account cart merge, server totals, stock reservation, idempotent checkout, concurrent last-item race (no oversell), checkout readiness, payment amount/currency mismatch, duplicate settlement, expiry release, order state machine, order access (IDOR), DB rate limiter, Razorpay signature checks, test-API guard |
| **E2E** `npm run test:e2e` | **60 / 60** pass | Desktop (1440) and mobile (390) shoppers: shop → filters → typo search → empty-category 404 → price-pending Enquire → cart → validation → server-recalculated totals → payment verified server-side → order *Paid*, stock decremented, header cart cleared, order page 404 without owner/token. Tampered ₹1 payment rejected; account registration, role lock, wishlist merge, customer 404 on /admin; staff readiness, state transition + audit actor, explicit price-approval confirmation. Razorpay is a local stand-in (no keys) |
| Security probes (in E2E) | **17 / 17** pass | Injected total → 400 · quantity 11 / −5 → 400 · price-pending → 409 · client price field → 400 · missing Origin → 403 · cross-site → 403 · form-encoded enquiry → 415 · wishlist without session → 401 · malformed ids → 400 · forged payment signature → 400 · bad webhook signature → 400 · webhook replay ignored · no double-apply · /admin without session → redirect · cron without secret → 401 · DB total constraint |
| **A11Y** `npm run qa:a11y -- --staff=…` | **0 violations** on 60 targets | 23 storefront targets (incl. filter sheet, cart drawer, mobile menu, callback form, 404) + 7 admin pages, each in dark and light; axe-core WCAG 2.0/2.1 A + AA, WCAG 2.2 AA and best-practice rules |
| **QA** `npm run qa:screens -- --mock-images` | **No problems** | 17 pages at 360 · 390 · 768 · 1024 · 1440 · 1920 (alternating themes) + reduced-motion pass at 390: no horizontal overflow, exactly one h1, every image has alt text, no console errors. Journeys: mobile menu focus containment + Escape, header search, guest wishlist, product enquiry and callback stored with reference. Cloudinary photographs replaced by placeholders (domain blocked here) |
| Headers / SEO | Pass | CSP, HSTS (production), X-Content-Type-Options, Referrer-Policy, COOP, Permissions-Policy; `/api` no-store; `robots.txt` disallows and pages are `noindex` while `NEXT_PUBLIC_ALLOW_INDEXING` is off; sitemap lists only published pages |
| Secret scan | Clean | Tracked files and `.next/static` client bundles contain no keys or secret values; `.env.local` git-ignored |
| `npm audit --omit=dev` | 4 moderate | esbuild advisory via `drizzle-kit` (a peer of better-auth); development CLI only, not shipped to the server or browser |

**Not tested (and why):** Safari and Firefox, real phones and tablets, a manual screen-reader pass, Core Web Vitals / Lighthouse (needs a deployed preview), live or sandbox Razorpay (no keys), Resend email delivery (no key), the real product photographs (Cloudinary blocked by the build environment's network policy).
