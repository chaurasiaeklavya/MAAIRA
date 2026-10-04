# MAAIRA FASHION BAGS: digital flagship (sample showcase edition)

The luxury storefront for **MAAIRA FASHION BAGS**, a brand of **Maanya Enterprises**, *Manufacturer of Luxury Designer Handbags*.

This edition is a **client-presentation showcase**: an editorial home page, three sample pieces with an expandable detail view, minimal catalogue slides, and real contact paths. Commerce (cart, checkout, payments, accounts, admin) is deliberately out of scope until the showcase is approved. See `docs/requirements-traceability.md`.

> ⚠️ **Before presenting:** the product-image grouping is **provisional**. The build environment couldn't open the Cloudinary images, so the bags were grouped by filename sequence only. Review `src/data/products.ts` against the real photos first (see `docs/access-asset-readiness.md`).

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
```

Requires Node 20+ (developed on Node 22).

| Script | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` · `npm run typecheck` | ESLint (Next core-web-vitals + TS) · TypeScript |
| `npm run assets:brand` | Regenerate logo masks, icons and leather textures from the original logo |
| `npm run qa:screens` | Playwright journeys and screenshots (server must be running). Add `-- --mock-images` where Cloudinary is unreachable. |
| `node scripts/qa-a11y.mjs` | axe-core WCAG A/AA audit, both themes, home page + dialog |
| `npm run build:single` | One self-contained `dist/maaira-showcase.html` (see below) |
| `npm run qa:single` | Tests that file opened from disk (`file://`) with networking blocked |

Playwright scripts look for Chromium at `/opt/pw-browsers/chromium`. Change `executablePath` in the scripts if yours is elsewhere.

## Updating products (the one file to edit)

`src/data/products.ts` holds each sample piece: name, tagline, description, price, colour, stage background and image list. Images are referenced by ID from `src/data/asset-manifest.ts`, which records every supplied Cloudinary URL.

- **Price:** set `price: { amount: 24500, display: '₹24,500', status: 'client-approved' }`. The "to be confirmed" note disappears automatically.
- **Colour:** set `colour: 'Espresso'`. The detail view shows the row only when a value is set.
- **Images:** reorder or reassign `images: [{ assetId, role: 'primary' | 'angle' | 'detail', alt }]`. The first `primary` image becomes the card image.
- **Background:** `stage: 'champagne-studio' | 'ivory-plaster' | 'espresso-leather'`.
- **New image:** add one `asset(version, publicId)` line to the manifest.

Brand facts (contacts, credentials, WhatsApp flag) live in `src/data/brand.ts`.

## Project structure

```
src/
  app/                 layout (metadata, theme pre-paint script), page, global tokens
  components/
    hero/              WebGL leather surface + hero composition
    showcase/          piece cards, material stages, section + URL state
    detail/            full-screen piece dialog (gallery, zoom, swipe, enquiry)
    collection/        editorial catalogue slides (pinned or carousel)
    Header, House, Contact, Footer, Cursor, CloudImage, ExperienceProvider
  data/                brand facts, asset manifest, products
  lib/                 Cloudinary URLs, sound, cursor store, media query hook
public/brand/          original logo (unmodified) + derived masks
public/textures/       procedural leather grain (original work)
scripts/               brand-asset builder, QA scripts
docs/                  readiness report, data gaps, decisions, traceability
```

## Behaviour notes

- **Themes:** Espresso (dark) and Ivory (light). The first visit follows the OS setting; the choice persists in `localStorage` and is applied before first paint.
- **Deep links:** `/?piece=no-02` opens a piece directly. Back and Forward open and close the dialog.
- **Accessibility:** skip link, landmarks, a focus-trapped dialog with focus returned to the trigger, keyboard gallery (← →, Esc), 44px touch targets, and `prefers-reduced-motion` honoured everywhere (smooth scrolling, parallax, WebGL animation, particles and the custom cursor all switch off).
- **Images:** Cloudinary `f_auto,q_auto:good` with a responsive `srcset`. If a transformed URL fails, the exact supplied URL is retried; if that fails too, a composed brand panel replaces the image.
- **Security:** CSP and security headers (`next.config.ts`), no secrets in the client bundle, no forms or personal-data collection in this edition.

## Single-file HTML (for sharing or offline review)

`npm run build:single` writes **`dist/maaira-showcase.html`** (~1.4 MB), which opens by double-click with no server. Scripts, styles, fonts (Latin subsets), leather textures, logo masks and icons are all inlined. Product photos remain Cloudinary links, so they need an internet connection; offline, the brand panel shows in their place.

When opened from disk, the address bar doesn't change on opening a piece (browsers restrict the History API on `file://`), so deep links work only on the hosted site.

## Environment

Copy `.env.example` to `.env.local`:

| Variable | Meaning |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for metadata |
| `NEXT_PUBLIC_ALLOW_INDEXING` | Leave `false` until real prices and data are approved |

## Deployment

Not deployed yet. This is a standard Next.js app: `npm run build`, then `npm start` on any Node host, or import the repo into Vercel. Set the variables above. No other services are needed for this edition.

## Documentation

- `docs/access-asset-readiness.md`: what could and couldn't be accessed, and the client actions needed
- `docs/product-data-gaps.md`: missing product data and client questions
- `docs/creative-technical-decisions.md`: concept, design system, motion and stack rationale
- `docs/requirements-traceability.md`: master-brief requirement status with evidence
