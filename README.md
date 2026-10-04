# MAAIRA FASHION BAGS: digital flagship

The luxury storefront for **MAAIRA FASHION BAGS**, a brand of **Maanya Enterprises**, *Manufacturer of Luxury Designer Handbags*.

A multi-page editorial site with a working enquiry and callback backend. Product pages, a shop, the house story, editorial studies and client services are built around three sample pieces. **Selling is enquiry-led**: there is no cart or online payment until the business approves a sales model and a payment provider.

> ⚠️ **Before presenting:** the product-image grouping is **provisional**. The build environment could not open the Cloudinary photos, so bags were grouped by filename sequence only. Review `src/data/products.ts` against the real photos (see `docs/access-asset-readiness.md`).

## Quick start

```bash
npm install
cp .env.example .env.local   # then fill in what you need (see "Enquiries" below)
npm run dev                  # http://localhost:3000
npm run build && npm start   # production
```

Requires Node 22.6+ (developed on Node 22). The unit tests use Node's built-in TypeScript stripping.

| Script | Purpose |
|---|---|
| `npm run dev` · `npm run build` · `npm start` | Develop · build · serve |
| `npm run lint` · `npm run typecheck` | ESLint (Next core-web-vitals + TS) · TypeScript |
| `npm test` | Unit tests: enquiry validation, phone normalisation, rate limiter |
| `npm run qa:screens` | Playwright journeys across 5 viewport/theme combinations plus reduced motion (server must be running with `ENQUIRY_STORE=file`). Add `-- --mock-images` where Cloudinary is unreachable. |
| `npm run qa:a11y` | axe-core WCAG A/AA audit of every route, quick view and sound panel, both themes. Add `-- --admin=user:pass` to include the admin. |
| `npm run assets:brand` | Regenerate logo masks, icons, leather textures and the heat-stamp texture from the original logo |

## Routes

| Route | What it is |
|---|---|
| `/` | Hero (WebGL leather with a heat-stamped monogram), featured pieces, scroll study, house teaser, "in the round" 3D gallery, collection slides, enquiry band |
| `/shop` | Editorial or grid view of the pieces, quick view (`?piece=no-02` deep links) |
| `/shop/[slug]` | Product page: gallery (swipe, keys, zoom), every view, inline enquiry, more pieces, previous/next |
| `/house` | Brand facts, credentials, identity study, pieces |
| `/editorial` | Three campaign studies built from the authentic photos |
| `/contact` | Enquiry and callback forms (`?mode=callback&piece=no-01` preselects) |
| `/client-services` (+ `/shipping-returns`, `/privacy`, `/terms`) | FAQ and **draft** policy pages (clearly marked, `noindex`) |
| `/admin/enquiries` | Protected enquiry review (HTTP Basic; disabled unless configured) |
| `POST /api/enquiries` | Enquiry/callback endpoint |

## Enquiries & callbacks (backend)

`POST /api/enquiries` validates on the server with the same rules the form uses in the browser (`src/lib/enquiry/schema.ts`). It rejects cross-site posts, wrong content types and oversized bodies. It rate-limits each IP (5 per 10 minutes by default) and catches bots with a honeypot field and a timing trap. Retries with the same idempotency key return the original reference. The form shows success **only** when the server returns a reference.

Choose where requests go in `.env.local` (see `.env.example`):

1. **Supabase (recommended for hosted deployments):** apply `supabase/migrations/0001_enquiries.sql` (RLS on, no public access), then set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
2. **File:** `ENQUIRY_STORE=file` writes JSON lines to `.data/enquiries.jsonl` (permissions 600). It works on a single long-running Node server; **don't use it on serverless hosts**, where the disk isn't durable.
3. **Email notification (optional, in addition or alone):** `RESEND_API_KEY`, `ENQUIRY_NOTIFY_TO` and `ENQUIRY_NOTIFY_FROM`.

With none configured, the endpoint answers `503 not_configured`. The form then says plainly that online requests aren't connected, and offers a pre-filled email and the phone number, so nothing the visitor typed is lost.

**Admin:** set `ADMIN_USER` and `ADMIN_PASSWORD` (12+ characters) to enable `/admin/enquiries`. It lists requests with filters and per-row status updates (new, contacted, closed). Access is gated by `src/proxy.ts` and re-checked in every handler and server action. Without credentials the route returns 404.

## Sound

Sound is off by default and controlled from the header (sound on/off, optional ambience, volume). The engine is `src/lib/sound/engine.ts`. **No licensed audio has been supplied**, so the in-browser procedural fallbacks are used. To use real recordings, add files to `public/audio/` and flip `supplied: true` in `src/lib/sound/manifest.ts`; slots and formats are listed there. Unsupplied files are never requested.

## Updating products

`src/data/products.ts` holds each piece's name, tagline, description, price, colour, stage and images. Images reference `src/data/asset-manifest.ts`. Set a real price with `price: { amount: 24500, display: '₹24,500', status: 'client-approved' }`, and the "to be confirmed" note disappears. A `colour` value appears only once set. New pieces get a product page, shop card, ring plates and form option automatically.

## Project structure

```
src/
  app/                    routes (pages, API, admin), layout, tokens, 404/error
  components/
    hero/                 WebGL leather + heat-stamped monogram
    home/                 featured pieces, campaign study, 3D ring, enquiry band
    product/              card, frame, product page
    shop/ editorial/ house/ contact/ services/
    detail/ gallery/      quick-view dialog, shared gallery
    forms/                enquiry & callback form
    sound/ motion/        sound control; reveal text, tilt
  data/                   brand facts, products, asset manifest, site map
  lib/                    enquiry schema, sound engine, server (store, notify, auth, rate limit)
  proxy.ts                admin gate
supabase/migrations/      enquiries table
tests/                    unit tests
scripts/                  brand assets, QA
docs/                     audit, readiness, data gaps, decisions, traceability, master brief
```

## Behaviour notes

- **Themes:** Espresso (dark) and Ivory (light), applied before first paint and persisted.
- **Transitions:** route changes use the View Transitions API (product images morph from card to product page; the header stays anchored). Reduced motion disables them along with smooth scrolling, parallax, WebGL animation, particles, the 3D ring's drift and the custom cursor.
- **Images:** Cloudinary `f_auto,q_auto:good` with a responsive `srcset`. If that fails, the original URL is tried, then a brand panel is shown.
- **Security:** CSP and security headers (`next.config.ts`), server-only secrets, validated input, rate limiting, and a noindex admin.

## Deployment

Not deployed from this environment (no hosting credentials). For Vercel, set the environment variables above and use **Supabase** (not the file store) for enquiries. Any Node host works with `npm run build && npm start`.

## Documentation

- `docs/audit-2026-10.md`: design, motion, sound and backend audit (the starting point for this edition)
- `docs/access-asset-readiness.md`: what could and couldn't be accessed
- `docs/product-data-gaps.md`: missing product data and client questions
- `docs/creative-technical-decisions.md`: concept, design system, motion, 3D, sound and stack rationale
- `docs/requirements-traceability.md`: master-brief requirement status with evidence
- `docs/MAAIRA_MASTER_PROMPT.md`: the master brief (source of truth)
