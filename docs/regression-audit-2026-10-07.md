# Regression audit & correction — 2026-10-07

**Baseline:** the approved experience at commit `b33aa3f` ("Fix reduced-motion scroll offset; record QA results").
**Regressed by:** `b3ea8f5`, `5b191ec` (commerce rebuild), `65621bc`.
**Method:** the approved build was run side by side with the current one (ports 3300 / 3000). Every comparable page was captured at 1440 px and 390 px, the hero was filmed at 0.4 / 1.1 / 1.9 / 2.7 s, the menu mid-reveal, and the component code was diffed file by file.

The commerce work itself (database, cart, checkout, payments, accounts, admin, security) was sound and is kept. The regression was in the **experience layer**: "e-commerce first" had been read as "remove motion and editorial typography". That was wrong. The fixes below restore the approved layer on top of the commerce system.

## What was better before, and what was removed or broken

| # | Area | Regression found | Restored / fixed |
|---|---|---|---|
| 1 | Smooth scroll | Lenis removed entirely | Lenis restored (same settings). Native dialogs now scroll on their own and pause it while open (`prevent` + open-dialog observer), which fixes the drawer/sheet conflict that was the stated reason for removal |
| 2 | Hero | Height cut to 86svh; staged sequence compressed (wordmark 1.25 s → 0.35 s); word-mask tagline "Quiet luxury, *reimagined.*" replaced by a plain fade with new copy; arrow CTA "Explore the pieces →" replaced by a generic filled "Shop bags" button; "Now presenting" line and scroll cue removed | Original component restored: 100svh, original timings, RevealText tagline, arrow CTA, "The House" link, scroll cue. "Now presenting · N pieces" now counts real published products. The reduced-motion end-state fix (nothing left blurred or clipped) is kept |
| 3 | Header | Centred editorial nav replaced by left nav + uppercase SEARCH / SIGN IN / WISHLIST / CART labels (template look); hide-on-scroll removed; directional page-transition hints removed | Approved header restored: centred SHOP · THE HOUSE · EDITORIAL · CONTACT, hairline underline, hide on scroll-down and return on scroll-up, sound + theme controls. Commerce controls kept as quiet icons with accessible names and a small count badge |
| 4 | Menu | Full-screen leather menu (clip-path reveal, numbered display-size links, staggered rise) replaced by a plain side drawer | Leather menu restored as a native `<dialog>`: focus is trapped and Escape closes it, with the same reveal and stagger. Account, wishlist, client services and contact are inside it |
| 5 | Page transitions | `nav-forward` / `nav-back` types dropped from links (13 → 2 files), so most navigation used the plain fade only | Directional types restored on header, footer, cards, breadcrumbs, pager, CTAs and editorial links |
| 6 | Product card | 3D tilt with glare and moving shadow, clip-path reveal on scroll, "View" cursor label, shared-element morph into the product page, Quick view, Nº number, italic tagline, underline-grow title all removed | Approved card restored on catalogue data. Additions: a wishlist mark in the stage corner, real price / "to be confirmed", availability note |
| 7 | Quick view | Full-screen piece dialog with deep link (`?piece=`), gallery, prev/next removed | Restored on catalogue data, stepping through the current listing. Adds "Add to cart" when a piece is genuinely purchasable, and the wishlist |
| 8 | Home | "Selected *pieces*" asymmetric composition, scroll-pinned campaign study, 3D Gallery Ring and pinned Collection slides removed; replaced by a uniform grid and a small band | Approved running order restored: Hero → Selected pieces → Campaign study → The House → Gallery Ring → Collection → Enquiries. Style/occasion shortcuts and New arrivals appear only when real categories / dates exist |
| 9 | Shop | "The *pieces*" header, editorial/grid toggle, asymmetric editorial layout, Quick view and the "full collection" panel replaced by "All bags" in a uniform grid | Restored, with the commerce filters, sort, search and active-filter chips placed in the same toolbar. The editorial rhythm repeats (mirrored) for longer catalogues |
| 10 | Product page | Entrance motion, "Piece 02 of 03", masked title, italic tagline, details table, "Every view" staggered gallery with reveals, enquiry section styling, "Other *pieces*", prev/next pager removed or flattened into accordions | Approved page restored. The purchase panel is restyled to the approved primary / secondary / "or call" actions. Delivery & returns and Find similar stay as quiet accordions; the mobile sticky bar is kept |
| 11 | Typography | `PageHeader compact` stripped the word-reveal and *italic* emphasis on 20 pages; generic titles ("All bags", "Your cart", "Sign in") | `compact` mode removed. Every page title is a masked display reveal with an italic accent ("The *pieces*", "Your *cart*", "Welcome *back*", "How can we *help?*", "Terms of *use*" …). Fonts were **never** changed (Cormorant Garamond + Jost); the hierarchy is what had regressed |
| 12 | Gallery | Slide transition shortened 0.7 s → 0.45 s | 0.7 s restored |
| 13 | House page | "Selected pieces" grid replaced by a generic featured block | Restored with the approved compact cards |
| 14 | Naming | "The House" renamed "About" in nav and footer | "The House" restored in nav, footer and page eyebrow (URL stays `/about`, with `/house` redirecting to it) |
| 15 | Dead data | Old static `src/data/products.ts` / `asset-manifest.ts` still in the tree (used only by a type import) | Removed; everything reads the database catalogue |
| 16 | Offline HTML file | The single-file preview was captured under reduced motion and stripped of scripts, so it carried no motion at all | The builder now records each element's real start style and replays the reveals, samples scroll-linked effects (pinned campaign study, collection rail, hero parallax) and re-maps them to the visitor's viewport, and runs the ring, page fades, hide-on-scroll header and the circular theme reveal. Only the WebGL leather is not carried; the hero shows its own leather fallback |
| 17 | Pre-existing bug (also in `b33aa3f`) | Campaign study: chapter I and the first photograph faded back in near the end of the pinned scroll. Scroll windows stopped short of 1, and native scroll timelines add an implicit end keyframe | `src/lib/ranges.ts` windows now span 0 → 1 and hold their edge values; covered by `tests/ranges.test.ts` |

## Still deliberately different from the baseline

- Commerce controls (search, account, wishlist, cart) in the header — as icons, not labels.
- Price-status note and purchase actions on the product page; a delivery and returns accordion.
- Filters / sort when products carry attributes (none do yet, so they are hidden).
- Footer columns: Shop · Client services · The House, with every policy link.

## Not fixed here — blocked

**Product image grouping and categorisation remain BLOCKED.** `res.cloudinary.com` is still refused by this environment's proxy (HTTP 403 on CONNECT, re-tested today). The Google Drive "PRODUCT SHOOT(BAG)" folder's files are still not listable through the connector, and no image files were uploaded to the session. No grouping, category or occasion was guessed. See `docs/catalogue-image-analysis.md` for the two ways to unblock it.

## Verification (after the fixes)

- typecheck · lint · production build — pass
- `npm test` — 33 / 33 (includes the new scroll-range regression tests)
- `npm run test:e2e` — 60 / 60. Selectors updated for the restored copy and card markup only; no assertions were weakened.
- `npm run qa:a11y` — 0 violations on all targets, both themes, including the leather menu.
- `npm run qa:screens -- --mock-images` — no problems at 360 → 1920 px and under reduced motion. The menu check now waits for the 0.6 s close animation instead of sampling mid-animation.
- Side-by-side re-capture against `b33aa3f`: home, shop and product pages match the approved compositions; the hero frames match the approved timing; the mobile menu reveal matches.
