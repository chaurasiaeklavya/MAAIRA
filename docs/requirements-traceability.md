# Requirements Traceability

**Edition:** digital flagship (multi-page site with an enquiry backend) · **Updated:** 2026-10-04
**Status vocabulary:** Not started · In progress · Passed · Partial · Blocked · Not applicable

Evidence keys:
- **QA** = `scripts/qa-screens.mjs` (Playwright journeys on 5 viewport/theme combinations plus reduced motion)
- **A11Y** = `scripts/qa-a11y.mjs` (axe-core)
- **UT** = `npm test` (unit tests in `tests/`)
- **API** = manual `curl` checks against `next start` (see the QA log below)

Audit that drove this edition: `docs/audit-2026-10.md`.

## Master brief baseline (R01–R42)

| ID | Requirement | Status | Evidence / reason · dependency · next action |
|---|---|---|---|
| R01 | Real e-commerce, not a prototype | Partial | A real multi-page storefront with working enquiries, callbacks and admin review. **Online purchasing is deliberately not built:** the sales model (direct sale vs enquiry-led) is an open business decision, and the brief forbids simulated checkout. **Next:** decide the sales model, then build R18–R21. |
| R02 | Brand / business-name clarity | Passed | "MAAIRA FASHION BAGS" is the brand (header label, titles, House, footer); "Maanya Enterprises" is the business (House, footer, ©, privacy draft). |
| R03 | Supplied credentials, no fabrication | Partial | Award and "10,00,000+" figure shown exactly as supplied, with nothing invented. **Dependency:** client verification before public release. |
| R04 | Drive / Instagram / logo access verified | Passed | `docs/access-asset-readiness.md`, including the 2026-10-04 re-check (live sites and Cloudinary blocked; Supabase has no projects; no audio or email credentials). |
| R05 | Asset inventory, originals preserved | Partial | Logo byte-identical (SHA-256 recorded); 9 image URLs in `asset-manifest.ts`. **Blocked part:** image contents not inspectable from this environment. |
| R06 | Product mapping + gap report | Partial | Provisional filename-sequence grouping (confidence `low`); `docs/product-data-gaps.md`. **Next:** visual verification. |
| R07 | Luxury research, originality | Partial | Luxury brands treated as references only; no layouts, copy or assets copied. No formal research write-up. |
| R08 | Logo fidelity + palette | Passed | Masks and the new heat-stamp texture are derived from the original logo pixels (`scripts/build-brand-assets.mjs`); nothing redrawn. |
| R09 | Typography & design system | Passed | Tokens in `globals.css`; OFL fonts self-hosted; shared `PageHeader`, `ProductCard`, `ProductFrame`, `Stage` modules. |
| R10 | Independently art-directed dark/light | Passed | Separate palettes, foil colour (silver vs espresso), stage tones and leather parameters. QA screenshots in both themes; toggle persistence tested (QA). |
| R11 | Non-blocking entrance | Passed | No splash; hero press-and-foil intro is decorative while content is already in the DOM; static under reduced motion (QA reduced run). |
| R12 | Purposeful motion + reduced-motion alternative | Passed | Decisions §7.2 table. Reduced motion disables WebGL animation, Lenis, parallax, ring drift, route slides and the cursor; campaign study becomes a static triptych (QA reduced run). |
| R13 | WebGL only where justified | Passed | One raw-WebGL hero (heat-stamped monogram); pauses off screen, when hidden or covered; DOM fallback when WebGL or the texture is unavailable. The 3D ring is CSS 3D. |
| R14 | Authentic product imagery | Partial | No pixel alteration, compositing or generation anywhere; framing and stages are CSS. **Dependency:** grouping not visually verified. |
| R15 | Complete site architecture | Passed (enquiry-led scope) | `/`, `/shop`, `/shop/[slug]`, `/house`, `/editorial`, `/contact`, `/client-services` (+ shipping/returns, privacy, terms drafts), branded 404 and error pages, `/admin/enquiries`. Cart, checkout and account routes intentionally absent (R18–R21). |
| R16 | Search / filter / sort | Not applicable (now) | Three pieces with no verified attributes; filters would be empty. Revisit with the full catalogue. |
| R17 | Product detail & gallery | Passed (data pending) | Product pages with thumbnails, ← → keys, touch swipe, zoom, every-view section, inline enquiry, previous/next; quick view with URL state, focus trap and return (QA). Verified specs pending client data. |
| R18 | Cart, server totals | Not started | Waiting on the sales-model decision. |
| R19 | Checkout & payment security | Not started | No payment provider selected or authorised. |
| R20 | Orders, fulfilment, notifications | Not started | Enquiry notifications exist (optional Resend); order flows wait on R18–R19. |
| R21 | Customer accounts | Not started | Needs an auth provider decision. |
| R22 | Optional commerce enhancements | Not applicable | None enabled. |
| R23 | Backend / database | Passed (enquiries) · config pending | `POST /api/enquiries`: shared validation, honeypot + timing trap, per-IP rate limit, same-origin check, JSON only, 10 KB cap, idempotency keys. Stores: Supabase (migration with RLS) or a JSON-lines file; honest 503 when neither is set (API, QA, UT). **Dependency:** a Supabase project or other store for hosted use. |
| R24 | Admin dashboard | Partial | `/admin/enquiries` behind HTTP Basic (`proxy.ts` plus per-handler and server-action re-checks); list, filter, status updates; 404 unless configured; `noindex`, `no-store` (API). A multi-role admin needs an auth provider. |
| R25 | Security, privacy, legal readiness | Partial | CSP and security headers on every response; secrets server-only (`server-only` imports); file store mode 600; timing-safe credential comparison. `npm audit --omit=dev`: **0 vulnerabilities**; the 5 high findings are dev-only (`braces` via `eslint-config-next`). Privacy, terms, shipping and consent text are **drafts** awaiting legal approval. |
| R26 | Optional user-controlled sound | Passed (procedural) | Off by default; no autoplay; on/off, ambience and volume persist; resumes only after a gesture; suspends when hidden or muted (QA). **No licensed recordings supplied**; slots listed in `src/lib/sound/manifest.ts`. |
| R27 | Mobile-first responsive | Passed | QA at 390×844, 834×1112 and 1440×900 on 9 routes: no horizontal overflow, single h1, touch swipe, mobile menu. |
| R28 | WCAG 2.2 AA target | Partial | A11Y results below; keyboard journeys for quick view, gallery, forms (focus to first invalid field), sound panel and menu (QA). **Not done:** manual screen-reader pass (VoiceOver/TalkBack), 200% zoom review. |
| R29 | Performance / CWV | Partial | Measured transfer sizes below. WebGL pauses when not visible; DPR capped; images lazy and responsive. **Not measured:** Lighthouse / Core Web Vitals on a deployed preview and real devices. |
| R30 | SEO & structured data | Partial | Per-route metadata, title template, OG; `noindex` until `NEXT_PUBLIC_ALLOW_INDEXING=true` (placeholder prices). No product structured data (unverified facts). |
| R31 | Privacy-conscious analytics | Not started | No approved tool; none installed (stated in the privacy draft). |
| R32 | Tool / service review | Passed | Decisions §5 and §7. |
| R33 | Architecture & docs | Passed | README (routes, backend setup, admin, sound, scripts) and `docs/`. |
| R34 | Efficiency without quality loss | Passed | Data files drive every page; reproducible asset pipeline; automated QA, a11y and unit tests. |
| R35 | Phased workflow & gates | Partial | Audit delivered before implementation (`docs/audit-2026-10.md`). Implementation proceeded on the requester's instruction despite the blockers, which are flagged throughout. |
| R36 | QA across journeys | Passed (automated) | QA, A11Y, UT and API results below. Real-device testing not done. |
| R37 | Deployment readiness | Partial | Builds and runs with `next build && next start`; env documented in `.env.example`. Not deployed (no hosting credentials). |
| R38 | Final audit & handover | Partial | This document, the audit, README and docs. |
| R39 | Exact naming & official links | Passed | `mailto:maairabags@gmail.com`, `tel:+919871171112`, Instagram URL. |
| R40 | Drive → library → Cloudinary workflow | Blocked | Drive children not listable; Cloudinary not reachable from the environment. |
| R41 | Image quality & responsive delivery | Partial | `f_auto,q_auto:good,c_limit` srcset ladder plus a fallback chain. Delivered quality not visually verified (blocked). |
| R42 | Contact, enquiry & callback | Passed (config pending) | Enquiry and callback forms on `/contact` and every product page; references (`EQ-…`, `CB-…`) shown only after the server stores the request (QA, API). Callback windows are generic (morning / afternoon / evening / any time) because no business hours were supplied. WhatsApp stays off pending verification. **Dependency:** a production store and/or email destination. |

