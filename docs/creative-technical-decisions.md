# Creative & Technical Decision Record

The original showcase edition (sections 1–6), plus the flagship upgrade of 2026-10-04 (section 7). The audit that drove the upgrade is in `docs/audit-2026-10.md`.

## 1. How the two briefs were reconciled

| Topic | Master brief | Creative direction brief | Resolution |
|---|---|---|---|
| Scope | Full e-commerce: cart, checkout, payments, accounts, admin | 2–3 sample pieces for a client presentation; "do not introduce unrelated features" | Built the presentation showcase. Commerce rows stay **Not started** in the traceability matrix rather than being simulated (master brief §22 forbids dead buttons and fake commerce). |
| Purchase action | Add to cart / checkout | Expandable detail view | **"Enquire about this piece"** (pre-filled `mailto:`) and **Call** (`tel:`). Both are real and use client-supplied contacts. |
| Existing site | "Preserve existing work" | "Enhance the existing website" | The repository was empty. Nothing existed to preserve, so the site was built new. |
| Indexing | SEO-ready | Placeholder prices (₹XXXX) | `noindex, nofollow` until `NEXT_PUBLIC_ALLOW_INDEXING=true`, so placeholder pricing is never indexed. |
| Brand credentials | Use the supplied award and figure, pending verification | "Do not fabricate awards or sales figures" | They are client-supplied, not fabricated. Shown exactly, with nothing added, and flagged for verification. |
| AI backgrounds / compositing | Never misrepresent products | Generate backgrounds where tools exist | No image-generation tool was available, and the product images weren't reachable. Backgrounds are CSS and procedural "stages" *around* the untouched photo. Nothing was composited or generated. |

## 2. Creative concept

**Crazy Elegance: quiet luxury, reimagined through immersive digital craftsmanship** (master brief §4), expressed as:

- **The logo's world as the opening scene.** The hero is the logo's composition (silver monogram on dark leather) brought to life. A real-time lit leather surface responds to the pointer, and the monogram's glint and shadow follow the light.
- **Material as language.** Leather finishes appear on purpose, in five places only: the hero, the credential tags, the dialog's info panel, two catalogue slides and the contact panel. Everything else is quiet ivory or espresso space.
- **Gallery framing.** Each photograph sits in a passe-partout mat on a "stage", like a print in a gallery. This keeps the product untouched while giving it a luxury setting.
- **Restraint.** One accent colour per theme, two typefaces, hairline rules and generous whitespace.

## 3. Design system

| Token group | Espresso (dark) | Ivory (light) |
|---|---|---|
| Background | `#17110e` | `#f6f1e9` |
| Ink / soft / muted | `#efe8dd` / `#cdbfae` / `#a8998a` | `#241a15` / `#4a3b32` / `#6b5b4f` |
| Accent | `#cdb38c` champagne | `#86643f` caramel |
| Logo fill | Silver gradient (sampled from logo ≈ `#e1dfdc`) | Espresso gradient |

- **Contrast:** every text/background token pair was measured against WCAG. The lowest is 5.02:1 (muted ink on the light surface), so all pairs pass AA for normal text.
- **Type:** Cormorant Garamond (display; echoes the monogram's flared serifs) and Jost (UI and body; a geometric sans close to the wordmark's thin letterforms). Both are SIL OFL 1.1, self-hosted via `@fontsource-variable`, so the site makes no third-party font requests.
- **Motion tokens:** `--ease-out: cubic-bezier(.22,1,.36,1)` for reveals; `--ease-in-out: cubic-bezier(.65,0,.35,1)` for wipes and shared transitions; durations of 240ms (UI), 600ms (hovers) and 1.1–1.5s (cinematic reveals).

## 4. Motion & 3D: what is used and why

| Effect | Where | Why it earns its place | Fallback |
|---|---|---|---|
| WebGL leather lighting (raw WebGL, ~4 KB shader; no Three.js) | Hero | Signature brand moment derived from the logo; turns the grain into tangible depth | Static CSS leather (`.leather`); a single static frame under reduced motion |
| Dust motes in the light beam (2D canvas, 16–34 particles) | Hero | Soft atmosphere, visible only inside the light | Off under reduced motion |
| Monogram tilt + light-driven shadow and glint | Hero | Gives the logo physical depth | Static |
| Shared-element transition (card frame → dialog frame) | Pieces | Keeps context; feels like lifting the piece off the wall | Fade under reduced motion |
| Pointer tilt, glare and dynamic shadow | Piece cards (fine pointers) | Tactile "picking up" cue | None needed (touch shows a "View" hint) |
| Scroll parallax (frame against backdrop) | Cards, House watermark, slides | Layered depth | Disabled under reduced motion |
| Pinned horizontal slides | Collection (desktop + hover) | Cinematic pause between product and contact | Swipe or scroll-snap carousel with buttons (touch, tablet, reduced motion) |
| Smooth wheel scrolling (Lenis) | Page | Unhurried pace | Native scrolling (touch and reduced motion) |
| Theme change as a circular reveal (View Transitions) | Theme toggle | A refined moment instead of a flash | Instant swap |
| Follower cursor ring with labels ("View", "Drag", "Close") | Desktop | Quiet affordance | Hidden on touch and reduced motion; **the native cursor is never hidden** |
| Synthesised interface sounds (Web Audio) | Open/close/tick | Tactile, optional | **Off by default**; visible toggle; no audio files, so no licensing |

**Performance guards.** The WebGL render loop runs only while the hero is on screen, the tab is visible and no dialog or menu covers the page. Device pixel ratio is capped at 1.5 (1.25 on phones), and the grain scale adapts to the viewport.

**Not used, and why.** There are no Three.js or 3D bag models: no legitimate 3D assets exist, and an invented model would misrepresent the product. There's no GSAP (Motion covers every need with one dependency) and no autoplay video or audio.

