# Product Data Gaps & Client Questions

Product data now lives in the **database** and is edited in **/admin/products** (photographs in **/admin/media**). `catalogue/products.ts` is only the initial import.

Legend: ✅ known / verified · ⚠️ provisional · ❌ missing

## Catalogue as a whole

| Item | Status | Notes |
|---|---|---|
| Which of the 45 new photographs show the same bag | ❌ | Not inspectable from the build environment — see `docs/catalogue-image-analysis.md` |
| Number of real products | ❌ | Unknown until grouping |
| Primary image per product | ❌ | |
| Bag type (style) per product | ❌ | Only from visual evidence or client confirmation |
| Occasion / use per product | ❌ | Only where the photographs genuinely support it |
| Prices (INR, inclusive of GST?) | ❌ | Products stay "₹XXXX" and non-purchasable until a price is approved in the admin |
| Availability / stock | ❌ | "Unconfirmed" until set; stock tracking optional per product |
| Colour, material, dimensions, care, origin | ❌ | Never shown until entered |
| SKUs | ❌ | Internal references `MFB-P-…` are used meanwhile |
| Delivery charge, coverage, times | ❌ | Needed to open checkout (`/admin/settings`) |
| Returns, refunds, cancellation, privacy, terms | ❌ | Drafts with `[CLIENT TO CONFIRM]` markers |

## Provisional pieces currently shown (from the first brief)

| Field | Nº 01 | Nº 02 | Nº 03 |
|---|---|---|---|
| Image grouping | ⚠️ filename sequence | ⚠️ filename sequence | ⚠️ filename sequence |
| Images in the 2026-10-07 intake | none | IMG_8691 only | IMG_8694 only |
| Name | ⚠️ working title | ⚠️ working title | ⚠️ working title |
| Price / availability / attributes | ❌ | ❌ | ❌ |

These should be replaced (or archived) once the new intake is grouped.

## Brand facts in use

| Fact | Where shown | Status |
|---|---|---|
| MAAIRA FASHION BAGS / Maanya Enterprises / descriptor | Header, footer, About, metadata | ✅ supplied |
| "Won Most Elegant Bags Award" | Home + About credentials | ⚠️ needs verification before public release; nothing added |
| "Delivered 10,00,000+ Bags" | Home + About credentials | ⚠️ shown exactly as supplied; needs verification |
| Email, phone, Instagram | Footer, contact, product pages, menu | ✅ supplied |
| WhatsApp click-to-chat | Not shown | ❌ waiting on confirmation the number is WhatsApp-enabled |

## Questions for the client

1. Please allow `res.cloudinary.com` in the build environment (or have staff group the photographs in /admin/media). Are all 45 images product shots, or are some lifestyle/packaging/duplicates?
2. Official product names and prices (inclusive of GST?) for each bag.
3. Colour names, materials, dimensions and care notes you're happy to publish.
4. How are bags sold — ready stock (how many of each), or made to order?
5. Delivery charge (or free delivery), coverage and typical delivery times.
6. Returns window, eligibility, refund timelines, cancellation rules, warranty.
7. Data controller details and grievance officer for the privacy policy.
8. Razorpay merchant account: test keys now, live keys after approval; webhook secret.
9. Email sending domain (for order confirmations) and the inbox for new orders/enquiries.
10. Award wording/detail and the "10,00,000+" figure for publication; WhatsApp enablement.
11. Should the three provisional pieces (IMG_8683/8686, IMG_8691–8693, IMG_8694–8696) remain, or are they superseded by the new intake?
