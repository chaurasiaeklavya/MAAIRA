# Catalogue Image Intake & Analysis

**Date:** 2026-10-07 · **Source:** 48 Cloudinary URLs supplied in the request (cloud `nzubasgf`), plus the 9 URLs from the first brief (cloud `h1ztqjkg`)
**Verbatim intake:** `catalogue/intake/2026-10-07-cloudinary-urls.txt` · **Parser:** `catalogue/assets.ts` · **Database:** `media_assets`

## 1. Status in one paragraph

Every supplied URL is recorded, de-duplicated and traceable. **The visual analysis itself — grouping photographs into physical bags, choosing primary images and assigning styles/occasions — could not be performed**, because `res.cloudinary.com` is denied by this build environment's network policy (HTTP 403 on CONNECT, re-checked repeatedly on 2026-10-07; the Google Drive folder's files are not listable either). No photograph was opened, so no grouping, category, colour or occasion has been inferred, and nothing has been invented to fill the gap. The catalogue system that consumes the grouping is fully built and tested; the grouping is a data step that can be completed in minutes by either route below.

### Re-check — regression-correction pass (2026-10-07, later the same day)

Grouping is **still BLOCKED**; nothing below was guessed. Every permitted source was tried again:

| Source | Result |
|---|---|
| `res.cloudinary.com` (both clouds) | Refused by the environment proxy (`CONNECT tunnel failed, response 403`) |
| Google Drive connector — "PRODUCT SHOOT(BAG)" folder (`1b9lzP8fyz_x5qTojSKfhndYNscpZgG28`, owner gishant17@gmail.com) | Folder metadata readable; **no child files listable** (`parentId` query returns nothing) |
| Google Drive connector — filename / recent-image searches | No `IMG_86xx` / `IMG_87xx` or MAAIRA files; only unrelated personal images (not opened) |
| Session uploads / local disk | No product image files present |

Unblock with either: allow `res.cloudinary.com` in the cloud environment's network settings, share the Drive folder's files with the connected account (or upload the photographs to the session), or group them in **/admin/media**.

## 2. What is FACT, INFERENCE and UNKNOWN

| Class | What we know |
|---|---|
| **FACT** | 48 URLs were supplied; 45 are unique. `IMG_8707`, `IMG_8712` and `IMG_8769` were each listed twice with byte-identical URLs. All are JPEGs on cloud `nzubasgf`, version stamps `v1791371454`–`v1791371513`. Camera filenames run from `IMG_8691` to `IMG_8786` with gaps. `IMG_8691`, `IMG_8694` and `IMG_8704` also appeared in the first brief (cloud `h1ztqjkg`); `IMG_8683`, `IMG_8686`, `IMG_8692`, `IMG_8693`, `IMG_8695` and `IMG_8696` appear **only** in the first brief. |
| **INFERENCE** (weak) | Shared camera filenames across the two clouds are probably the same photograph re-uploaded (unverified — bytes not compared). Consecutive filenames are *often* the same shoot setup, but that is not evidence of the same bag, and it is not used for any customer-facing decision. |
| **UNKNOWN** | How many physical bags the 45 photographs show; which photographs show the same bag; primary images; bag types; occasions; colours; materials; dimensions; whether any image is a detail/lifestyle/packaging shot; image dimensions and quality. |

## 3. What the storefront shows meanwhile

- The three **provisional** pieces from the first brief (grouped by filename only, confidence *low*, flagged "Provisional" in the admin). They have no price, colour, availability, style or occasion, so they are not purchasable and no category pages, filters or "shop by" sections appear — exactly what the data-driven rules require.
- All 42 new photographs that aren't part of those pieces are in the admin **Photographs** library with status `pending`; `IMG_8704` is `held`.

## 4. How the grouping gets completed

**Option A — let the build environment see the images (recommended).** Allow `res.cloudinary.com` in the environment's network settings (Network access → add the domain under *Allowed domains*). The analysis is then done here: every image inspected and compared (silhouette, handles/straps, hardware, stitching, colour, closures, logos), grouped into physical bags with confidence notes, primary image and gallery order chosen, styles and occasions assigned only where visible (recorded as `fact`/`inference` in `product_terms`), the provisional pieces replaced, and this document updated with the full mapping.