## 5. Stack

| Choice | Reason | Cost / risk |
|---|---|---|
| Next.js 16 (App Router) + TypeScript | Static-first today; route handlers, server actions and SSR for the later commerce phase | OSS; deploys anywhere Node runs (Vercel recommended for the frontend) |
| Motion 12 | Layout and shared-element animations, scroll-linked values, built-in reduced-motion support | OSS |
| Lenis 1.3 | Lightweight smooth wheel scrolling | OSS, ~4 KB |
| `@fontsource-variable/*` | Self-hosted OFL fonts | OSS |
| Cloudinary (delivery only) | Responsive formats and sizes from the URLs supplied | Client's account. No credentials used. |
| sharp (dev only) | Reproducible brand-asset derivatives | OSS |
| Playwright + axe-core (dev only) | Visual, journey and accessibility QA | OSS |

## 6. Research note

No external market research was carried out in this phase. The design follows general luxury e-commerce principles: product-first framing, restrained palettes, editorial typography, unhurried motion and transparent pricing language. It is not modelled on any specific house's site, layout, copy or assets. A focused research pass (master brief §4) remains open for the full build (R07).


## 7. Flagship upgrade (2026-10-04)

### 7.1 Architecture

- **Single page → routed site:** `/`, `/shop`, `/shop/[slug]`, `/house`, `/editorial`, `/contact`, `/client-services/*`, `/admin/enquiries` and `POST /api/enquiries`. The header, footer, sound and cursor live in the root layout.
- **Sales model:** enquiry-led. The cart and payments remain unbuilt rather than simulated (master brief §22). Whether to sell directly online is an open business decision.
- **Retired:** the single-file HTML build. A site with server routes can't be one offline file; review it on a hosted preview instead.

### 7.2 Signature 3D and motion

| Element | Why | Implementation | Fallback |
|---|---|---|---|
| **Heat-stamped monogram** | A handbag maker's mark is literally stamped into leather. The hero now does exactly that: the logo is debossed into the grain, foil-filled, and lit by the same moving light. | Fragment shader combines the leather height map with a stamp texture derived from the original logo pixels (crisp mask, bevel, occlusion). Hot-foil press intro: the die lands, then the foil sweeps. Silver foil in dark, espresso pigment in light. | DOM logo mask (no WebGL, or the texture fails); one static frame under reduced motion |
| **"In the round" gallery** | Discovery: every photographed view on one cylinder; choosing one opens its piece | CSS 3D (`preserve-3d`), drag with inertia snap, arrow buttons, focus-to-front, idle drift, per-plate shading by facing angle | No drift under reduced motion; buttons and links always work |
| **Campaign study** | Storytelling: one piece turns through its real photographed views as you scroll, under a travelling light | Sticky section; scroll-linked crossfades and chapter captions (keyframe windows clamped to [0, 1] for WAAPI acceleration) | Static triptych under reduced motion |
| **Shared-element routing** | Continuity: the photo you click travels to the product page | React `<ViewTransition name>` on card and product-page frames; directional page slides; anchored header | Instant under reduced motion |
| **Editorial studies** | Three distinct compositions (presence, form, contrast) instead of repeated cards | Scroll-linked parallax per layer | Static |
| **Text reveals** | One deliberate headline treatment instead of generic fade-ups | `RevealText`: masked word rise | Fade |

Three.js was again not adopted. Raw WebGL (hero) and CSS 3D (ring) cover the need with no new dependency.

### 7.3 Sound

The engine has a master gain, a cue bus with a procedural room reverb, an ambience bus and a compressor. Cues cover open, close, tick, page, success and error. Ambience is a generated room tone (opt-in). The control offers on/off, ambience and volume, persists choices, resumes only after a user gesture, suspends while the tab is hidden, and fully suspends on mute. **No licensed recordings exist yet**; the manifest lists the slots to supply.

### 7.4 Backend

- **Validation:** shared client/server rules; phone numbers normalised to E.164 (10-digit Indian mobiles get +91).
- **Abuse protection:** honeypot, timing trap, per-IP sliding-window limit, same-origin check, JSON-only, 10 KB body cap.
- **Integrity:** idempotency keys de-duplicate retries; references like `EQ-…` / `CB-…`.
- **Storage adapters:** Supabase (PostgREST over fetch, RLS-locked table, migration included), a JSON-lines file (single server), or neither (honest 503).
- **Email:** optional Resend notification with HTML-escaped content.
- **Admin:** HTTP Basic via `proxy.ts`, re-verified in handlers and server actions; disabled (404) unless credentials are set; `noindex` and `no-store`.

## 8. E-commerce-first edition (2026-10-07)

The brief now ranks commerce above effects ("E-COMMERCE ALWAYS WINS"). Decisions:

- **Kept:** the heat-stamped leather hero (brand recognition at a glance), both art-directed themes, the gallery, sound (off by default, now in the footer and menu), the custom cursor (fine pointers only).
- **Changed:** hero copy and CTA appear within 0.5 s; commerce pages use a compact header (no word-reveal animation) so products are reached immediately; product photos are shown at their own aspect ratio inside a thin mat, never cropped; route transitions are short fades.
- **Removed from the shopping path:** the 3D gallery ring, pinned collection slides, Lenis smooth scrolling, quick view, and the scroll-pinned campaign study on home (moved to /editorial).
- **Language:** plain words first ("Shop bags", "Add to cart", "Checkout", "Cart" rather than "Bag" — on a handbag store "bag" is ambiguous); icons support text, never replace it.
- **Data-driven merchandising:** categories, filters, sorts, "New arrivals" and "Shop by" sections only appear when real data supports them, so the store grows into its taxonomy instead of advertising empty shelves.