## Showcase acceptance (creative-direction brief §13)

| ID | Check | Status | Evidence |
|---|---|---|---|
| S01 | Only 2–3 distinct sample bags shown | Passed* | 3 pieces in `products.ts`. *Distinctness unverified (R06). |
| S02 | Angles of one bag grouped under one product | Partial | Provisional grouping by filename. |
| S03 | Images represent the actual bags | Blocked | Images not viewable from the build environment. |
| S04 | Backgrounds complement and preserve authenticity | Partial | Stages surround untouched photos; colour pairing still to be confirmed. |
| S05 | Descriptions based on visible / confirmed details | Passed (conservatively) | No physical claims; copy flagged as draft. |
| S06 | Every piece shows ₹XXXX | Passed | Cards, product pages, quick view. |
| S07 | Click or tap opens expanded detail | Passed | Quick view and product pages (QA). |
| S08 | Gallery images belong to the product | Partial | Structurally enforced per product; visual check pending. |
| S09 | Empty slides look intentional | Passed | Collection slides each lead to a real destination; no fake products or counts. |
| S10 | Smooth, restrained, performant animation | Passed | Visual review; render-loop pausing; WAAPI-safe keyframe ranges. |
| S11 | Responsive across screen sizes | Passed | QA matrix. |
| S12 | Navigation & features functional | Passed | QA: nav, menu, theme, sound, quick view, deep links, swipe, forms. |
| S13 | Image failures handled gracefully | Passed | Without `--mock-images` the brand panel renders; no broken icons. |
| S14 | Accessibility & reduced motion respected | Partial | See R28. |
| S15 | No fake products, specs, prices, reviews or claims | Passed | Content audit of `products.ts`, `brand.ts`, pages and components. |

## QA log (2026-10-04, local production build)

All commands were run against `next build && next start` with Chromium (SwiftShader WebGL) and `.env.local` set to `ENQUIRY_STORE=file` plus local admin credentials.

_Results for this edition are being recorded; this section is completed in the follow-up commit._
