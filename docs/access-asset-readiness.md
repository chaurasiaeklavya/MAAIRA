# Access & Asset Readiness Report

**Project:** MAAIRA FASHION BAGS (Maanya Enterprises): sample showcase edition
**Date:** 2026-10-03
**Scope:** Phase 1 inspection (master brief §2, §3, §18), carried out before the showcase was built

## 1. Sources attempted

| Source | Method | Result | Scope actually inspected |
|---|---|---|---|
| Git repository `chaurasiaeklavya/MAAIRA` | Local clone + `git ls-remote` | **Empty**: no commits, branches or files | None existed. No "existing website" to preserve; the showcase was built new. |
| Official logo (`MAAIRA LUXURY` lockup) | File attached to the request | **Available** (1080×1080 JPEG, sRGB) | Fully inspected. Element bounds measured, palette sampled (silver ≈ `#e1dfdc`, espresso background ≈ `#1c1614`). |
| Cloudinary delivery URLs (9 images, cloud `h1ztqjkg`) | `curl` and WebFetch | **Blocked**: the environment's egress policy denied `res.cloudinary.com` (HTTP 403 on CONNECT) | **None.** No image could be opened, measured or compared. |
| Google Drive folder "PRODUCT SHOOT(BAG)" (`1b9lzP8fyz_x5qTojSKfhndYNscpZgG28`) | Authorised Google Drive connector | Folder **metadata visible** (owner and dates); **children not listable** (`parentId` query returns nothing; filename searches return nothing) | Folder name only. No files inspected. |
| Instagram `@maairafashionbags` | Not attempted beyond linking | Login-walled platform; scraping would breach platform terms | None. The profile URL is linked, not mirrored. |
| Master brief (`maanya_master_prompt_md_file.md`) | Read in full | Available | All sections. |

### Re-check 2026-10-04 (flagship upgrade)

| Source | Result |
|---|---|
| Live site `https://maaira.vercel.app/` | **Blocked** by egress policy (curl and WebFetch). The deployed build couldn't be compared with the code; which commit it serves is unknown. |
| Official site `https://maaira.co.in` | **Blocked** (same) |
| Cloudinary product photos | **Still blocked** (proxy 403) |
| Supabase (connected account) | Reachable; **no projects exist**. No database was created (that needs owner approval and may incur cost). |
| Audio assets | **None supplied** anywhere in the project |
| Email provider credentials | **None supplied** |

## 2. Assets available in the project

| Asset | Path | Status |
|---|---|---|
| Official logo (original, byte-identical) | `public/brand/maaira-logo-original.jpg` | SHA-256 `604a922a…9367`. Never modified. |
| Monogram mask (derivative) | `public/brand/maaira-monogram-mask.png` | Luminance key of original pixels. No redrawing. |
| Wordmark mask (derivative) | `public/brand/maaira-wordmark-mask.png` | As above ("MAAIRA" + "LUXURY" rule) |
| Full lockup mask (derivative) | `public/brand/maaira-lockup-mask.png` | As above |
| App icons (derivative) | `src/app/icon.png`, `src/app/apple-icon.png` | Monogram mask, silver on espresso |
| Leather grain textures | `public/textures/leather-height.webp`, `leather-lit.webp` | **Original procedural work** (Worley/value noise), not cropped from the logo mockup. Rights are clean. |

All derivatives are reproducible with `npm run assets:brand` (`scripts/build-brand-assets.mjs`), which documents every step.

## 3. Product imagery: what is known

The 9 Cloudinary URLs are recorded verbatim in `src/data/asset-manifest.ts`, with stable internal IDs (`MFB-IMG-8683` … `MFB-IMG-8704`) and `verification: 'unverified'`.

**Grouping status:** *provisional, low confidence.* The only evidence available was the camera filename sequence:

| Provisional piece | Assets | Basis |
|---|---|---|
| Piece Nº 01 | IMG_8683 (primary), IMG_8686 | Adjacent filenames |
| Piece Nº 02 | IMG_8691 (primary), IMG_8692, IMG_8693 | Consecutive filenames |
| Piece Nº 03 | IMG_8694 (primary), IMG_8695, IMG_8696 | Consecutive filenames |
| Held back | IMG_8704 | Isolated in the sequence |

Silhouettes, colours, angles and image dimensions have **not** been compared. Until a visual review confirms or corrects this table:

- product descriptions make no physical claims (material, colour, hardware, size or use);
- alt text is neutral ("Piece Nº 02 — view 1");
- per-piece backgrounds (champagne studio, ivory plaster, espresso leather) were assigned without reference to the bags' colours.

## 4. Cloudinary assessment

- **Delivery:** the site uses only public delivery URLs, with on-the-fly `f_auto,q_auto:good,c_limit,w_…` transformations and a responsive `srcset`. There are no API keys or secrets in the code.
- **Risk:** if *strict transformations* is enabled on the account, transformed URLs return 401/404. `CloudImage` then retries the exact supplied URL, and if that also fails it shows a composed brand panel instead of a broken image.
- **Not done:** no uploads, no Admin API use, no background removal or AI compositing. None was authorised, and the images weren't reachable.

## 5. Client actions required

1. **Make the 9 product images inspectable.** Either allow `res.cloudinary.com` in the Claude Code environment's network settings (*Network access → Custom → Allowed domains*), or attach the images directly to the conversation. Then the grouping, primary images, alt text, colour notes and stage backgrounds can be verified in one pass (all in `src/data/products.ts`).
2. **Grant access to the Drive folder's files,** or provide a downloaded copy, for the full catalogue phase.
3. Confirm the items in `docs/product-data-gaps.md`.
4. Confirm that +91 98711 71112 is WhatsApp-enabled before click-to-chat is switched on (`brand.contact.whatsappEnabled`).
