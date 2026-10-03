# Product Data Gaps & Client Questions

All product content lives in **`src/data/products.ts`** (the pieces) and **`src/data/asset-manifest.ts`** (the images). Change those two files and the whole site follows.

Legend: ✅ known / verified · ⚠️ provisional · ❌ missing

## Sample pieces

| Field | Nº 01 | Nº 02 | Nº 03 | Notes |
|---|---|---|---|---|
| Official product name | ❌ | ❌ | ❌ | UI shows the neutral working title "Piece Nº 0X" (`displayNameStatus: 'working-title'`) |
| SKU / reference | ❌ | ❌ | ❌ | Internal IDs `mfb-sample-0X` are placeholders |
| Image grouping | ⚠️ | ⚠️ | ⚠️ | Filename sequence only; see the access report §3 |
| Primary image | ⚠️ | ⚠️ | ⚠️ | First file in each sequence, chosen without seeing it |
| Price (INR) | ❌ | ❌ | ❌ | Displays `₹XXXX` with "Price to be confirmed" |
| Tax treatment | ❌ | ❌ | ❌ | |
| Colour / variant | ❌ | ❌ | ❌ | Field is hidden until it has a value |
| Material / composition | ❌ | ❌ | ❌ | Deliberately not claimed anywhere |
| Dimensions / weight | ❌ | ❌ | ❌ | |
| Care instructions | ❌ | ❌ | ❌ | |
| Country of origin | ❌ | ❌ | ❌ | |
| Stock / availability | ❌ | ❌ | ❌ | No stock indicators are shown |
| Description copy | ⚠️ | ⚠️ | ⚠️ | Draft, sensibility-only copy (`copyStatus: 'draft-pending-visual-review'`) |
| Category / collection | ❌ | ❌ | ❌ | No collection names invented |
| Shipping / returns / warranty | ❌ | ❌ | ❌ | Not shown. Needs client-approved policies. |

## Brand facts in use (client-supplied, master brief §1.1, §8.7)

| Fact | Where shown | Status |
|---|---|---|
| Brand name: MAAIRA FASHION BAGS | Header, hero (accessible name), House, footer | ✅ |
| Business name: Maanya Enterprises | House, footer, © line | ✅ |
| Descriptor: Manufacturer of Luxury Designer Handbags | Hero, House, footer, meta description | ✅ supplied |
| "Won Most Elegant Bags Award" | House credentials | ⚠️ Needs client verification before public release. No awarding body, date or category is invented. |
| "Delivered 10,00,000+ Bags" | House credentials | ⚠️ Shown exactly as supplied. Needs verification. |
| Email, phone, Instagram | Contact, footer, menu, piece dialog | ✅ supplied |
| WhatsApp click-to-chat | Not shown | ❌ Waiting on confirmation that the number is WhatsApp-enabled |

## Questions for the client

1. Can you confirm which photographs show the same bag, and which should lead each piece?
2. What are the official names and prices for the sample pieces?
3. For each piece, which colour or variant names may be shown?
4. Should IMG_8704 be part of the showcase? If so, which piece does it belong to?
5. Please confirm the award wording and whether any supporting detail (awarding body, year) may be published.
6. Please confirm the "10,00,000+ bags delivered" figure for publication.
7. Is +91 98711 71112 WhatsApp-enabled?
8. Is there an approved tagline? The hero currently reads "Quiet luxury, reimagined.", adapted from the master brief's creative concept.
