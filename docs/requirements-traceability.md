# Requirements Traceability

**Edition:** sample showcase for client approval · **Updated:** 2026-10-03
**Status vocabulary:** Not started · In progress · Passed · Partial · Blocked · Not applicable

Evidence references: QA = `scripts/qa-screens.mjs` (Playwright: 5 viewport/theme combinations plus reduced motion); A11Y = `scripts/qa-a11y.mjs` (axe-core); docs in `docs/`.

## Master brief baseline (R01–R42)

| ID | Requirement | Status | Evidence / reason · dependency · next action |
|---|---|---|---|
| R01 | Real e-commerce, not a prototype | Partial | The showcase storefront works. Commerce was deliberately deferred: the creative brief scopes this edition to a client presentation, and the master brief forbids simulated commerce. **Next:** commerce build after approval (R18–R24). |
| R02 | Brand / business-name clarity | Passed | "MAAIRA FASHION BAGS" is the brand (header label, H1, House, footer); "Maanya Enterprises" is the business (House, footer, ©). The MAAIRA LUXURY lockup is used only as the logo. |
| R03 | Supplied credentials, no fabrication | Partial | Award and "10,00,000+" figure shown exactly, with no invented body, date or proof. **Dependency:** client verification before public release. |
| R04 | Drive / Instagram / logo access verified | Passed | `docs/access-asset-readiness.md` records actual scope: logo inspected; Cloudinary blocked; Drive folder metadata only; Instagram not scraped. |
| R05 | Asset inventory, originals preserved | Partial | Logo kept byte-identical (SHA-256 recorded); 9 URLs inventoried in `asset-manifest.ts`. **Blocked part:** image dimensions and contents not inspectable. |
| R06 | Product mapping + gap report | Partial | Provisional filename-sequence mapping with confidence `low`; `docs/product-data-gaps.md`. **Next:** visual verification once images are reachable. |
| R07 | Luxury research, originality | Not started | No external research in this phase (see decisions §6). The design is original, with no copied assets or layouts. **Next:** focused research pass for the full build. |
| R08 | Logo fidelity + palette | Passed | Masks are luminance keys of original pixels (`scripts/build-brand-assets.mjs`); palette sampled from the logo (silver ≈ #e1dfdc, espresso ≈ #1c1614); visual comparison done. |
| R09 | Typography & design system | Passed | Tokens in `globals.css`; OFL fonts self-hosted; consistent modules. |
| R10 | Independently art-directed dark/light | Passed (showcase scope) | Separate palettes, logo fills, leather parameters and stage tones. QA screenshots in both themes across hero, cards, dialog, slides and contact; theme toggle persistence tested (QA). |
| R11 | Non-blocking entrance | Passed | Hero reveal runs about 1.5s with no splash; content is in the DOM immediately; reduced-motion path renders statically (QA reduced run). |
| R12 | Purposeful motion + reduced-motion alternative | Passed | Decisions §4 table; `prefers-reduced-motion` disables Lenis, parallax, WebGL animation, particles and the cursor (QA reduced run: no problems). |
| R13 | WebGL only where justified | Passed | Raw WebGL hero only; pauses when offscreen, hidden or covered; CSS fallback when WebGL is unavailable. |
| R14 | Authentic product imagery | Partial | No pixel alteration, compositing or generation; framing is CSS. **Dependency:** grouping not visually verified. |
| R15 | Complete site architecture | Partial | Single-page showcase (home, pieces, house, collection, contact) plus deep-linkable piece dialog. PLP, PDP routes, cart, account and policy pages not built (scope). |
| R16 | Search / filter / sort | Not started | Three pieces and no verified attributes, so filters would be empty (§7.1). |
| R17 | Product detail & gallery | Partial | Dialog with thumbnails, ← → keys, touch swipe, desktop zoom, focus trap and URL state (QA). Verified details and add-to-cart pending data and commerce. |
| R18 | Cart, server totals | Not started | Deferred to the commerce phase. |
| R19 | Checkout & payment security | Not started | No payment gateway selected or authorised. |
| R20 | Orders, fulfilment, notifications | Not started | Deferred. |
| R21 | Customer accounts | Not started | Deferred. |
| R22 | Optional commerce enhancements | Not applicable | None enabled. |
| R23 | Backend / database | Not started | Deferred; Next.js chosen partly to host it later. |
| R24 | Admin dashboard | Not started | Deferred. |
| R25 | Security, privacy, legal readiness | Partial | CSP, `nosniff`, `frame-ancestors 'none'`, Referrer-Policy and Permissions-Policy (verified with `curl -I`); no secrets; no personal data collected. `npm audit`: 5 high findings, all in dev-only lint tooling (`braces` via `eslint-config-next`), none in runtime dependencies. Legal pages need client-approved text. |
| R26 | Optional user-controlled sound | Passed | Off by default; `aria-pressed` toggle (QA); synthesised with Web Audio, so there are no files and no licensing. |
| R27 | Mobile-first responsive | Passed (showcase scope) | QA at 390×844, 834×1112 and 1440×900: no horizontal overflow, touch carousel, stacked dialog, 44px targets. |
| R28 | WCAG 2.2 AA target | Partial | Token contrast all ≥ 5.0:1; axe-core (WCAG 2.0/2.1/2.2 A+AA plus best practice) reports **0 violations** on home and dialog in both themes; keyboard dialog, focus trap and return, Escape, arrow keys (QA). **Not done:** manual screen-reader pass (VoiceOver / TalkBack), 200% zoom review. |
| R29 | Performance / CWV | Partial | Measured home-page first load: 235 KB JS + 11 KB CSS (gzip, 9 files) and a 7 KB HTML document; textures and masks 252 KB total; product images are lazy, responsive Cloudinary derivatives. WebGL pauses when off screen, hidden or covered; DPR is capped. **Not measured:** Lighthouse / Core Web Vitals on real devices. **Next:** measure on the deployed preview. |
| R30 | SEO & structured data | Partial | Metadata and OG present; `noindex` intentionally on while prices are placeholders; no product structured data (unverified facts). |
| R31 | Privacy-conscious analytics | Not started | No approved analytics tool; none installed. |
| R32 | Tool / service review | Passed | Decisions §5. |
| R33 | Architecture & docs | Passed | README and `docs/`. |
| R34 | Efficiency without quality loss | Passed | Single data files drive the UI; reproducible asset pipeline; automated QA. |
| R35 | Phased workflow & gates | Partial | Phase 1 report delivered. Implementation proceeded on the requester's instruction despite the image-access blocker, which is flagged throughout. |
| R36 | QA across journeys | Partial | Automated showcase journeys pass (below). No unit tests yet (little logic outside UI). Admin and commerce journeys not applicable yet. |
| R37 | Deployment readiness | Not started | Not deployed: no hosting credentials or authorisation. Build is deployable (README). |
| R38 | Final audit & handover | Partial | This document plus README and docs. |
| R39 | Exact naming & official links | Passed | `mailto:maairabags@gmail.com`, `tel:+919871171112` and the Instagram URL render correctly. The live Instagram page was not fetched. |
| R40 | Drive → library → Cloudinary workflow | Blocked | Drive children not listable; Cloudinary not reachable from the environment. **Client action:** see readiness report §5. |
| R41 | Image quality & responsive delivery | Partial | `f_auto,q_auto:good,c_limit` srcset ladder of 480–2000px, plus a fallback chain. Delivered quality not visually verified (blocked). |
| R42 | Contact, enquiry & callback | Partial | Email, phone and Instagram links work; per-piece pre-filled enquiry email. Forms and callback requests not built: no backend or approved destination, and the brief says to omit rather than simulate. WhatsApp off pending verification. |

## Showcase acceptance (creative-direction brief §13)

| ID | Check | Status | Evidence |
|---|---|---|---|
| S01 | Only 2–3 distinct sample bags shown | Passed* | 3 pieces in `products.ts`. *Distinctness unverified (see R06). |
| S02 | Angles of one bag grouped under one product | Partial | Provisional grouping by filename. |
| S03 | Images represent the actual bags | Blocked | Images not viewable from the build environment. |
| S04 | Backgrounds complement and preserve authenticity | Partial | Stages surround untouched photos; colour pairing to the bags still to be confirmed. |
| S05 | Descriptions based on visible / confirmed details | Passed (conservatively) | No physical claims made; copy flagged as draft. |
| S06 | Every piece shows ₹XXXX | Passed | Cards and dialog (screenshots). |
| S07 | Click or tap opens expanded detail | Passed | QA: URL updates, focus moves to the close button. |
| S08 | Gallery images belong to the product | Partial | Structurally enforced per product; visual check pending. |
| S09 | Empty slides look intentional | Passed | Four editorial slides with no fake products, counts or collection names (screenshots). |
| S10 | Smooth, restrained, performant animation | Passed | Visual review; render-loop pausing. |
| S11 | Responsive across screen sizes | Passed | QA matrix. |
| S12 | Navigation & features functional | Passed | QA: nav, menu (Escape), theme, sound, dialog, deep links, swipe. |
| S13 | Image failures handled gracefully | Passed | Cloudinary blocked in the environment: the brand panel renders, with no broken icons. |
| S14 | Accessibility & reduced motion respected | Partial | See R28. |
| S15 | No fake products, specs, prices, reviews or claims | Passed | Content audit of `products.ts`, `brand.ts` and components. |

## QA log (2026-10-03, local production build)

Commands run against `next start` with Chromium (SwiftShader WebGL):

| Check | Command | Result |
|---|---|---|
| Types | `npm run typecheck` | Pass |
| Lint | `npm run lint` | Pass (0 errors, 0 warnings) |
| Build | `npm run build` | Pass (static prerender of `/`) |
| Journeys + screenshots | `node scripts/qa-screens.mjs --mock-images` | **No problems detected** on desktop-dark, desktop-light, tablet-light, mobile-dark, mobile-light and desktop-light-reduced. Covers open/close, URL sync, focus to close and back to trigger, Escape, ← →, deep link, theme toggle + persistence, sound toggle, mobile menu Escape, thumbnails, touch swipe (CDP touch events), horizontal overflow, and console/page errors. |
| Accessibility | `node scripts/qa-a11y.mjs` | **0 violations** (dark/home, dark/dialog, light/home, light/dialog) |
| Headers | `curl -I /` | CSP, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy present |

**Caveat:** `--mock-images` replaces Cloudinary responses with a grey "TEST IMAGE" card because the environment can't reach Cloudinary. It verifies layout only. Real image rendering, crops and colour pairing are unverified. Without the flag, the fallback panel renders, which confirms the failure handling.

Defects found and fixed during QA: coarse leather texture (regenerated); hydration mismatch under reduced motion (mount-safe media query); dialog exit too slow and still interactive while closing (shortened, `inert` while exiting); menu exit inheriting entrance delays; hover-zoom blocking touch swipe (zoom limited to fine pointers); a WebGL texture callback after cleanup (guarded); hero rendering behind open overlays (now paused); "of 03" counter contrast (axe).