**Option B — staff do it in the admin (works today).** Staff browsers load Cloudinary normally. In **/admin/media**:
1. Tick every view of one bag → enter a working name → **Create product** (a draft with those photographs; the first becomes primary).
2. In the product editor, reorder/relabel photographs, set the primary view and alt text, and assign styles/occasions with their evidence basis.
3. Mark non-product images `rejected` and uncertain ones `held` with a note.
4. Add price, availability and verified attributes when confirmed; publish.
Every step is audited. A photograph can belong to only one product (database constraint), so duplicate products can't be created from the same image.

## 5. Taxonomy available for assignment

Styles: Totes · Shoulder Bags · Crossbody · Handbags · Top Handle · Mini Bags · Clutches · Satchels · Bucket Bags · Sling Bags · Backpacks.
Occasions: Everyday · Office & Work · Party & Evening · Weddings & Occasions · Travel · Casual.
A term appears in navigation, filters, category pages and home "shop by" sections **only** when at least one published product carries it. "Gifting", "New arrivals" and "Best sellers" are not auto-generated: gifting needs a business-defined offer, new arrivals need staff-set arrival dates, and there is no sales data for best sellers.

## 6. Full inventory

| Asset ID | File | Batch | Delivery URL | Status |
|---|---|---|---|---|
| MFB-IMG-8683 | IMG_8683.jpg | 2026-10-03 only | https://res.cloudinary.com/h1ztqjkg/image/upload/v1791058472/IMG_8683.jpg | Provisionally in Piece Nº 01 (primary) |
| MFB-IMG-8686 | IMG_8686.jpg | 2026-10-03 only | https://res.cloudinary.com/h1ztqjkg/image/upload/v1791058436/IMG_8686.jpg | Provisionally in Piece Nº 01 (gallery) |
| MFB-IMG-8691 | IMG_8691.jpg | 2026-10-07 (also 2026-10-03) | https://res.cloudinary.com/nzubasgf/image/upload/v1791371455/IMG_8691.jpg | Provisionally in Piece Nº 02 (primary) |
| MFB-IMG-8692 | IMG_8692.jpg | 2026-10-03 only | https://res.cloudinary.com/h1ztqjkg/image/upload/v1791058657/IMG_8692.jpg | Provisionally in Piece Nº 02 (gallery) |
| MFB-IMG-8693 | IMG_8693.jpg | 2026-10-03 only | https://res.cloudinary.com/h1ztqjkg/image/upload/v1791059047/IMG_8693.jpg | Provisionally in Piece Nº 02 (gallery) |
| MFB-IMG-8694 | IMG_8694.jpg | 2026-10-07 (also 2026-10-03) | https://res.cloudinary.com/nzubasgf/image/upload/v1791371455/IMG_8694.jpg | Provisionally in Piece Nº 03 (primary) |
| MFB-IMG-8695 | IMG_8695.jpg | 2026-10-03 only | https://res.cloudinary.com/h1ztqjkg/image/upload/v1791058664/IMG_8695.jpg | Provisionally in Piece Nº 03 (gallery) |
| MFB-IMG-8696 | IMG_8696.jpg | 2026-10-03 only | https://res.cloudinary.com/h1ztqjkg/image/upload/v1791058942/IMG_8696.jpg | Provisionally in Piece Nº 03 (gallery) |
| MFB-IMG-8698 | IMG_8698.jpg | 2026-10-07 | https://res.cloudinary.com/nzubasgf/image/upload/v1791371456/IMG_8698.jpg | Pending visual review |
| MFB-IMG-8699 | IMG_8699.jpg | 2026-10-07 | https://res.cloudinary.com/nzubasgf/image/upload/v1791371462/IMG_8699.jpg | Pending visual review |
| MFB-IMG-8704 | IMG_8704.jpg | 2026-10-07 (also 2026-10-03) | https://res.cloudinary.com/nzubasgf/image/upload/v1791371462/IMG_8704.jpg | Held: Isolated in the filename sequence; held pending visual review. |
| MFB-IMG-8707 | IMG_8707.jpg | 2026-10-07 | https://res.cloudinary.com/nzubasgf/image/upload/v1791371463/IMG_8707.jpg | Pending visual review |
| MFB-IMG-8711 | IMG_8711.jpg | 2026-10-07 | https://res.cloudinary.com/nzubasgf/image/upload/v1791371464/IMG_8711.jpg | Pending visual review |
| MFB-IMG-8712 | IMG_8712.jpg | 2026-10-07 | https://res.cloudinary.com/nzubasgf/image/upload/v1791371469/IMG_8712.jpg | Pending visual review |
| MFB-IMG-8713 | IMG_8713.jpg | 2026-10-07 | https://res.cloudinary.com/nzubasgf/image/upload/v1791371470/IMG_8713.jpg | Pending visual review |
| MFB-IMG-8715 | IMG_8715.jpg | 2026-10-07 | https://res.cloudinary.com/nzubasgf/image/upload/v1791371475/IMG_8715.jpg | Pending visual review |
| MFB-IMG-8716 | IMG_8716.jpg | 2026-10-07 | https://res.cloudinary.com/nzubasgf/image/upload/v1791371454/IMG_8716.jpg | Pending visual review |
| MFB-IMG-8719 | IMG_8719.jpg | 2026-10-07 | https://res.cloudinary.com/nzubasgf/image/upload/v1791371462/IMG_8719.jpg | Pending visual review |
| MFB-IMG-8722 | IMG_8722.jpg | 2026-10-07 | https://res.cloudinary.com/nzubasgf/image/upload/v1791371454/IMG_8722.jpg | Pending visual review |
| MFB-IMG-8723 | IMG_8723.jpg | 2026-10-07 | https://res.cloudinary.com/nzubasgf/image/upload/v1791371462/IMG_8723.jpg | Pending visual review |
| MFB-IMG-8727 | IMG_8727.jpg | 2026-10-07 | https://res.cloudinary.com/nzubasgf/image/upload/v1791371467/IMG_8727.jpg | Pending visual review |
| MFB-IMG-8732 | IMG_8732.jpg | 2026-10-07 | https://res.cloudinary.com/nzubasgf/image/upload/v1791371470/IMG_8732.jpg | Pending visual review |
| MFB-IMG-8733 | IMG_8733.jpg | 2026-10-07 | https://res.cloudinary.com/nzubasgf/image/upload/v1791371473/IMG_8733.jpg | Pending visual review |
| MFB-IMG-8735 | IMG_8735.jpg | 2026-10-07 | https://res.cloudinary.com/nzubasgf/image/upload/v1791371475/IMG_8735.jpg | Pending visual review |
| MFB-IMG-8737 | IMG_8737.jpg | 2026-10-07 | https://res.cloudinary.com/nzubasgf/image/upload/v1791371478/IMG_8737.jpg | Pending visual review |
| MFB-IMG-8739 | IMG_8739.jpg | 2026-10-07 | https://res.cloudinary.com/nzubasgf/image/upload/v1791371478/IMG_8739.jpg | Pending visual review |
| MFB-IMG-8741 | IMG_8741.jpg | 2026-10-07 | https://res.cloudinary.com/nzubasgf/image/upload/v1791371478/IMG_8741.jpg | Pending visual review |
| MFB-IMG-8742 | IMG_8742.jpg | 2026-10-07 | https://res.cloudinary.com/nzubasgf/image/upload/v1791371485/IMG_8742.jpg | Pending visual review |
| MFB-IMG-8745 | IMG_8745.jpg | 2026-10-07 | https://res.cloudinary.com/nzubasgf/image/upload/v1791371481/IMG_8745.jpg | Pending visual review |
| MFB-IMG-8746 | IMG_8746.jpg | 2026-10-07 | https://res.cloudinary.com/nzubasgf/image/upload/v1791371482/IMG_8746.jpg | Pending visual review |
| MFB-IMG-8747 | IMG_8747.jpg | 2026-10-07 | https://res.cloudinary.com/nzubasgf/image/upload/v1791371484/IMG_8747.jpg | Pending visual review |
| MFB-IMG-8750 | IMG_8750.jpg | 2026-10-07 | https://res.cloudinary.com/nzubasgf/image/upload/v1791371487/IMG_8750.jpg | Pending visual review |
| MFB-IMG-8751 | IMG_8751.jpg | 2026-10-07 | https://res.cloudinary.com/nzubasgf/image/upload/v1791371486/IMG_8751.jpg | Pending visual review |
| MFB-IMG-8752 | IMG_8752.jpg | 2026-10-07 | https://res.cloudinary.com/nzubasgf/image/upload/v1791371488/IMG_8752.jpg | Pending visual review |
| MFB-IMG-8755 | IMG_8755.jpg | 2026-10-07 | https://res.cloudinary.com/nzubasgf/image/upload/v1791371490/IMG_8755.jpg | Pending visual review |
| MFB-IMG-8760 | IMG_8760.jpg | 2026-10-07 | https://res.cloudinary.com/nzubasgf/image/upload/v1791371491/IMG_8760.jpg | Pending visual review |
| MFB-IMG-8764 | IMG_8764.jpg | 2026-10-07 | https://res.cloudinary.com/nzubasgf/image/upload/v1791371498/IMG_8764.jpg | Pending visual review |
| MFB-IMG-8765 | IMG_8765.jpg | 2026-10-07 | https://res.cloudinary.com/nzubasgf/image/upload/v1791371494/IMG_8765.jpg | Pending visual review |
| MFB-IMG-8766 | IMG_8766.jpg | 2026-10-07 | https://res.cloudinary.com/nzubasgf/image/upload/v1791371497/IMG_8766.jpg | Pending visual review |
| MFB-IMG-8767 | IMG_8767.jpg | 2026-10-07 | https://res.cloudinary.com/nzubasgf/image/upload/v1791371498/IMG_8767.jpg | Pending visual review |
| MFB-IMG-8768 | IMG_8768.jpg | 2026-10-07 | https://res.cloudinary.com/nzubasgf/image/upload/v1791371498/IMG_8768.jpg | Pending visual review |
| MFB-IMG-8769 | IMG_8769.jpg | 2026-10-07 | https://res.cloudinary.com/nzubasgf/image/upload/v1791371501/IMG_8769.jpg | Pending visual review |
| MFB-IMG-8770 | IMG_8770.jpg | 2026-10-07 | https://res.cloudinary.com/nzubasgf/image/upload/v1791371502/IMG_8770.jpg | Pending visual review |
| MFB-IMG-8773 | IMG_8773.jpg | 2026-10-07 | https://res.cloudinary.com/nzubasgf/image/upload/v1791371506/IMG_8773.jpg | Pending visual review |
| MFB-IMG-8778 | IMG_8778.jpg | 2026-10-07 | https://res.cloudinary.com/nzubasgf/image/upload/v1791371507/IMG_8778.jpg | Pending visual review |
| MFB-IMG-8779 | IMG_8779.jpg | 2026-10-07 | https://res.cloudinary.com/nzubasgf/image/upload/v1791371508/IMG_8779.jpg | Pending visual review |
| MFB-IMG-8780 | IMG_8780.jpg | 2026-10-07 | https://res.cloudinary.com/nzubasgf/image/upload/v1791371506/IMG_8780.jpg | Pending visual review |
| MFB-IMG-8782 | IMG_8782.jpg | 2026-10-07 | https://res.cloudinary.com/nzubasgf/image/upload/v1791371510/IMG_8782.jpg | Pending visual review |
| MFB-IMG-8784 | IMG_8784.jpg | 2026-10-07 | https://res.cloudinary.com/nzubasgf/image/upload/v1791371508/IMG_8784.jpg | Pending visual review |
| MFB-IMG-8785 | IMG_8785.jpg | 2026-10-07 | https://res.cloudinary.com/nzubasgf/image/upload/v1791371512/IMG_8785.jpg | Pending visual review |
| MFB-IMG-8786 | IMG_8786.jpg | 2026-10-07 | https://res.cloudinary.com/nzubasgf/image/upload/v1791371513/IMG_8786.jpg | Pending visual review |


Rows marked *Pending visual review* are in the admin library awaiting grouping. No row is ignored.
