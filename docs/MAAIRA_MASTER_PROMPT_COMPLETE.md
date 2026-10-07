# MAAIRA MASTER PROMPT
## Complete Unified Claude Code Execution Specification

> **Purpose:** Single-file master instruction set for Claude Code.
>
> This document consolidates the MAAIRA project requirements into clearly separated sections while preserving the supplied specifications and their execution hierarchy.
>
> **Execution model:** AUDIT → IMPLEMENT → TEST → HARDEN → RE-AUDIT
>
> **Important:** Do not fabricate business facts, product information, credentials, policies, integrations, payment status, inventory, legal approvals, or test results.

---

# TABLE OF CONTENTS

1. Master Project & Governing Instructions
2. E-Commerce-First Transformation
3. Production-Grade Full-Stack, Security & Launch
4. Final Prompt Engineering & Execution Protocol
5. Requirements Traceability & Production Checklist

---

# 1. MASTER PROJECT & GOVERNING INSTRUCTIONS

## Luxury Digital Flagship — Creative Direction, Product Commerce, Engineering & Delivery

**Execution target:** Claude Code  
**Brand name:** MAAIRA FASHION BAGS  
**Logo/visual lockup:** MAAIRA LUXURY (as shown in the supplied official logo; this is a logo treatment, not a substitute business name)  
**Business name:** Maanya Enterprises  
**Instagram:** https://www.instagram.com/maairafashionbags  
**Business category:** Manufacturer of Luxury Designer Handbags  
**Document status:** Authoritative consolidated project brief  
**Primary outcome:** An original, secure, accessible, fully functional and commercially operable luxury e-commerce platform—not a mock-up, portfolio, static catalogue or landing-page-only prototype.

---

## 0. Operating Instructions

You are Claude Code acting as the technical and creative execution environment for a multidisciplinary senior team: creative direction, luxury brand strategy, UX/UI, product storytelling, frontend and backend engineering, database architecture, e-commerce operations, cybersecurity, accessibility, performance, motion/3D, sound, QA and deployment.

Your responsibility is to **inspect, plan, implement, validate, refine and document** the MAAIRA platform in the available project environment. Do not merely provide advice, wireframes, mockups or a plan when the environment permits implementation. Do not begin implementation until the initial access and asset assessment in Phase 1 is complete and its findings are reported. This is an instruction to defer development—not to defer safe inspection, inventory creation or requirements analysis.

### 0.1 Priority hierarchy

If instructions appear to conflict, resolve them in this order:

1. Truthfulness, legal compliance, security, privacy and protection of customer/business data.
2. Correct business operations, accurate product information, payment/order integrity and genuine functionality.
3. Core user experience, usability, accessibility and mobile reliability.
4. Fidelity to MAAIRA’s actual identity, logo and real product imagery.
5. Performance, stability, maintainability and operational sustainability.
6. Creative distinction, immersive storytelling and advanced effects.
7. Efficiency of credits, context, tools and implementation effort.

Credit efficiency is always subordinate to quality and safety. Creative freedom is broad but does not override verified facts, customer trust, accessibility or operational correctness. When a feature cannot be completed because of missing access, credentials, approval or infrastructure, implement safe, well-defined integration points where possible and report the blocker accurately.

### 0.2 Instruction categories

- **MUST:** Mandatory business, functional, safety, quality or delivery requirement.
- **SHOULD:** Expected unless a documented technical or operational reason justifies an alternative.
- **EXPLORE:** Creative or technical opportunity; evaluate value and feasibility before adopting.
- **CLIENT CONFIRMATION:** Do not publish or operationalise until verified by the client.

Do not turn optional examples or named technologies into mandatory dependencies. Do not silently omit a requirement; map it in the traceability checklist and mark it complete, partial, blocked or not applicable with a reason.

### 0.3 Execution communication

Provide concise, useful progress summaries, decisions, risks, blockers and test evidence. Do not expose hidden chain-of-thought or lengthy private reasoning. Explain decisions through brief rationales, evidence, implementation status and verifiable outcomes. Do not repeatedly ask for information already supplied or verified. Ask a focused clarification only when missing information materially affects security, commercial correctness, legal obligations or a significant irreversible decision.

---

## 1. Project Identity, Objective & Scope

Build the official digital flagship for the brand **MAAIRA FASHION BAGS**, operated by **Maanya Enterprises**. The supplied logo uses the **MAAIRA LUXURY** visual lockup; preserve it as the logo treatment without treating it as an alternate legal/business name. The business category is **Manufacturer of Luxury Designer Handbags**. The site must express a distinctive brand identity and support the real customer journey from discovery through purchase, fulfilment communication and post-purchase support.

This is a complete e-commerce application with a polished public storefront, real backend, persistent database, authorised administration, product/inventory/order workflows, payment integration and deployment readiness. It is not complete if it is only a visually impressive homepage, a static product grid, a non-functional prototype or a frontend with simulated commerce.

### 1.1 Brand-provided messaging

Use the following claims as supplied brand messaging, subject to final client verification:

- **Manufacturer of Luxury Designer Handbags** — core brand descriptor.
- **Won Most Elegant Bags Award** — award credential.
- **Delivered 10,00,000+ Bags** — display exactly as supplied unless the client confirms an updated figure and supporting details.

Present these details tastefully in suitable locations such as the homepage, brand introduction, editorial sections or achievements area. The award may receive an award-inspired visual treatment, but do not invent the awarding organisation, date, certification, category or proof. Do not fabricate reviews, customer counts, manufacturing methods, material certifications, product origins, sustainability claims, brand history or any additional achievement. Flag claims that need substantiation or approval before public release.

### 1.2 Business and market context

The brand is **MAAIRA FASHION BAGS** and the business is **Maanya Enterprises**. The business is in the luxury designer handbag category. Design for customers who expect refined product presentation, accurate details, confidence in payment and delivery, discreet sophistication, and a seamless shopping experience. Do not assume the business’s fulfilment model, target demographics, price bands, product materials, inventory rules, return policies or geographic coverage unless verified.

### 1.3 Success definition

Success means the implementation:
- Has a distinctive and coherent MAAIRA identity based on the supplied logo and actual products.
- Presents authentic product imagery and verified product details without misrepresentation.
- Supports all essential shopping, account, administration and order workflows that can be configured with available client inputs.
- Uses secure, maintainable frontend/backend architecture and persistent data.
- Provides equally considered dark and light modes, mobile-first responsiveness and accessible interactions.
- Is tested, documented and ready for deployment; it is called live or production-ready only after the relevant services and production configuration are genuinely verified.

---

## 2. Source References, Access & Evidence Rules

### 2.1 Supplied references

- **Official logo:** Use the logo image supplied with this brief as the primary visual identity reference and original brand asset.
- **Google Drive product/brand assets:** https://drive.google.com/drive/folders/1b9lzP8fyz_x5qTojSKfhndYNscpZgG28?usp=sharing
- **Official Instagram:** https://www.instagram.com/maairafashionbags
- **Business contact:** maairabags@gmail.com | +91 98711 71112 (phone and proposed WhatsApp number; verify WhatsApp enablement before activating click-to-chat).
- **Optional image delivery candidate:** Cloudinary; evaluate rather than assume an account or integration exists.

The Drive folder is the intended primary source for product photography and brand assets. Instagram is a secondary source for publicly visible brand language, products, categories, colour cues and other relevant information. Neither a pasted URL nor a public profile link guarantees access to all underlying content.

### 2.2 Verify access before development

At the start:
1. Inspect the current working directory, repository, project instructions, existing application, available MCP integrations and permitted connected services.
2. Check whether Google Drive MCP or an authorised Drive connector is configured. Use it only within granted permissions.
3. Attempt to inspect the supplied folder only through a legitimate, available method. Do not bypass authentication, request circumvention, scrape restricted content or infer access from the URL.
4. If Drive MCP/access is unavailable, report that fact and request a locally synced or downloaded copy, or client-authorised access. Do not claim to have inspected unseen assets.
5. Inspect Instagram only to the extent legitimately accessible. Do not bypass login, rate limits, privacy controls or platform restrictions. Record access limitations.
6. Confirm that the supplied logo file is actually available in the working context and inspect its image characteristics without altering the original.
7. Before implementation, provide an **Access & Asset Readiness Report** listing sources attempted, access method, scope successfully inspected, assets available, unresolved access needs and client actions required.

### 2.3 Evidence and uncertainty

Maintain a strict separation between:
- Verified information from client-provided assets or authorised sources.
- Publicly visible information with source and date/context.
- Reasonable technical assumptions, clearly labelled and reversible.
- Missing or unverified facts requiring client confirmation.

Never invent product names, SKUs, prices, discounts, variants, dimensions, weight, material composition, care instructions, country of origin, stock, delivery dates, customer testimonials, legal policies, credentials or service configuration. Never claim a tool, account, API, payment gateway, deployment or integration is connected unless it has actually been configured and tested.

---

## 3. Asset Audit & Product Library (Gate Before Development)

Create a complete inventory of every accessible relevant file: product photographs, logos, documents, catalogues, brand guidelines, campaign imagery, videos, fonts and other brand assets.

### 3.1 Inventory fields

For each file, record where available:
- Stable internal asset ID and original filename.
- Source folder/path or source URL, access date and file type.
- Dimensions, aspect ratio, file size, colour profile and transparency where relevant.
- Apparent subject/product, confidence of identification and visual notes.
- Product association, image role (hero, gallery, detail, lifestyle, campaign, logo, etc.) and variant/colour association where verifiable.
- Rights/licensing status if supplied, processing status and intended use.
- Any duplicate, quality, crop, orientation or missing-metadata issue.

### 3.2 Product mapping

Group images by product wherever possible. Use contact sheets or visual comparison when available and practical. Do not infer that similar-looking images represent the same SKU without sufficient evidence. Record confidence and flag uncertain associations for client review. Establish consistent internal naming conventions without renaming or modifying source files in the client’s Drive.

Create a structured product library in the project or approved asset system, with metadata separated from original media. Preserve originals. Any local copies, derived crops, compressed formats, thumbnails, transparent logo variants or other transformations must be created as new derivative files and documented. Never delete, overwrite, move or modify source assets in the client’s Drive without explicit authorisation.

### 3.3 Product data gap report

For each product, report which fields are known, missing or unverified, including:
- Product name and SKU/unique identifier.
- Category/collection and product description.
- Price, currency, taxes and discount rules.
- Variants (colour, size, finish or other applicable options).
- Material/composition, dimensions, weight, care details and country of origin, if relevant and verified.
- Inventory/stock status and fulfilment details.
- Gallery image mapping and image role.
- Shipping eligibility, delivery estimate, returns and warranty information where approved.
- SEO title/description and structured product attributes where appropriate.

Produce a **Product Data Gaps & Client Questions Report**. Do not block safe architecture work for missing catalog data, but do not publish invented or misleading product content. Use clearly marked unpublished records/placeholders until the client supplies verified information.

### 3.4 Image management

Use supplied real product photography as the primary source. Preserve true product colour, silhouette, texture, scale, finish and material appearance. Prepare appropriate responsive derivatives, modern formats, thumbnails, crop variants and lazy-loading behaviour without changing the perceived product. Use Cloudinary only if the client has authorised access and it demonstrably improves central management, transformations or delivery. Document transformations and retain source references.

### 3.5 Drive-to-product-library-to-Cloudinary workflow

Treat the supplied Google Drive folder as the primary source: https://drive.google.com/drive/folders/1b9lzP8fyz_x5qTojSKfhndYNscpZgG28?usp=sharing. Verify access before processing any asset. If an authorised Google Drive MCP/connector is configured, use it within granted permissions; otherwise request an authorised locally synced or downloaded copy. A URL alone is not evidence of access.

After access is confirmed:
1. Inventory all accessible product photographs, logos, documents, catalogues and other brand assets, preserving source folder hierarchy and useful original filenames wherever practical.
2. Organise a structured product library with stable internal asset identifiers and metadata separated from media. Map each image to a product using verified names, SKUs, catalogue information or reliable visual evidence; record confidence and flag uncertain mappings for client confirmation.
3. Evaluate Cloudinary as the central media library. Bulk upload only if the client has authorised the account, credentials, usage/costs and transfer. Do not make Cloudinary mandatory if unavailable or unsuitable; retain a documented alternative delivery workflow.
4. Where Cloudinary is selected, preserve a mapping between each original source file and its Cloudinary asset. Generate an asset manifest containing, at minimum, internal asset ID, original filename, source folder/path, product/SKU association (or unresolved status), image role, variant/colour where verified, Cloudinary public ID, delivery URL, upload/verification status and relevant transformation details. Do not expose private credentials or use unstable, undocumented identifiers as the sole mapping.
5. Verify upload completion and resulting asset accessibility, dimensions, image quality, colour fidelity and correct product-image association before publishing or using an image in product commerce. Report failed, duplicate, ambiguous or missing assets for remediation.
6. Preserve original Drive assets. Uploading, copying, transforming or organising assets must not delete, overwrite, move or modify client source files without explicit authorisation. Record any locally created derivatives and their relationship to the source.

Never claim that Drive contents were inspected, that a bulk upload succeeded, or that a mapping was verified unless there is actual evidence. Include access limits, upload exceptions and unresolved matches in the Access & Asset Readiness Report and final handover.

### 3.6 Product image quality and delivery

Use the highest-quality legitimate source photograph available and preserve the original high-resolution file. Maintain sharpness, accurate colour, texture, silhouette, finish and fine product details. Do not apply transformations that distort proportions, alter the apparent material/colour, introduce misleading retouching or materially change the product. Avoid excessive compression, pixelation, unnecessary upscaling or resizing that removes useful detail.

Deliver responsive image sizes and modern formats (such as WebP or AVIF) where supported, with appropriate quality settings, dimensions, responsive source selection, CDN delivery, lazy loading and priority loading for key above-the-fold imagery. Optimise file weight for real device/network conditions without compromising visual quality. Review actual delivered images on representative mobile and desktop screens, including product listings, PDP galleries, zoom/detail views, editorial sections and other relevant placements. Do not use low-quality placeholders or unrelated stock imagery as actual MAAIRA products; any temporary placeholder must be clearly non-product, non-published and replaced before release.

---

## 4. Research & Original Brand Strategy

Conduct focused, current research into luxury fashion/leather-goods digital experiences, product merchandising, editorial storytelling, product discovery, customer trust, checkout and relevant technology. Review leading houses such as Louis Vuitton, Dior, Hermès, Prada, Gucci and Bottega Veneta as references for principles—not templates.

Research must inform an original MAAIRA strategy. Do not copy competitors’ site layouts, distinctive trade dress, typography, copy, photographs, animations, icons or other protected brand assets. Do not present unsupported research claims as fact. Keep a concise research/decision note with source links, relevant observations and what was adapted as a general principle.

Define a clear creative concept around:

**CRAZY ELEGANCE — QUIET LUXURY, REIMAGINED THROUGH IMMERSIVE DIGITAL CRAFTSMANSHIP.**

Translate this into concrete design principles: restraint, precise hierarchy, authentic product focus, tactile material cues, premium editorial composition, meaningful motion, clear commerce and trust. Avoid generic AI-generated layouts, stereotypical luxury clichés, arbitrary gradients, excessive glassmorphism, stock imagery and effects without purpose.

---

## 5. Official Logo & Visual Identity

Use the supplied official **MAAIRA LUXURY** logo as the primary identity anchor. Study its monogram, typography, metallic silver finish, dark brown leather-textured background, spacing, proportions, contrast and material character.

### 5.1 Identity principles

- Preserve the original monogram, letterforms, wordmark, proportions and recognisability. Never stretch, distort, inaccurately redraw or replace it with an AI-generated approximation.
- Use the original logo file wherever possible. If an alternate or transparent-background version is needed, create it accurately as a derivative only where permitted, preserve the original and document the process. If accurate extraction is not possible, request an approved asset.
- Develop a coherent design system that complements the logo instead of introducing an unrelated luxury aesthetic.
- Use silver selectively; avoid indiscriminate metallic gradients or effects that reduce legibility.

### 5.2 Brand-informed palette

Build and validate colour tokens against the actual logo and product imagery. Consider:
- Deep espresso and rich leather brown as key dark foundations.
- Metallic silver as a restrained accent.
- Warm ivory and soft neutral tones for editorial surfaces and readability.
- Muted champagne, charcoal and other subdued leather-inspired hues only where they support the real brand/product palette.

Document exact colour values after visual evaluation. Do not assume a colour merely from a compressed preview. Verify contrast in every mode and state.

### 5.3 Typography and composition

Select a refined editorial display typeface and a highly legible supporting typeface. Verify web licensing and language/glyph support. Establish a responsive typographic scale, clear hierarchy, controlled letter spacing, readable product details, consistent alignment, spacing, grid, border, shadow, radius and surface tokens. Luxury whitespace must not reduce usability or hide important commerce information.

### 5.4 Two independently art-directed modes

Implement two complete modes, not a simple colour inversion:
- **Dark mode:** deep espresso, dark leather-inspired surfaces, rich browns, controlled silver highlights, cinematic lighting and accessible contrast.
- **Light mode:** warm ivory, muted neutrals, restrained brown and silver, elegant editorial whitespace and equally refined product presentation.

Provide an accessible theme switch, persist the user’s preference appropriately, respect system preference on first visit where suitable, and ensure every page, component, animation, modal, menu, gallery, cart, account and checkout state works consistently in both modes. Avoid flashing or unreadable transitions during theme changes.

---

## 6. Creative Experience & Motion Direction

Create an immersive editorial experience reminiscent of entering a premium leather-goods fashion house, while keeping products and shopping tasks central.

### 6.1 Opening experience

Design a memorable entrance using refined typography, authentic product imagery, lighting and purposeful motion. A monogram reveal, editorial hero, product introduction or subtle 3D-inspired narrative may be explored. Do not force a long loading sequence, obstructive splash screen or delayed access to shopping. The site must remain useful if animations fail, are disabled or have not loaded.

### 6.2 Signature interactions

Explore where useful:
- A subtle, optional leather-inspired custom cursor on supported desktop devices.
- Pointer-responsive details, tactile hover states and material-inspired transitions.
- Editorial product reveals, cinematic spotlights and considered image transitions.
- Delicate parallax, dimensional compositions and scroll-driven storytelling.
- Elegant category transitions, refined page transitions and monogram-inspired micro-interactions.
- Product zoom or alternate views that reveal actual photography accurately.

Custom cursors must never replace native pointers or impair keyboard, touch or accessibility behaviour. Every interaction needs a clear purpose and graceful fallback.

### 6.3 Motion standards

Use coherent motion principles: consistent easing, duration, layering, reduced-motion alternatives and performance budgets. Motion may guide attention and add delight, but must not impede reading, navigation, product discovery, checkout or accessibility. Avoid excessive parallax, particles, constant movement, distracting transitions and technical spectacle for its own sake.

Evaluate Three.js, React Three Fiber, WebGL, custom shaders, GSAP/ScrollTrigger, Framer Motion or equivalent tools only where they materially improve the result. Use accurate 3D models only when legitimate assets and feasible modelling workflows exist. Never create 3D or generated visuals that misrepresent real handbags. Provide responsive fallbacks for unsupported, low-power or constrained devices.

### 6.4 Editorial storytelling

Use real, accessible brand and product assets to create appropriate campaign sections, curated collections, lookbooks, product stories and lifestyle-led editorial compositions. Do not invent product origins, artisan stories, material provenance, manufacturing methods or campaign facts. If content is not verified, use neutral editorial language or leave it unpublished pending approval.

---

## 7. Information Architecture & Storefront

Design a coherent, responsive site architecture that supports discovery, consideration, purchase and after-sales support. Determine final navigation labels from verified catalog structure and business needs. Expected areas include:

- Home / editorial hero and brand introduction.
- Shop all / collections / product categories.
- Collection and product listing pages (PLPs).
- Product detail pages (PDPs).
- Search results, sorting and filters.
- Wishlist and recently viewed items.
- Cart and checkout.
- Customer sign-in, registration and account area.
- Order confirmation, order history and order tracking.
- Brand/about information based only on verified facts.
- Contact/customer support.
- Client-approved shipping, return, cancellation, refund, privacy and terms pages.
- Editorial/lookbook/campaign content if supported by available assets and strategy.

Provide clear navigation, breadcrumbs where useful, meaningful empty states, loading states, error states, success feedback and not-found handling. Keep the experience intuitive and commercially clear without clutter.

### 7.1 Product discovery

Implement relevant categories, responsive grids, search, sorting and useful filters based on actual catalog metadata. Search should handle empty, no-result, partial and error states. Filters must be understandable, combinable where appropriate and usable on touch and keyboard. Do not expose filters for attributes that have not been verified or populated.

### 7.2 Product detail experience

Each published product page should support, where data exists:
- Accurate name, SKU/reference, price and currency.
- Gallery with responsive images, thumbnails and useful zoom.
- Verified variants and clear selection states.
- Accurate availability/stock status.
- Verified material, dimensions, care and description.
- Delivery, shipping, returns or warranty information only when approved.
- Add-to-cart and wishlist actions with clear feedback.
- Related items/recommendations grounded in catalog rules.
- SEO metadata and structured data based on actual values.

No fake scarcity, invented stock, false discounts, misleading countdowns, fabricated ratings or unverified claims. Unavailable details should be omitted or clearly marked for internal review, not displayed as consumer-facing fiction.

---

## 8. E-Commerce Functionality

Implement real, end-to-end commerce logic. All prices, totals, inventory decisions and order states must be authoritative on the server. Client-side values are for display only and must be revalidated.

### 8.1 Cart

Support add/update/remove, quantity controls, variant validation, persistent cart behaviour appropriate to guest/authenticated users, clear item details, accurate subtotals, shipping/tax treatment when configured, promotion handling if enabled, stock validation, empty states and a reliable checkout handoff. Prevent stale or manipulated client values from determining order totals.

### 8.2 Checkout and payment

Build a low-friction, accessible checkout with clear steps, customer/contact and delivery fields as required, order summary, transparent costs and useful error recovery. Support guest checkout if appropriate to the business.

Evaluate a reputable India-compatible payment gateway such as Razorpay or another client-approved provider. Confirm merchant account, enabled payment methods, API credentials, settlement configuration and production approval before treating it as operational. Never store or directly handle raw payment-card details. Use provider-hosted/approved payment components as appropriate, server-side order creation and verification, signed webhook validation, idempotency, replay protection, amount/currency/order matching, reliable state transitions and failure/retry handling. Never simulate payment success in production or mark an order paid based only on a browser redirect.

Test through sandbox/test mode first. Live transactions require explicit client authorisation and verified production credentials. Clearly report any payment dependency that remains unavailable.

### 8.3 Orders and fulfilment

Implement durable order creation, unique order identifiers, status history, payment state, item/variant snapshots, pricing snapshots, customer and delivery details as needed, inventory consistency and appropriate cancellation/refund handling. Provide order confirmation and customer order history/tracking where real carrier or fulfilment integrations support it. Do not invent shipment status or delivery estimates.

### 8.4 Customer accounts

Provide secure authentication and account management, profile/contact details, address management where appropriate, order history, order details and persistent wishlist where supported. Use secure session management, appropriate verification and recovery workflows. Collect only necessary information.

### 8.5 Promotions and optional commerce enhancements

Consider configurable discount/promo codes, persistent wishlists, abandoned-cart recovery infrastructure, recommendations, gift messaging/packaging and customer support workflows only where the business supports them and operational/legal rules are confirmed. Treat these as optional capabilities until requirements and policies are approved. Do not present an unsupported option as available.

### 8.6 Notifications and support

Support order/payment confirmation, fulfilment and shipping updates, cancellation/refund notifications and customer communication through verified services. Provide clear support/contact pathways using client-approved contact details. Handle provider failures and prevent duplicate messages where feasible.

### 8.7 Business contact, enquiries and callback requests

Use these client-supplied contact details in suitable storefront locations (such as the contact page, footer and relevant support/product touchpoints), subject to final client verification:
- **Brand:** MAAIRA FASHION BAGS
- **Business:** Maanya Enterprises
- **Email:** maairabags@gmail.com (`mailto:` link)
- **Phone:** +91 98711 71112 (`tel:` link)
- **WhatsApp:** +91 98711 71112; activate click-to-chat only after confirming the number is WhatsApp-enabled. Use the correctly country-coded destination only after verification.
- **Instagram:** https://www.instagram.com/maairafashionbags

Implement click-to-call and click-to-email using appropriate device-supported URI links. Link to the official Instagram profile. Distinguish a simple WhatsApp click-to-chat link from WhatsApp Business API messaging or automation; do not claim API functionality unless separately approved, configured and tested.

Implement secure contact and product-enquiry forms, plus a **Get A Call Back** request form. Validate inputs on both client and server, collect only necessary information, provide accessible validation and clear success/error states, and protect endpoints against spam, abuse and injection. Product enquiries should include the relevant product name/ID and available variant or page context without inventing unavailable details. Callback requests should capture only client-approved necessary contact and preferred callback information; do not promise a callback timeframe unless the business confirms it.

Route submissions through a configured backend workflow to secure persistent enquiry records and/or an approved business email, CRM or operational service. Provide authorised admin access to review, search, update status and manage enquiries, with role-based access, auditability where appropriate, retention controls and protection of personal information. Configure email delivery, database storage, CRM or automation independently and report each as operational only after successful end-to-end testing. Do not expose credentials in frontend code. If a provider, destination, consent wording, retention period or permission is missing, document it as a dependency and keep the affected function clearly disabled or marked as pending rather than simulating submission or delivery.

---

## 9. Backend, Database & Administration

Build a secure, scalable and maintainable backend using a stack selected after repository/environment inspection. Do not select a framework merely because it is fashionable. Prefer modular separation of concerns, typed interfaces where appropriate, validated data contracts, reusable business logic, safe ORM/parameterised data access, clear error handling and concise technical documentation.

### 9.1 Core backend capabilities

Provide persistent data and APIs/services for:
- Products, categories, collections, variants and media associations.
- Pricing and promotion rules where enabled.
- Inventory and stock movements.
- Customers, authentication and permissions.
- Carts and wishlists as appropriate.
- Orders, payment events and order status history.
- Shipping/fulfilment configuration and tracking where integrated.
- Content/editorial modules if required.
- Notifications, operational events and audit records.
- Administrative settings required for business operations.

Design schemas and APIs to avoid duplicate sources of truth. Include migrations, indexes, constraints, data validation and appropriate transactional handling for checkout, payment and inventory.

### 9.2 Administrative dashboard

Build a secure admin interface for authorised staff to manage products, photographs/media, categories, collections, verified product details, prices, inventory, orders, customers (only necessary fields), promotions, approved content, shipping settings and essential operational settings without editing source code.

Include role-based access, least privilege, secure admin authentication, validation, confirmation for consequential actions, audit logging for sensitive operations, safe bulk operations where appropriate, searchable/filterable lists, clear status visibility and useful error feedback. Prevent unauthorised access to both UI and API endpoints. Define safe order-state transitions and inventory adjustment history.

### 9.3 CMS and operational automation

Evaluate a suitable CMS, including WordPress/headless WordPress, only if it improves approved editorial or campaign workflows and can be maintained securely. Do not introduce a CMS unnecessarily. Evaluate n8n for order notifications, customer communication, inventory synchronisation or fulfilment workflows only with secure credentials, failure handling, idempotency and a clear operational owner. Core commerce integrity must not depend on an unreliable or unverified automation flow.

---

## 10. Security, Privacy & Legal Readiness

Security is foundational and must be designed from the beginning. Apply current recognised secure-development practices and assess relevant OWASP application risks.

Minimum expectations:
- Server-side validation and output encoding; safe ORM or parameterised database operations.
- Secure authentication, authorisation, session lifecycle and account recovery.
- Role-based access control and least privilege for staff, services and database users.
- Protection against XSS, CSRF where relevant, injection, brute force, credential stuffing, abuse of public endpoints and insecure direct object references.
- HTTPS in deployment, secure cookies, suitable security headers, restrictive and intentional CORS, rate limiting and safe error responses.
- Secrets only in protected environment configuration/secret stores; never in frontend bundles, committed files, logs or user-visible errors.
- Secure file upload validation, type/size limits, safe storage and access controls.
- Payment verification, webhook signature checks, idempotency and auditability.
- Dependency review, vulnerability checks, logging without sensitive data, retention controls and backup/recovery planning.
- Privacy-conscious analytics and data minimisation.

Collect customer data only where necessary and handle it responsibly in light of applicable Indian data protection, consumer and e-commerce obligations. Obtain suitable legal/client review; do not claim legal compliance solely because pages exist. Privacy policy, terms, shipping, returns, cancellation, refunds, warranty and contact details must be client-approved. Where missing, create clearly labelled non-public placeholders and a client-approval checklist. Do not invent legal or commercial commitments.

Document threat-sensitive assumptions, security controls, remaining risks and checks actually performed. Do not claim “fully secure” or “OWASP certified”; describe verified controls and limitations accurately.

---

## 11. Sound Design

Explore original, subtle, context-aware sound that complements the tactile and cinematic identity: gentle material-inspired textures, interaction feedback, transition cues and environmental audio where appropriate. Audio must be legitimately licensed or original, unobtrusive, quiet by default where appropriate and user-controlled through a visible, accessible mute/sound toggle.

Never autoplay disruptive sound, make audio necessary for comprehension/navigation, or prevent full use with sound disabled. Respect browser autoplay rules, reduced-motion/comfort preferences where relevant, mobile constraints and accessibility. Keep sound assets optimised and avoid unnecessary network or processing cost. Document sources/licensing and provide a no-audio fallback.

---

## 12. Mobile-First Responsiveness & Accessibility

The mobile experience must be designed for touch rather than merely compressed from desktop. Tailor navigation, galleries, controls, typography, spacing, transitions, gestures and checkout to smartphones, tablets, laptops, high-resolution desktops and ultrawide screens.

Target **WCAG 2.2 AA where applicable**, including:
- Semantic structure, landmarks and meaningful heading hierarchy.
- Keyboard access, logical focus order, visible focus indicators and skip navigation where useful.
- Accessible names/labels, form instructions, validation and error announcements.
- Screen-reader support, descriptive alt text and decorative-image handling.
- Contrast validation in both themes and all relevant states.
- Accessible dialogs, menus, galleries, cart and checkout interactions.
- Adequate touch target sizes and no hover-only critical functionality.
- Reduced-motion support and alternatives to custom interactions.
- No colour-only communication; maintain usability at zoom and text scaling.

Test with automated tools and manual keyboard/screen-reader review where feasible. Record limitations and do not claim conformance without evidence.

---

## 13. Performance, Reliability & Browser Support

Treat speed and reliability as part of the luxury experience. Define realistic performance budgets after architecture and media assessment. Optimise:
- Initial rendering, JavaScript payload, route-level code splitting and dependency size.
- Image formats, responsive sources, compression, dimensions, lazy loading and priority loading for key imagery.
- Fonts, caching, CDN delivery and server/database queries.
- Animation scheduling, GPU/memory use, WebGL scenes and 3D asset loading.
- Layout stability, loading/error states and resilience to network/provider failures.

Measure Core Web Vitals and test realistic mobile conditions. Provide reduced-effect fallbacks for low-power devices, poor networks, unsupported browsers and users who prefer reduced motion. Avoid excessive client rendering, unnecessary requests, blocking media and visual effects that damage usability. Test current major browsers and document any known compatibility limits. Never invent performance results.

---

## 14. SEO, Analytics & Conversion Quality

Prepare the site for discoverability and sharing through semantic HTML, descriptive page titles and metadata, canonical URLs, clean descriptive routes, sitemap, robots configuration, social-sharing metadata, indexable product content and appropriate structured product data based on verified catalog facts. Prevent unpublished/incomplete products and private account/admin pages from being indexed.

Implement privacy-conscious analytics and e-commerce event tracking only with client-approved tools and required consent controls. Track useful events such as product discovery, search/filter usage, product engagement, cart actions, checkout progression and completion without collecting unnecessary personal information. Ensure consent and privacy choices are respected.

Optimise for clarity and customer confidence rather than dark patterns. Use transparent pricing, accurate stock/delivery information, clear calls to action, useful product information, predictable checkout and honest trust cues. Do not fabricate reviews, urgency, social proof, discounts or conversion statistics.

---

## 15. Tool & Technology Selection Freedom

You have broad freedom to research and choose suitable frameworks, services, APIs, MCP servers, plugins, creative tools, design systems, automation platforms, cloud infrastructure and workflows. The following are candidates, not mandates:

- **Cloudinary:** central media management, responsive transformations and delivery.
- **Three.js / React Three Fiber / WebGL / shaders:** purposeful 3D or dimensional storytelling.
- **GSAP / ScrollTrigger / Framer Motion or alternatives:** coherent motion and interactions.
- **Google Flow and other AI-assisted creative tools:** original campaign/storytelling assets where legitimate, accurate and useful.
- **n8n:** operational workflow automation where reliable and maintainable.
- **WordPress/headless CMS:** editorial publishing if justified.
- **Payment, shipping, email, analytics, database, authentication, monitoring, security, hosting and deployment providers:** select for Indian market compatibility, requirements, support, cost, security and maintainability.
- **AI-assisted design/development/testing tools:** use when they improve quality or efficiency without exposing confidential information or violating licensing.

For each proposed service/tool, identify the problem addressed, expected benefit, architecture compatibility, subscription/usage costs, licensing, privacy/security implications, credentials/permissions, operational ownership, maintenance burden and fallback/alternative. Prefer official documented integration methods. Avoid overlapping or excessive dependencies. Do not use a tool simply because it is available or mentioned. Never connect, configure, test or deploy a service without actually doing so and verifying the outcome. Keep credentials protected and obtain client approval for paid services, data sharing and account access.

---

## 16. Technical Architecture & Development Standards

Inspect the existing repository and environment before selecting or replacing the stack. Preserve useful existing work; do not rewrite the project from scratch unless inspection demonstrates that doing so is necessary and the rationale is documented.

Establish:
- Maintainable frontend and backend boundaries.
- Reusable design components and shared business logic.
- Typed contracts and schema validation where suitable.
- Environment-specific configuration and secrets management.
- Consistent formatting, linting, error handling and logging.
- Database schema/migrations and seed data clearly separated from production data.
- Automated checks in the development workflow.
- Concise architecture and setup documentation.

Use realistic sample/seed data only in clearly identified development environments. Never let fabricated seed data appear as real products, prices, reviews, stock or orders in production. Keep dependency count appropriate and justify unusual packages or services. Maintain compatibility with the project’s actual runtime and deployment target.

---

## 17. Credit, Context & Rework Optimisation

Use an outcome-first approach. Optimise through better planning, reuse, targeted inspection, grouped changes, concise records and incremental validation—not by cutting required work.

- Create a requirements checklist and one execution plan before implementation.
- Inspect only relevant files for the current task while preserving awareness of project-wide dependencies.
- Reuse verified assets, architecture decisions, components, utilities and documentation.
- Consolidate related changes and avoid redundant tool calls, repeated research, repeated descriptions and unnecessary rewrites.
- Keep project notes concise, accurate and stored in the repository where appropriate (for example, architecture, setup, integration and decision records).
- Summarise phase outcomes and unresolved work when context grows.
- Test incrementally to catch defects early and avoid expensive rework.
- Do not discard essential context to save tokens.
- Spend additional effort/credits when justified by a meaningful quality improvement, unresolved challenge, defect or critical requirement.

Do not stop at a minimum viable prototype, remove essential features, skip tests, weaken security/accessibility, accept inferior creative work or declare completion early merely to conserve credits. The final outcome—not token volume or speed—is the measure of success.

---

## 18. Phased Execution Workflow & Gates

The order may be adapted to dependencies, but do not bypass gates or conceal blockers.

### Phase 1 — Repository, environment and access inspection
- Inspect project files, framework, dependencies, current implementation, instructions, runtime, deployment assumptions and available tools/MCP.
- Verify accessible logo, Drive/Instagram access and asset scope using legitimate permissions. For Drive, use authorised Google Drive MCP when configured; otherwise request an authorised synced/downloaded copy.
- Inventory available materials and create the Access & Asset Readiness Report, preserving folder structure and useful filenames. Record whether Cloudinary is available and authorised; do not upload until permissions, credentials and any costs are approved.
- **Gate:** No website implementation until access status, current project state and known blockers have been reported. If external assets are inaccessible, request a synced/downloaded authorised copy and continue only with work that does not rely on unseen facts/assets.

### Phase 2 — Requirements and product data assessment
- Translate this brief into a living requirements checklist with unique IDs.
- Audit brand claims, product data, policies, integrations and approvals.
- Build asset inventory, product-image mapping and data-gap report. Create the structured product library and asset manifest; if Cloudinary is selected and authorised, bulk upload and verify assets, recording public IDs, delivery URLs, image quality and product mappings.
- Identify dependencies, risks, reversible assumptions and client questions.
- **Gate:** Distinguish verified, assumed, missing and approval-required information. Do not fill gaps with invented content.

### Phase 3 — Research, strategy and architecture
- Conduct focused luxury-market and technical research with concise evidence notes.
- Establish original brand strategy, sitemap, customer journeys, design direction and content rules.
- Evaluate stack, database, CMS, media, payments, shipping, automation, analytics, hosting and monitoring.
- Document architecture, data models, security boundaries, integration contracts and operating costs/risks.
- **Gate:** Confirm major architectural decisions and identify services needing client accounts, paid plans or credentials.

### Phase 4 — Design system and experience foundation
- Create design tokens, typography, grid, responsive rules, component patterns, both themes, interaction/motion principles and accessibility conventions.
- Establish core navigation, page templates, loading/empty/error/success states and mobile-first behaviour.
- Validate the system against the actual logo and available product imagery.
- **Gate:** Review coherence, legibility, authenticity and responsive foundations before broad implementation.

### Phase 5 — Storefront and product experience
- Implement home/editorial experience, collections, PLPs, search/filter/sort, PDPs, galleries, wishlist, recently viewed and support/content pages as applicable.
- Bind content to verified product data and authentic assets, using quality-checked responsive imagery.
- Implement verified business contact links, contact/product-enquiry and callback interfaces with clear pending states for unconfigured services.
- Ensure all interactions are functional, accessible and responsive.

### Phase 6 — Backend, administration and commerce
- Implement database, migrations, secure APIs, authentication, authorisation, admin dashboard, products, inventory, carts, orders, payment lifecycle, fulfilment and notifications.
- Connect real services where access and credentials are available; otherwise implement documented integration points and mark blocked. Configure and test secure enquiry persistence/delivery and authorised admin enquiry management where approved.
- Validate server-side totals, stock, permissions, payment events and order state transitions.

### Phase 7 — Creative enhancement and optimisation
- Add purposeful motion, optional sound, 3D/WebGL or other immersive features where justified.
- Add graceful fallbacks, reduced-motion behaviour, low-power/network adaptations and accessible alternatives.
- Optimise media, rendering, caching, dependencies and Core Web Vitals.

### Phase 8 — Quality assurance and refinement
- Run automated, unit, integration, end-to-end, accessibility, security, performance and cross-browser checks as applicable.
- Manually review key pages and flows across viewport sizes and both themes.
- Fix defects, retest regressions and update the traceability checklist with evidence.
- **Gate:** Critical customer journeys and essential quality controls must pass before production deployment. Report anything that cannot be tested.

### Phase 9 — Deployment preparation and operation
- Prepare hosting, database, environment configuration, migrations, domain/DNS readiness, HTTPS, monitoring, logging, backups, error reporting and operational instructions.
- Deploy only with appropriate authorisation, credentials, approvals and safe production configuration.
- Verify deployed behaviour, integration health and rollback/recovery steps where possible.
- **Gate:** Never claim live or production-ready status without confirming deployment and required live integrations.

### Phase 10 — Final audit and handover
- Cross-check every requirement ID against implementation and test evidence.
- Document completed, partial, blocked and not-applicable items with reasons.
- Provide setup, architecture, environment, integrations, QA, deployment, operations and client-action documentation.
- Identify known limitations, remaining risks and recommended next steps.

---

## 19. Quality Assurance Protocol

Testing must reflect the real implementation and available infrastructure. Never report a test as passed if it was not run or if its result is inconclusive.

### 19.1 Functional and journey testing

Test, where implemented:
- Browse navigation, collections, search, filters, sorting and no-result/error states.
- Product gallery, zoom, variants, availability and product details.
- Add/update/remove cart items, quantity boundaries, stale stock and total recalculation.
- Guest and authenticated checkout paths, validation, address/contact fields and order summary.
- Payment sandbox lifecycle: create, verify, webhook, duplicate event, failure, retry, cancellation and mismatched amount/order handling.
- Order creation, confirmation, history, tracking and state transitions.
- Account/profile/address/wishlist/recently-viewed functions.
- Admin authentication, role permissions, product/media edits, price/stock changes, order handling, promotions/content and audit events.
- Theme persistence, sound controls, keyboard/touch interaction and fallback behaviour.
- Click-to-call, click-to-email, official Instagram links, WhatsApp click-to-chat only after number verification, contact/product-enquiry forms and callback requests; verify backend persistence/delivery and admin review where configured.

### 19.2 Security and privacy checks

Run appropriate static/dependency checks and test input validation, authorisation boundaries, session handling, rate limits, upload controls, secrets exposure, safe errors, webhook verification, data access restrictions and sensitive logging. Review relevant OWASP risks. Record exactly what was tested, tooling used, findings, fixes and residual risks.

### 19.3 Accessibility checks

Combine automated audits with manual keyboard navigation, focus review, form/error review, screen-reader spot checks where available, contrast checks, zoom/text scaling, reduced motion and accessible operation of menus, galleries, dialogs, theme and sound controls.

### 19.4 Performance and visual checks

Inspect Core Web Vitals, payloads, image delivery, loading behaviour, layout shifts, animation performance and low-end/mobile conditions. Review visual consistency on small and large screens, both themes, actual product imagery, text clipping, image crops, broken assets, console errors and interaction feedback.

### 19.5 Release readiness

Do not launch live payments or publish unapproved claims/policies. Use payment sandbox/testing before live mode. Verify environment separation, migrations, backups, monitoring, error handling, secrets, HTTPS, domain configuration and rollback plan. Clearly distinguish local development, preview, staging and production status.

---

## 20. Requirements Traceability Checklist

Create and maintain a project file such as `docs/requirements-traceability.md` (or an equivalent location appropriate to the repository). Assign stable IDs and use this baseline matrix. Add finer-grained IDs for implementation tasks as needed; do not remove baseline rows.

| ID | Requirement area | Master prompt section | Validation evidence / acceptance condition | Status |
|---|---|---|---|---|
| R01 | Business objective; real e-commerce, not prototype | 1, 8, 19 | Working storefront and verified commerce journeys | Not started |
| R02 | Brand identity and business-name clarity | 1, 2, 5 | MAAIRA FASHION BAGS used as brand; Maanya Enterprises used as business name; MAAIRA LUXURY retained only as logo lockup | Not started |
| R03 | Brand credentials and no fabricated claims | 1, 2, 14 | Exact claims, approval/source noted; no unsupported claims | Not started |
| R04 | Drive/Instagram/logo access verified | 2 | Access report states actual inspected scope and blockers | Not started |
| R05 | Full asset inventory and preserved originals | 3 | Inventory complete for accessible files; originals untouched | Not started |
| R06 | Product mapping and missing-data report | 3, 7 | Product/image associations have confidence; gaps documented | Not started |
| R07 | Luxury research; originality/no copying | 4 | Research note and distinct creative decisions documented | Not started |
| R08 | Logo fidelity and brand palette | 5 | Original asset retained; design reviewed against logo | Not started |
| R09 | Typography, design system and consistency | 5, 16 | Tokens/components applied consistently and licensed | Not started |
| R10 | Independently art-directed dark/light modes | 5 | All key screens/states reviewed in both modes | Not started |
| R11 | Cinematic but non-obstructive entrance | 6 | Fast path to shopping; no blocking intro; fallback works | Not started |
| R12 | Purposeful motion and signature interactions | 6 | Motion documented, usable, reduced-motion alternative | Not started |
| R13 | 3D/WebGL technologies only when justified | 6, 15 | Benefit, feasibility, performance and fallback verified | Not started |
| R14 | Authentic product imagery and storytelling | 3, 6, 7 | Product appearance not materially misrepresented | Not started |
| R15 | Complete site architecture and content pages | 7 | Routes/pages present with useful states | Not started |
| R16 | Search, filters, sorting and discovery | 7 | Verified catalog data drives functional discovery | Not started |
| R17 | Product detail and gallery functionality | 7 | Verified details, variants, imagery and actions work | Not started |
| R18 | Cart and accurate server-side totals | 8 | Cart updates; server recalculates and validates totals | Not started |
| R19 | Checkout and payment security | 8 | Sandbox flow and server verification pass | Not started |
| R20 | Orders, fulfilment and notifications | 8 | Real state transitions/integrations tested or blocked documented | Not started |
| R21 | Customer authentication/account | 8 | Secure account and recovery flows tested | Not started |
| R22 | Optional commerce enhancements | 8 | Enabled only with business support/approval | Not started |
| R23 | Backend/database architecture | 9, 16 | Persistent schema, migrations, APIs and validation work | Not started |
| R24 | Secure administrative dashboard | 9, 10 | Role/permission and admin workflows tested | Not started |
| R25 | Security, privacy and legal readiness | 10 | Checks evidenced; approved policies or explicit blockers | Not started |
| R26 | Optional, user-controlled sound | 11 | Toggle/mute works; no disruptive autoplay; licensed assets | Not started |
| R27 | Mobile-first responsive design | 12, 13 | Core flows tested across target viewport classes | Not started |
| R28 | WCAG 2.2 AA target | 12, 19 | Automated and manual checks; gaps documented | Not started |
| R29 | Performance/Core Web Vitals/fallbacks | 13, 19 | Measurements recorded; budgets and adaptations reviewed | Not started |
| R30 | SEO and structured product data | 14 | Metadata, crawl controls and schema validated | Not started |
| R31 | Privacy-conscious analytics/conversion | 14 | Approved events, consent and data minimisation reviewed | Not started |
| R32 | Tool/service selection and cost/security review | 15 | Each adopted integration has rationale and owner | Not started |
| R33 | Maintainable architecture and project docs | 16, 18 | Setup, decisions, contracts and code standards documented | Not started |
| R34 | Credit/context efficiency without quality loss | 17 | Reuse/incremental workflow; no requirements cut | Not started |
| R35 | Phased workflow and gates | 18 | Phase evidence and blockers recorded | Not started |
| R36 | QA across customer/admin journeys | 19 | Test report includes actual results and defects | Not started |
| R37 | Deployment and operational readiness | 18, 19, 21 | Deployment status verified; operations/rollback documented | Not started |
| R38 | Final audit and handover | 20, 21 | Every ID status/evidence and client actions supplied | Not started |
| R39 | Exact brand/business naming and official links | 1, 2, 5 | MAAIRA FASHION BAGS / Maanya Enterprises used correctly; website and Instagram links verified | Not started |
| R40 | Drive-to-library-to-Cloudinary workflow and manifest | 2, 3, 15 | Access evidence, inventory, product mappings, public IDs/URLs and upload verification recorded where configured | Not started |
| R41 | Product image quality and responsive delivery | 3, 7, 13, 19 | Source quality retained; delivered images checked for sharpness, colour, detail and responsive performance | Not started |
| R42 | Business contact, enquiries and callback integration | 2, 8, 9, 10 | Contact links work; forms validated; configured backend/admin delivery tested or blockers documented | Not started |

**Status vocabulary:** `Not started`, `In progress`, `Passed`, `Partial`, `Blocked`, `Not applicable`. Every `Passed` item requires evidence. Every `Partial` or `Blocked` item requires a concise reason, impact, dependency and next action. A mention in documentation alone is not implementation evidence.

---

## 21. Deployment, Maintenance & Final Deliverables

### 21.1 Deployment

Select suitable infrastructure after evaluating the application and operations. Vercel may be appropriate for frontend delivery, but do not assume it alone provides a suitable persistent backend/database or operational environment. Select compatible backend, database, media, payment and background-job services based on verified requirements.

Prepare and document:
- Environment separation and secure environment variables.
- Database provisioning, migrations, seed-data policy and backup/recovery.
- Domain/DNS and HTTPS readiness.
- Build/deploy commands, CI checks and release process.
- Monitoring, structured logs, error reporting and alerting where available.
- Cache/CDN and asset delivery configuration.
- Payment/webhook endpoints and verified configuration.
- Rollback/recovery instructions and operational ownership.
- Maintenance, dependency updates and access management.

Actual deployment requires authorisation and the necessary accounts/credentials. If unavailable, deliver deployment-ready configuration and exact instructions, and report deployment as not performed.

### 21.2 Final deliverables

Provide:
- Complete source code and maintainable project structure.
- Working frontend and backend to the extent supported by available services.
- Persistent database schema and migrations.
- Product asset inventory, product mapping and data-gap report.
- Design system and concise creative/technical decision record.
- Secure admin dashboard and commerce workflows that are actually implemented.
- `.env.example` or equivalent with variable names and descriptions only—never real secrets.
- Local setup, database, integration and deployment instructions.
- Testing/QA report with commands, outcomes, coverage boundaries and unresolved defects.
- Security, accessibility and performance findings, including residual risks.
- Integration inventory with provider, purpose, access status, cost/approval dependencies and fallback.
- Requirements traceability checklist with evidence and status for every ID.
- Client approvals/actions required, known limitations and recommended next steps.

### 21.3 Final delivery report

Summarise:
1. What is complete and demonstrably working.
2. Key creative and architecture decisions and why they were selected.
3. Tests actually performed and their results.
4. Security, accessibility and performance checks completed and outstanding.
5. External services connected, tested, awaiting credentials or not selected.
6. Deployment status—local, preview, staging or production—and evidence.
7. Missing product information, client approvals and operational dependencies.
8. Known limitations, residual risks and next steps.

Do not claim full production readiness while critical requirements, credentials, legal approvals, payment verification, security checks or operational dependencies remain unresolved. Use precise status language rather than promotional guarantees.

---

## 22. Final Acceptance Criteria

The project is acceptable for handover only when the following have been assessed against evidence:

- [ ] All requirements in the traceability matrix have a status and supporting evidence or a documented blocker.
- [ ] Brand name is MAAIRA FASHION BAGS; business name is Maanya Enterprises; MAAIRA LUXURY is treated as the supplied logo lockup; official links are correct and identity details are confirmed. The official logo remains accurate and undistorted.
- [ ] Supplied brand claims are used exactly and appropriately, with required client verification recorded.
- [ ] Accessible assets are inventoried and organised; Drive-to-library/Cloudinary mappings and upload verification are evidenced where configured; original client Drive assets have not been changed without authorisation.
- [ ] Product imagery is mapped where possible, delivered at suitable quality across devices, and missing commercial data is clearly identified, never invented.
- [ ] Original creative direction is grounded in the logo, real products and research, without copying competitors.
- [ ] Both themes are independently art-directed and functional across the shopping journey.
- [ ] Storefront discovery, product pages, cart, checkout, accounts, orders and admin functions are genuinely implemented as applicable.
- [ ] Server-side business logic governs pricing, inventory, order states and payment verification.
- [ ] No dead buttons, fake payment success, false stock, fabricated reviews or placeholder content presented as real remain.
- [ ] Security, privacy, legal-policy approvals, accessibility and performance have been meaningfully assessed and results documented.
- [ ] Animation, sound and 3D are purposeful, accessible, optional where appropriate and have fallbacks.
- [ ] SEO and approved privacy-conscious analytics are configured and checked where applicable.
- [ ] Contact links, contact/product-enquiry and callback workflows are tested where configured; WhatsApp click-to-chat is enabled only after number verification. Other integrations are justified, authorised, configured and tested—or explicitly marked blocked/unconfigured.
- [ ] Critical automated/integration/end-to-end tests pass or remaining failures are clearly documented with impact and mitigation.
- [ ] Deployment is verified only to the level actually achieved; setup and operational instructions are complete.
- [ ] Final report, source, documentation, client actions, limitations and next steps are delivered.

**Final directive:** Preserve every meaningful requirement in this brief. Think critically and practically; consolidate rather than repeat; distinguish mandatory functionality from optional exploration; and use broad creative and technical freedom to achieve an original, commercially useful MAAIRA experience. Do not confuse verbosity, complexity or advanced technology with quality. Do not omit essential work to save credits. Do not invent facts, access, credentials, integrations, test results or completion. Build and verify the real product to the greatest extent authorised and technically possible, and make every remaining dependency explicit.

---

# 2. E-COMMERCE-FIRST TRANSFORMATION

## CUSTOMER EXPERIENCE, CATALOGUE INTELLIGENCE & LUXURY STOREFRONT

### PRIMARY DIRECTIVE

The current website already has an acceptable visual/design foundation.

**DO NOT treat visual design, animations, 3D, sound, or visual effects as the primary objective anymore.**

The highest-priority objective of this phase is:

> **TRANSFORM MAAIRA INTO A PROPER, INTUITIVE, PREMIUM, REAL E-COMMERCE WEBSITE.**

The website must feel like a luxury fashion house's online store — not a portfolio, not a showcase website, not a design experiment, and not a static catalogue.

Every design decision from this point onward must answer:

> **Does this make shopping for a MAAIRA bag easier, clearer, faster, and more premium?**

If a visual effect looks impressive but makes shopping harder, remove or simplify it.

If a simple interface improves product discovery, keep it.

---

# 1. THE CORE MENTAL MODEL

Think of the website as:

**Luxury Storefront → Product Discovery → Product Evaluation → Cart → Checkout → Purchase → Post-Purchase**

NOT:

**Beautiful Homepage → Cool Animation → Product Cards**

The customer should always understand:

1. Where am I?
2. What products are available?
3. What type of bag am I looking for?
4. Which bag is suitable for my purpose?
5. How much does it cost?
6. What does it look like from different angles?
7. Is it available?
8. How do I add it to cart?
9. How do I buy it?

The entire UX must be optimized around this journey.

---

# 2. LUXURY E-COMMERCE REFERENCE DIRECTION

Use the information architecture and usability principles of established luxury fashion e-commerce websites such as Louis Vuitton as **reference inspiration**, NOT as something to copy.

Reference principles:

- extremely clear navigation
- minimal interface
- strong product imagery
- obvious shopping pathways
- clean product grids
- intuitive categories
- simple filters
- clear product information
- restrained typography
- sophisticated whitespace
- premium product presentation
- very few unnecessary interface elements
- predictable interactions
- effortless navigation

The goal is:

> **Luxury complexity underneath. Simplicity on the surface.**

A first-time internet shopper should be able to use the website without instructions.

An experienced e-commerce customer should feel that the site is extremely refined.

Do NOT copy Louis Vuitton's visual identity, layouts, assets, typography, wording, branding, or proprietary design.

Take inspiration from the **clarity and hierarchy of luxury e-commerce**, not the identity of another brand.

---

# 3. CUSTOMER-FIRST UX PRINCIPLE

Design for the widest realistic audience.

The website should work for:

- a young customer buying a fashion bag
- someone shopping for an office/work bag
- someone looking for a party/evening bag
- someone looking for an everyday handbag
- someone purchasing a gift
- someone who does not understand fashion terminology
- someone using a phone
- someone with limited digital literacy

Therefore:

### DO

Use language such as:

- Shop Bags
- New Arrivals
- Everyday
- Office & Work
- Party & Evening
- Crossbody
- Shoulder Bags
- Totes
- Mini Bags
- Best Sellers
- View All

### DON'T

Force customers to understand complicated fashion terminology before they can shop.

The customer should be able to browse based on:

**WHAT THEY NEED**

as well as:

**WHAT TYPE OF BAG IT IS.**

---

# 4. BUILD A REAL CATALOGUE SYSTEM

Do not treat the available 2–3 bags as three random cards.

Treat every actual bag discovered from the supplied assets as a real catalogue entity.

Each product should have structured metadata.

For example:

```text
Product
├── Product Name
├── SKU / Product ID
├── Price
├── Availability
├── Primary Image
├── Gallery Images
├── Bag Type
├── Occasion
├── Use Case
├── Size
├── Colour
├── Material
├── Dimensions
├── Description
├── Features
└── Related Products
```

Only populate attributes that can actually be verified from the supplied assets/client information.

**NEVER invent material, dimensions, capacity, colour names, features, stock quantities, ratings, discounts, or product specifications.**

If a value is unknown:

- omit it from the customer-facing interface, OR
- keep it as an internal field requiring confirmation.

Do not manufacture product information merely to make the catalogue look complete.

---

# 5. INTELLIGENT PRODUCT IMAGE GROUPING

This is extremely important.

The supplied product images may contain:

- front view
- back view
- side view
- angled view
- close-up
- detail shot
- model/lifestyle shot
- multiple photographs of the same bag

Do NOT treat every image as a separate product.

Use visual intelligence to determine which images belong to the same physical bag/product.

For every bag:

### PRIMARY IMAGE

Select the strongest image that communicates the complete product clearly.

### GALLERY

Group additional verified views of the same bag into that product's gallery.

For example:

```text
MAAIRA BAG A

Primary:
front/hero product image

Gallery:
01 front
02 side
03 back
04 detail
05 lifestyle
```

Do not duplicate the same product several times simply because several photographs exist.

---

# 6. CLOUDINARY IMAGE ARCHITECTURE

The product imagery supplied for implementation will be delivered through **Cloudinary links/assets**.

Build the catalogue around remote Cloudinary image URLs.

Do not assume local static image paths are the final production architecture.

The implementation should support:

- Cloudinary URLs
- responsive image sizing
- appropriate transformations
- lazy loading
- modern formats where available
- responsive `srcset`/equivalent strategy
- optimized thumbnails
- high-resolution product detail imagery
- graceful loading states
- fallback handling

Never degrade the original product photography unnecessarily.

Product images are the most important visual asset on the website.

---

# 7. AUTOMATIC BAG CLASSIFICATION

Analyze the actual available MAAIRA products and intelligently classify them.

Do NOT blindly assign categories.

Determine classification from the visible design and verified information.

Create a flexible taxonomy.

## PRIMARY BAG TYPES

Potential categories include:

- Tote Bags
- Shoulder Bags
- Crossbody Bags
- Handbags
- Top Handle Bags
- Mini Bags
- Clutches
- Bucket Bags
- Sling Bags
- Backpacks
- Other

Only show categories that actually contain products.

Do NOT create empty categories just because they are common in fashion e-commerce.

---

# 8. SHOP-BY-OCCASION

This is a major opportunity for MAAIRA.

Customers often don't think:

> "I need a specific silhouette."

They think:

> "I need a bag for office."

or:

> "I need a bag for a party."

Therefore create intelligent occasion/use-case discovery where supported by the actual products.

Potential categories:

### EVERYDAY

Bags suitable for regular daily use.

### OFFICE & WORK

Professional, structured or practical bags where the actual product supports this classification.

### PARTY & EVENING

Statement/evening-oriented bags where the product visually supports it.

### OCCASION

Special-event oriented bags.

### TRAVEL

Only if actual product characteristics support it.

### GIFTING

A discovery pathway for customers shopping for someone else.

IMPORTANT:

Do not classify products based purely on assumptions.

Use the actual product appearance, dimensions, construction and verified information.

If classification is uncertain, do not expose the category.

---

# 9. SHOP-BY-STYLE

Create a second discovery layer based on actual bag silhouette/type.

Example:

```text
SHOP

All Bags
New Arrivals
Best Sellers

BY STYLE
Tote Bags
Shoulder Bags
Crossbody Bags
Handbags
Mini Bags
Clutches
Top Handle
```

Only display populated categories.

This gives customers two different ways to shop:

### "I know what I want."

→ Shop by Style

### "I know what I need."

→ Shop by Occasion

This is a critical e-commerce UX principle.

---

# 10. HOMEPAGE SHOULD BECOME A SHOPPING ENTRY POINT

The homepage must NOT function like a cinematic brand presentation where the customer has to scroll through multiple artistic sections before reaching products.

The homepage should immediately communicate:

**MAAIRA**
Luxury Bags

Then provide a clear primary action:

**SHOP BAGS**

The first screen should establish:

- brand
- product category
- luxury positioning
- clear shopping CTA

Then progressively introduce:

1. Featured products
2. Shop by category
3. Shop by occasion
4. New arrivals / featured collection
5. Brand story
6. Trust/brand credentials
7. Customer support/contact
8. Footer

The customer must be able to reach products extremely quickly.

---

# 11. NAVIGATION ARCHITECTURE

Create a simple, predictable global navigation.

Recommended structure:

```text
MAAIRA LOGO

SHOP
NEW ARRIVALS
COLLECTIONS
ABOUT
CONTACT

SEARCH
ACCOUNT
WISHLIST
CART
```

On desktop, use a clean luxury navigation.

On mobile:

```text
☰ MENU

LOGO

SEARCH / CART
```

Do not overload the navigation.

---

# 12. SHOP MEGA MENU / DISCOVERY MENU

If the catalogue supports enough products, create a refined mega menu.

Possible structure:

```text
SHOP

SHOP ALL

BY STYLE
• Shoulder Bags
• Crossbody Bags
• Tote Bags
• Handbags
• Mini Bags
• Clutches

BY OCCASION
• Everyday
• Office & Work
• Party & Evening
• Gifting

FEATURED
• New Arrivals
• Best Sellers
```

Again:

**Do not display categories with zero actual products.**

The system must be data-driven.

As the catalogue grows, categories should become available automatically when appropriate.

---

# 13. SHOP / COLLECTION PAGE

The main Shop page should feel like a genuine luxury e-commerce catalogue.

Structure:

```text
SHOP ALL

Short elegant introduction

[Filter] [Sort]

PRODUCT GRID
```

Product cards should contain:

- product image
- product name
- price
- availability if relevant
- subtle wishlist
- clear clickable area

Do not overload cards with information.

The product image should dominate.

---

# 14. FILTERING

Implement useful filters based on actual catalogue metadata.

Potential filters:

### CATEGORY / STYLE
- Tote
- Shoulder
- Crossbody
- etc.

### OCCASION
- Everyday
- Office
- Party
- etc.

### COLOUR

Only if verified.

### PRICE

Only if real prices are available.

### AVAILABILITY

Where applicable.

### SIZE

Only where structured product size data exists.

Do NOT create filters simply because e-commerce websites commonly have them.

Every filter must correspond to actual data.

Filters must work together.

Example:

```text
Crossbody
+
Black
+
₹XXXX–₹XXXX
```

should return only products satisfying all active conditions.

---

# 15. SORTING

Provide intuitive sorting.

Potential options:

- Featured
- Newest
- Price: Low to High
- Price: High to Low
- Best Selling

Only implement options that have legitimate underlying data.

Never pretend that something is "Best Selling" without real data.

---

# 16. SEARCH

Search should be extremely simple.

A customer should be able to type:

```text
black bag
office bag
crossbody
party
```

and receive useful results based on:

- product name
- category
- tags
- occasion
- verified attributes

Search should handle:

- empty search
- partial queries
- no results
- spelling variation where practical
- loading state
- error state

No-result experience should help the customer recover:

> "No bags matched your search."

Then show:

**Browse All Bags**

---

# 17. PRODUCT CARD UX

Product cards should feel premium but extremely understandable.

Example:

```text
[PRODUCT IMAGE]

MAAIRA [PRODUCT NAME]

₹XXXX

♡
```

On hover:

- subtle image transition
- optional second product image
- very subtle interaction

Do NOT use excessive animation.

On mobile:

- no hover dependency
- touch-friendly
- fast image loading

Clicking the card should take the customer directly to the product detail page.

---

# 18. PRODUCT DETAIL PAGE

This is one of the most important pages on the entire website.

The product page should answer:

> "Should I buy this?"

Structure:

```text
Breadcrumb

PRODUCT IMAGE GALLERY

Product Name
₹XXXX

Availability

Short product description

[ADD TO CART]
[BUY NOW — IF ENABLED]

♡ ADD TO WISHLIST

Product Details
Shipping / Delivery
Returns
Support

Related Products
```

The image gallery should be excellent.

Desktop:

```text
Large primary image
+
secondary thumbnails / image rail
```

Mobile:

```text
Swipeable image gallery
```

Include zoom where useful.

---

# 19. PRODUCT IMAGE EXPERIENCE

Luxury fashion e-commerce relies heavily on product photography.

Therefore:

- use large images
- preserve aspect ratio
- avoid unnecessary cropping
- allow detailed viewing
- maintain consistent product presentation
- use high-quality Cloudinary sources
- optimize delivery without visibly destroying quality

The customer should be able to inspect the bag before purchasing.

---

# 20. PRICE PRESENTATION

For demo/catalogue data where the actual selling price has not yet been approved:

Use:

**₹XXXX**

Do NOT invent realistic-looking prices.

When real prices are supplied:

- display Indian Rupee formatting
- use correct currency
- ensure cart calculations use authoritative backend values
- never trust client-side prices

Do NOT create:

- fake discounts
- fake sale prices
- fake percentage-off labels
- fake urgency
- fake scarcity

---

# 21. CART EXPERIENCE

The cart must feel like a real shopping cart.

Support:

- add item
- remove item
- quantity update
- item image
- product name
- selected variant where applicable
- price
- subtotal
- checkout CTA

Cart should be accessible from every page.

Use a subtle cart drawer where appropriate, but ensure a full cart page is available.

After adding a product:

Show clear feedback:

> Added to Bag

Do not make the customer guess whether the action worked.

---

# 22. CHECKOUT EXPERIENCE

Checkout must be:

**SIMPLE. FAST. TRUSTWORTHY.**

Avoid unnecessary fields.

Use clear sections:

```text
CONTACT
DELIVERY
ORDER SUMMARY
PAYMENT
```

Do not overwhelm customers with a complicated multi-step interface.

The checkout should work beautifully on mobile.

Payment implementation must follow the requirements already defined in the Master Prompt.

Do not simulate successful payments.

---

# 23. WISHLIST

Implement wishlist functionality where backend/auth architecture supports it.

Customers should be able to save products for later.

Wishlist icon:

**♡**

Keep it subtle.

After activation:

**♥**

Provide clear feedback.

---

# 24. RELATED PRODUCTS

At the bottom of each product page:

### YOU MAY ALSO LIKE

Recommendations should be based on real catalogue relationships.

Examples:

- same category
- same occasion
- similar colour
- complementary style
- manually curated relationship

Do not randomly repeat products.

Do not recommend nonexistent products.

---

# 25. "SHOP BY NEED" UX

Add a highly intuitive discovery section.

Possible interface:

```text
WHAT ARE YOU LOOKING FOR?

[ EVERYDAY ]
[ OFFICE ]
[ PARTY ]
[ TRAVEL ]
[ GIFTING ]
```

The cards should be elegant and visual.

When clicked, they should lead to filtered catalogue results.

This is NOT decorative content.

It is a shopping shortcut.

---

# 26. "SHOP BY STYLE" UX

Another discovery layer:

```text
SHOP BY STYLE

[ TOTES ]
[ SHOULDER ]
[ CROSSBODY ]
[ HANDBAGS ]
[ MINI ]
```

Only show categories supported by actual products.

Use product photography where available rather than generic stock imagery.

---

# 27. PRODUCT TAXONOMY MUST BE SCALABLE

The current demo may only contain a few products.

That is NOT an excuse to hard-code a three-product website.

Architect the catalogue so that:

```text
3 products today
↓
20 products later
↓
100+ products later
```

does not require redesigning the entire application.

Categories, filters, search, product pages, recommendations and navigation should derive from structured product data.

---

# 28. DO NOT MAKE UP PRODUCTS

This is extremely important.

If the available assets contain only three actual bags:

**SHOW THREE ACTUAL BAGS.**

Do NOT generate fake fourth, fifth, sixth or tenth products simply to make the store look bigger.

A luxury brand with a small authentic catalogue is better than a large fake catalogue.

You may create elegant editorial sections around the real products.

You may NOT fabricate products.

---

# 29. PRODUCT CLASSIFICATION WORKFLOW

Before implementing the final catalogue:

### STEP 1
Inspect all available Cloudinary product images.

### STEP 2
Identify unique physical bags.

### STEP 3
Group duplicate/alternate views.

### STEP 4
Select the strongest primary image.

### STEP 5
Build the gallery.

### STEP 6
Identify objectively visible characteristics.

### STEP 7
Assign verified taxonomy.

### STEP 8
Assign occasion/use-case only when reasonably supported.

### STEP 9
Create structured product records.

### STEP 10
Connect them to:

- Shop
- Search
- Filters
- Categories
- Occasion pages
- Product detail
- Cart
- Wishlist
- Related products

---

# 30. PRODUCT DATA MODEL

Create a scalable structure conceptually similar to:

```ts
Product {
  id
  sku
  name
  slug

  price
  currency

  images {
    primary
    gallery[]
  }

  category
  styles[]
  occasions[]
  tags[]

  colour
  material
  dimensions

  description
  features[]

  availability
  stock

  createdAt
  updatedAt
}
```

Only populate verified fields.

If the database schema already exists, extend it intelligently rather than unnecessarily rebuilding the backend.

---

# 31. LUXURY WITHOUT CONFUSION

The visual design should communicate luxury through:

- spacing
- typography
- photography
- hierarchy
- restraint
- interaction quality
- consistency

NOT through:

- excessive animations
- huge text everywhere
- unnecessary 3D
- complicated navigation
- decorative loading screens
- hidden buttons
- experimental gestures
- excessive parallax

Luxury should feel effortless.

---

# 32. ACCESSIBILITY + DIGITAL LITERACY

The interface must be understandable without prior knowledge.

Buttons should say:

**SHOP NOW**

rather than cryptic icons alone.

Use recognizable symbols only as supporting elements.

Every important action must have an accessible label.

Ensure:

- readable text
- strong contrast
- large touch targets
- keyboard navigation
- visible focus
- screen-reader labels
- clear errors
- clear success states

The website should feel obvious.

---

# 33. MOBILE E-COMMERCE

Assume a significant percentage of customers will shop from phones.

Mobile must NOT be a reduced desktop version.

Optimize specifically for:

- thumb reach
- sticky/add-to-cart actions where appropriate
- swipeable product galleries
- fast image loading
- readable product information
- simple filters
- simple sorting
- persistent cart access
- frictionless checkout

The shopping experience must remain premium at 360px width.

---

# 34. ANIMATION PRIORITY

Animations remain welcome, but they are now subordinate to commerce.

Use animation to improve:

- product discovery
- product transitions
- image gallery interaction
- navigation feedback
- cart feedback
- page transitions
- perceived quality

Do NOT animate:

- every text block
- every button
- every section
- essential commerce information in a way that delays access

The customer should never have to wait for an animation before shopping.

---

# 35. 3D / IMMERSIVE EFFECTS

Keep advanced 3D only where it provides actual value.

Good:

- subtle product reveal
- premium hero interaction
- controlled product rotation
- material-inspired visual treatment
- editorial transitions

Bad:

- 3D environments that hide products
- heavy WebGL before catalogue content
- decorative effects that hurt performance
- effects that interfere with scrolling
- effects that make product selection difficult

**E-COMMERCE ALWAYS WINS.**

---

# 36. HOMEPAGE INFORMATION HIERARCHY

Target structure:

```text
01 — HERO
MAAIRA
Luxury Bags

SHOP BAGS

02 — FEATURED / NEW ARRIVALS
Real products

03 — SHOP BY STYLE
Real catalogue categories

04 — SHOP BY OCCASION
Everyday / Office / Party / etc.
Only where supported

05 — FEATURED PRODUCT / EDITORIAL
Luxury storytelling around real products

06 — BRAND / MAAIRA STORY

07 — TRUST / BRAND CREDENTIALS
Only verified supplied claims

08 — CUSTOMER SUPPORT / CONTACT

09 — FOOTER
```

The exact structure may evolve after inspecting the current site, but the **shopping hierarchy must remain dominant**.

---

# 37. FOOTER

Create a proper e-commerce footer.

Potential structure:

```text
SHOP
Shop All
New Arrivals
Categories
Collections

CUSTOMER CARE
Contact
Shipping
Returns
FAQs

ABOUT
About MAAIRA
Our Story

FOLLOW
Instagram

LEGAL
Privacy Policy
Terms
```

Only expose pages/policies that actually exist or are approved.

Do not fabricate policy content.

---

# 38. TRUST

Luxury e-commerce requires confidence.

Where verified, surface:

- established brand information
- manufacturer identity
- supplied achievement claims
- customer support
- secure checkout
- clear delivery information
- clear return information

Do not invent:

- fake reviews
- fake star ratings
- fake testimonials
- fake trust badges
- fake certifications
- fake payment logos
- fake guarantees

---

# 39. EMPTY STATES

Design polished states for:

### Empty Cart

> Your bag is waiting.

**Continue Shopping**

### Empty Wishlist

> Save the pieces you love.

**Explore Bags**

### No Search Results

> We couldn't find a match.

**Browse All Bags**

### Category With No Products

Do not normally expose it.

---

# 40. DATA-DRIVEN CATEGORY VISIBILITY

This is mandatory.

If the catalogue contains:

```text
3 Crossbody
2 Shoulder
0 Totes
```

The interface should show:

```text
Crossbody
Shoulder
```

and should not prominently advertise:

```text
Totes
```

until a real Tote exists.

The website must evolve naturally as the catalogue grows.

---

# 41. ADMIN / BACKEND THINKING

The admin architecture must eventually allow authorised staff to:

- create products
- upload Cloudinary images
- assign categories
- assign occasions
- assign tags
- set price
- manage inventory
- publish/unpublish
- manage orders
- update availability

The storefront should consume this structured catalogue.

Do not hard-code product information throughout the UI.

---

# 42. E-COMMERCE PRIORITY ORDER

When deciding what to build first, use this priority:

### P0 — ABSOLUTE

1. Product catalogue
2. Product detail pages
3. Categories
4. Search
5. Filters
6. Product images
7. Cart
8. Checkout
9. Pricing integrity
10. Mobile shopping
11. Backend persistence
12. Inventory/order integrity

### P1 — HIGH

13. Wishlist
14. Related products
15. Shop-by-occasion
16. Shop-by-style
17. Customer account
18. Order history
19. Customer support

### P2 — ENHANCEMENT

20. Advanced animation
21. 3D
22. Sound
23. Editorial interactions
24. Advanced visual effects

If time, credits, or implementation complexity force a choice:

> **Finish P0 before spending effort on P2.**

---

# 43. IMPORTANT: DO NOT REBUILD FOR THE SAKE OF REBUILDING

Audit the current implementation first.

Keep what is already good.

Improve what is weak.

Replace only what genuinely prevents the site from becoming a high-quality e-commerce experience.

Do not destroy working backend architecture merely to change the frontend.

Do not rebuild the entire application unnecessarily.

---

# 44. CURRENT SITE AUDIT

Before changing code, inspect:

- current navigation
- current homepage
- current Shop page
- product cards
- product detail
- cart
- checkout
- search
- filtering
- responsive behaviour
- backend
- database
- image architecture
- Cloudinary integration
- admin capability
- loading states
- error states

Identify:

### KEEP
What already works.

### IMPROVE
What is usable but weak.

### REBUILD
What is fundamentally preventing a proper e-commerce experience.

### REMOVE
What looks impressive but harms shopping clarity.

---

# 45. FINAL EXPERIENCE TEST

After implementation, test the website as a completely new customer.

Do not ask:

> "Does this look cool?"

Ask:

### Test 1
Can I find all bags within 5 seconds?

### Test 2
Can I understand what categories exist?

### Test 3
Can I find a bag for a specific occasion?

### Test 4
Can I search for a product?

### Test 5
Can I filter products?

### Test 6
Can I understand a product without asking someone?

### Test 7
Can I inspect the product images properly?

### Test 8
Can I add it to my cart without confusion?

### Test 9
Can I reach checkout easily?

### Test 10
Can I complete the flow comfortably on mobile?

### Test 11
Can a first-time or low-digital-literacy customer understand the interface?

### Test 12
Does the website still feel luxurious while doing all of this?

If any answer is "no":

**fix the UX before adding more visual effects.**

---

# 46. FINAL DESIGN PHILOSOPHY

The finished website should communicate:

> **"This is a luxury brand."**

while the interface communicates:

> **"This is incredibly easy to shop."**

That combination is the goal.

Not:

> "Look how technically impressive this website is."

Instead:

> "I immediately know what I want, I found it quickly, it looks beautiful, I trust the website, and I know exactly how to buy it."

That is the MAAIRA experience.

---

# FINAL EXECUTION COMMAND

Now audit the existing MAAIRA implementation and transform it around this **E-COMMERCE-FIRST** philosophy.

Use the existing Master Prompt as the governing source of truth.

Preserve all mandatory requirements already defined there.

Use the supplied Cloudinary product assets as the source for the real catalogue.

Intelligently group product images into actual products.

Create structured, scalable catalogue metadata.

Implement real category and occasion-based discovery where supported.

Make Shop the centre of the experience.

Make Product Detail pages commercially excellent.

Make Cart and Checkout obvious and frictionless.

Make Search and Filters genuinely useful.

Make the entire system scalable beyond the current demo catalogue.

Keep the luxury aesthetic.

Keep tasteful premium motion.

But remember:

# THIS IS AN E-COMMERCE WEBSITE FIRST.

**PRODUCT DISCOVERY → PRODUCT CONFIDENCE → CART → CHECKOUT → PURCHASE**

Everything else supports that journey.

Do not stop at recommendations.

Inspect the current implementation and **actually implement the improvements in the codebase.**

At the end, report:

1. What changed
2. Catalogue structure created
3. Categories/occasions detected
4. Product image grouping decisions
5. E-commerce functionality completed
6. Backend functionality completed
7. Cloudinary integration status
8. Mobile UX status
9. Remaining blockers/dependencies
10. Tests performed
11. What is genuinely production-ready vs demo-only

Do not claim a feature is functional unless it has actually been tested.

---

# 3. PRODUCTION-GRADE FULL-STACK, SECURITY & LAUNCH

## PRIMARY OBJECTIVE

The current MAAIRA website must now be treated as a **real commercial business website approaching production launch**, not an AI-generated demo, visual prototype, VibeCode showcase, or static frontend.

The goal of this phase is:

> **TAKE THE EXISTING MAAIRA CODEBASE AND DEVELOP IT INTO A PRODUCTION-GRADE, FULL-STACK, SECURE, MAINTAINABLE E-COMMERCE APPLICATION THAT CAN BE LAUNCHED AFTER FINAL BUSINESS CREDENTIALS, POLICIES, CONTENT APPROVAL AND PRODUCTION CONFIGURATION ARE PROVIDED.**

The final result should feel like it was built by a professional product engineering team for a real luxury fashion business.

It must NOT feel like:

- an AI website
- a VibeCode experiment
- a frontend-only demo
- a fake e-commerce prototype
- a collection of animations with simulated functionality
- a website where buttons appear functional but do nothing

Every important user action must connect to real underlying logic.

---

# 1. FIRST: AUDIT EVERYTHING

Before making major changes, inspect the entire existing codebase.

Audit:

- frontend architecture
- backend architecture
- API routes
- database
- authentication
- admin system
- product system
- inventory
- cart
- checkout
- payment integration
- order management
- Cloudinary integration
- environment variables
- deployment configuration
- middleware
- security headers
- validation
- error handling
- logging
- rate limiting
- email infrastructure
- contact/enquiry forms
- responsive implementation
- accessibility
- SEO
- legal pages
- performance
- dependencies
- exposed secrets
- unused packages
- development-only code
- mock data
- hardcoded data
- fake functionality
- placeholder functionality

Categorize everything as:

### PRODUCTION READY
Actually functional and tested.

### PARTIALLY READY
Works but requires hardening/configuration.

### DEMO ONLY
Looks functional but isn't connected to real infrastructure.

### MISSING
Required for a serious production website.

Do not assume that something is production-ready simply because the UI exists.

---

# 2. FULL-STACK DEVELOPMENT

The website must have a proper separation between:

## FRONTEND

Responsible for:

- UI
- UX
- navigation
- product discovery
- product presentation
- forms
- cart interface
- checkout interface
- customer account interface
- loading states
- error states
- accessibility
- responsive behaviour

## BACKEND

Responsible for:

- authentication
- authorization
- product data
- inventory
- cart persistence
- orders
- payment verification
- customer data
- admin operations
- enquiries
- transactional workflows
- server-side validation
- security
- business rules

## DATABASE

Use persistent storage for all important business data.

Do not use:

- localStorage as the source of truth for orders
- frontend-only product data
- fake JSON persistence
- hardcoded order state
- client-controlled pricing
- simulated payment state

Client-side state can be used for UX.

It must NOT be treated as authoritative business data.

---

# 3. REAL E-COMMERCE LOGIC

Ensure the complete customer journey is backed by real logic:

```text
DISCOVERY
↓
PRODUCT
↓
CART
↓
CHECKOUT
↓
PAYMENT
↓
ORDER CREATION
↓
ORDER CONFIRMATION
↓
FULFILMENT
↓
CUSTOMER SUPPORT
```

Verify every transition.

If the customer adds a product to the cart:

→ backend must understand the product.

If the customer changes quantity:

→ validate against actual availability.

If checkout begins:

→ server must calculate authoritative totals.

If payment succeeds:

→ server must independently verify payment.

If an order is created:

→ persist it permanently.

If payment fails:

→ order/payment state must remain correct.

Never trust the browser to tell the backend:

> "Payment succeeded."

---

# 4. DATABASE ARCHITECTURE

Create or harden a proper production database architecture.

At minimum evaluate entities such as:

```text
User
Product
ProductImage
Category
Collection
Cart
CartItem
Wishlist
Order
OrderItem
Payment
Address
Inventory
AdminUser
ContactEnquiry
CallbackRequest
AuditLog
```

Use the minimum required schema rather than creating unnecessary complexity.

Relationships must be properly designed.

Use:

- primary keys
- foreign keys
- indexes
- constraints
- timestamps
- unique constraints
- appropriate nullable/non-nullable fields
- transactional operations where necessary

Do not duplicate business-critical data unnecessarily.

---

# 5. PRODUCT DATA

Products must come from the database / CMS architecture.

Do not hard-code the production catalogue into UI components.

Product records should support:

- name
- slug
- SKU
- description
- price
- currency
- images
- category
- occasion
- style
- verified attributes
- availability
- inventory
- publication state
- created date
- updated date

Only store/display verified product information.

---

# 6. CLOUDINARY IMAGE SYSTEM

Cloudinary is an important part of the product media architecture.

Treat Cloudinary as a proper production asset delivery system.

Support:

- secure image URLs
- optimized transformations
- responsive delivery
- appropriate dimensions
- WebP/AVIF where supported
- thumbnails
- high-resolution product images
- lazy loading
- CDN delivery
- focal/crop handling where appropriate

Do not unnecessarily download massive original images to the browser.

---

# 7. IMPORTANT: INTELLIGENT IMAGE EDITING

You have access to the supplied Cloudinary product imagery.

You may improve the **presentation/background treatment** of product images when necessary.

For example:

If a product image has:

- an extremely plain background
- distracting background
- poor visual balance
- inconsistent background treatment
- insufficient luxury presentation

you may create an improved presentation treatment.

The goal is:

> **Make the real product look professionally photographed and presented.**

However:

## NEVER alter the actual product deceptively.

Do NOT:

- change the bag's shape
- invent handles
- change hardware
- alter logos
- change colours deceptively
- add/remove product features
- modify material appearance to imply a different material
- create fake product variants
- manufacture details that do not exist

The actual bag must remain authentic.

You may improve:

- background
- lighting presentation
- neutral studio environment
- subtle shadows
- tasteful surface
- luxury editorial setting
- background composition
- crop
- framing
- consistency between product images

---

# 8. IMAGE ART DIRECTION

Do not automatically place every product on the same generic background.

Use your judgement.

Evaluate each image individually.

For example:

### CLEAN PRODUCT IMAGE

Use:

- sophisticated neutral background
- subtle grounding shadow
- premium studio lighting

### EDITORIAL IMAGE

Preserve the original environment if it adds value.

### PRODUCT WITH POOR BACKGROUND

Consider creating a refined background that complements the bag.

### DARK BAG

Use enough tonal separation for the silhouette to remain visible.

### LIGHT BAG

Avoid backgrounds that destroy edge definition.

The product must always remain the visual hero.

---

# 9. IMAGE CONSISTENCY

The catalogue should feel like one professional luxury collection.

Ensure reasonable consistency in:

- image ratio
- framing
- visual weight
- scale
- background treatment
- lighting
- whitespace

However, do not force every image into an identical crop if doing so damages the product presentation.

---

# 10. ADMIN PANEL

Build a proper authenticated administration layer.

The admin should eventually allow authorized staff to:

### PRODUCTS

- create product
- edit product
- delete/archive product
- upload images
- connect Cloudinary assets
- reorder gallery
- assign categories
- assign occasions
- assign tags
- update price
- update inventory
- publish/unpublish

### ORDERS

- view orders
- inspect order details
- update legitimate order status
- inspect payment state
- inspect customer information where authorized

### CUSTOMERS

Only expose the minimum customer data required.

### ENQUIRIES

- view contact enquiries
- callback requests
- mark handled/unhandled

### AUDIT

Record important administrative actions.

---

# 11. ADMIN SECURITY

Never rely on:

```text
if (user.isAdmin)
```

on the frontend alone.

Every sensitive admin API must independently verify authorization on the server.

Implement:

- secure authentication
- role-based authorization
- protected routes
- session security
- secure cookies where applicable
- CSRF protection where applicable
- brute-force protection
- rate limiting
- audit logging
- secure password handling if passwords are used
- account recovery security

An attacker must not be able to access admin APIs merely by manipulating frontend requests.

---

# 12. SECURITY IS A FIRST-CLASS REQUIREMENT

Perform a complete security hardening pass.

The goal is to significantly reduce attack surface and defend against common web application attacks.

Evaluate protection against:

- SQL injection
- NoSQL injection where applicable
- XSS
- CSRF
- SSRF
- command injection
- path traversal
- broken access control
- IDOR
- privilege escalation
- authentication bypass
- session hijacking
- brute-force attacks
- credential stuffing
- malicious file uploads
- insecure deserialization
- API abuse
- rate-limit bypass
- parameter tampering
- price manipulation
- inventory manipulation
- order manipulation
- payment-state manipulation

Use established secure engineering practices.

Do not invent custom cryptography.

Do not store secrets in frontend code.

---

# 13. SECRETS MANAGEMENT

Absolutely no:

- API keys in frontend source
- database credentials in frontend
- payment secrets in frontend
- Cloudinary private credentials exposed publicly
- admin credentials committed to Git
- `.env` secrets committed to repository

Use environment variables / secret management appropriately.

Audit the repository for accidentally exposed credentials.

If any secret appears exposed:

1. identify it
2. remove it from code
3. recommend rotation
4. update environment configuration

Do not simply hide a secret visually.

---

# 14. API SECURITY

Every API endpoint should be reviewed.

For each endpoint ask:

- Who can call this?
- What data can they send?
- What data can they receive?
- Is authentication required?
- Is authorization required?
- Is input validated?
- Is the request rate limited?
- Can an attacker manipulate IDs?
- Can an attacker access another customer's data?
- Can an attacker modify business-critical values?
- Are errors leaking sensitive information?

Reject unauthorized or malformed requests.

---

# 15. SERVER-SIDE VALIDATION

Never rely only on frontend validation.

Validate on the server:

- email
- phone
- address
- product ID
- quantity
- price
- coupon
- order ID
- user ID
- admin actions
- uploaded files
- payment data
- request payloads

Use strict schemas.

Reject unexpected fields where appropriate.

---

# 16. PRICE SECURITY

This is extremely important for an e-commerce website.

Never allow:

```text
Frontend:
price = ₹4999
```

to determine the order amount.

The server must retrieve the actual product price.

Example:

```text
Client → product ID + quantity

Server →
fetch product
verify availability
fetch authoritative price
calculate subtotal
calculate shipping/tax if configured
calculate final amount
create order/payment request
```

Client-side prices are display values only.

---

# 17. INVENTORY SECURITY

Prevent customers from manipulating inventory through client requests.

Server must validate:

- product exists
- product is published
- product is purchasable
- requested quantity is valid
- stock is sufficient
- stock state is current

Use appropriate transactional/locking logic where necessary to prevent race conditions.

---

# 18. PAYMENT SECURITY

Follow the existing Master Prompt's payment requirements.

Evaluate an India-compatible provider such as Razorpay or another approved provider.

Implement:

- server-side order creation
- server-side verification
- webhook verification
- signature validation
- amount matching
- currency matching
- order matching
- idempotency
- replay protection
- failure handling
- retry handling

Never mark an order as paid solely because:

```text
payment-success
```

appears in the browser.

Payment provider confirmation must be independently verified.

---

# 19. WEBHOOK SECURITY

All webhooks must be treated as untrusted until verified.

Implement:

- signature verification
- timestamp/replay protection where supported
- idempotent processing
- safe retries
- correct state transitions
- logging

Repeated webhook delivery must not create duplicate orders.

---

# 20. AUTHENTICATION

If customer accounts are implemented:

Use secure authentication architecture.

Protect against:

- weak sessions
- session fixation
- token leakage
- insecure password storage
- account enumeration where relevant
- brute force
- insecure password reset

Use established authentication libraries/providers instead of creating custom authentication unnecessarily.

---

# 21. CUSTOMER DATA PRIVACY

Collect only information genuinely required for:

- account
- order
- delivery
- support

Do not collect unnecessary personal information.

Do not expose customer information through:

- URLs
- client logs
- public APIs
- error messages
- browser storage unnecessarily

Ensure one customer cannot access another customer's:

- orders
- address
- account
- wishlist
- personal data

---

# 22. SECURITY HEADERS

Implement appropriate production security headers, considering the actual application architecture.

Evaluate:

- Content-Security-Policy
- Strict-Transport-Security
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy
- frame protection
- secure cookie configuration

Do not blindly copy a CSP that breaks legitimate Cloudinary/payment functionality.

Create a policy appropriate for the actual application.

---

# 23. RATE LIMITING

Apply rate limiting to sensitive endpoints such as:

- login
- password recovery
- contact forms
- callback forms
- search APIs where necessary
- checkout
- payment-related endpoints
- admin APIs
- OTP endpoints if applicable

Prevent obvious abuse.

---

# 24. INPUT / FILE SECURITY

For uploaded files:

- validate file type
- validate MIME type
- validate size
- restrict allowed formats
- avoid executable uploads
- avoid trusting filename extensions
- sanitize metadata where appropriate
- store through approved media infrastructure

Do not allow arbitrary server-side file execution.

---

# 25. ERROR HANDLING

Production users should NEVER see:

- stack traces
- database errors
- secret values
- internal filesystem paths
- API keys
- framework debugging information

Show useful user-facing messages.

Log detailed technical information securely on the server.

---

# 26. LOGGING & MONITORING

Implement useful production observability.

Log important events such as:

- authentication events
- admin actions
- order creation
- payment events
- webhook events
- important failures
- suspicious activity

Never log:

- passwords
- full payment card data
- secrets
- unnecessary sensitive personal information

Use structured logs where possible.

---

# 27. AUDIT LOG

Important admin/business actions should have traceability.

Examples:

```text
Admin created product
Admin changed price
Admin changed inventory
Admin published product
Admin changed order state
Admin changed customer-related data
```

Record appropriate:

- actor
- action
- timestamp
- target
- result

Do not store unnecessary sensitive information in audit logs.

---

# 28. LEGAL / TRUST PAGES

Before launch, the website must have the appropriate legal/trust pages required for the actual business and jurisdiction.

Evaluate and prepare:

- Privacy Policy
- Terms & Conditions
- Shipping Policy
- Return / Refund Policy
- Cancellation Policy
- Cookie Policy / Cookie information where applicable
- Contact / Customer Support information

IMPORTANT:

Do NOT invent legally binding policies from assumptions.

Where business-specific details are required, create clearly marked placeholders/questions for client approval.

Examples:

```text
[CLIENT TO CONFIRM RETURN WINDOW]
[CLIENT TO CONFIRM SHIPPING COVERAGE]
[CLIENT TO CONFIRM REFUND PROCESS]
[CLIENT TO CONFIRM DATA CONTROLLER DETAILS]
```

Do not publish fabricated legal claims.

The final production legal text should be reviewed/approved by the business and, where appropriate, qualified legal counsel.

---

# 29. CONSENT & FORMS

Review:

- contact forms
- newsletter forms
- account registration
- checkout
- cookies
- marketing communications

Ensure consent is collected appropriately where required.

Do not add unnecessary marketing subscriptions.

---

# 30. CONTACT SYSTEM

The contact form must be genuinely functional.

Implement:

```text
Customer
↓
Contact Form
↓
Server Validation
↓
Database / approved storage
↓
Notification
↓
Admin
```

Handle:

- validation
- spam protection
- rate limiting
- duplicate submissions
- success state
- failure state

Never expose internal email infrastructure to the browser.

---

# 31. EMAIL SYSTEM

Where email infrastructure is configured, create proper transactional communication for:

- contact acknowledgement where appropriate
- order confirmation
- payment confirmation
- order status updates
- password/account events where applicable

Do not claim email delivery is operational until the provider/domain configuration is actually tested.

---

# 32. PRODUCTION ENVIRONMENT

Prepare the application for:

```text
Development
↓
Staging / Testing
↓
Production
```

Ensure development credentials are never used in production.

Separate:

- database
- payment keys
- Cloudinary configuration
- email credentials
- authentication secrets
- application secrets

where appropriate.

---

# 33. ENVIRONMENT VARIABLES

Create a clear environment-variable architecture.

Document:

- required variables
- optional variables
- production variables
- development variables

Never commit secret values.

Provide a safe example such as:

```text
DATABASE_URL=
PAYMENT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
EMAIL_API_KEY=
AUTH_SECRET=
```

Use placeholders only.

Never put real credentials into documentation.

---

# 34. DEPLOYMENT READINESS

Audit the application for deployment.

Check:

- production build
- environment variables
- database migrations
- database connection
- API routes
- Cloudinary
- payment provider
- email provider
- domain configuration
- HTTPS
- redirects
- caching
- error handling
- logging
- security headers

The site should be deployable without manual code hacks.

---

# 35. DOMAIN & HTTPS

Prepare the website for the actual MAAIRA domain.

Ensure:

- HTTPS
- secure cookies
- correct canonical URL
- correct redirects
- www/non-www strategy
- sitemap
- robots.txt
- metadata
- Open Graph
- favicon
- social preview

Do not claim domain configuration is complete until DNS/deployment is actually verified.

---

# 36. SEO

Create proper production SEO architecture.

For important pages:

- title
- meta description
- canonical
- Open Graph
- structured data where appropriate
- meaningful URLs
- sitemap
- robots

Product structured data must only use actual product information.

Do not generate fake:

- ratings
- reviews
- prices
- availability
- brand claims

---

# 37. PERFORMANCE

Production luxury does not mean heavy.

Audit:

- JavaScript bundle size
- images
- fonts
- animations
- 3D
- API requests
- database queries
- unnecessary rerenders
- third-party scripts

Prioritize:

```text
FAST FIRST LOAD
↓
FAST PRODUCT DISCOVERY
↓
FAST IMAGE LOADING
↓
FAST CHECKOUT
```

Use lazy loading where appropriate.

Do not sacrifice essential product imagery merely to achieve an arbitrary performance score.

---

# 38. ACCESSIBILITY

Perform a full accessibility pass.

Check:

- keyboard navigation
- focus states
- contrast
- labels
- semantic HTML
- alt text
- screen reader support
- touch targets
- form errors
- reduced motion
- mobile usability

The website should be usable by people with different levels of digital literacy.

---

# 39. MOBILE PRODUCTION TESTING

Test actual critical flows at mobile sizes.

At minimum:

- homepage
- Shop
- category
- product
- gallery
- cart
- checkout
- contact
- account where applicable

No horizontal overflow.

No broken buttons.

No tiny touch targets.

No inaccessible menus.

No layout collapse.

---

# 40. REMOVE "AI WEBSITE" SIGNALS

Perform a dedicated audit for things that make websites feel AI-generated.

Remove or improve:

- generic copy
- repetitive sections
- meaningless gradients
- excessive glassmorphism
- random animations
- unnecessary floating elements
- generic stock imagery
- inconsistent spacing
- fake statistics
- fake reviews
- meaningless badges
- excessive rounded cards
- unnecessary glowing effects
- generic AI-generated marketing language
- buttons that do nothing
- placeholder text left in production
- lorem ipsum
- dead links

The result should feel intentionally designed by a professional brand/product team.

---

# 41. REAL-WORLD FAILURE HANDLING

A production website must assume things will fail.

Test:

- database unavailable
- Cloudinary image unavailable
- payment failure
- payment timeout
- webhook delayed
- network interruption
- invalid product
- deleted product
- out-of-stock product
- duplicate request
- expired session
- unauthorized request
- malformed request
- email failure

The application should fail gracefully.

---

# 42. SECURITY TESTING

Perform a defensive security review of the implemented application.

Test for:

- unauthorized API access
- IDOR
- privilege escalation
- authentication bypass
- input injection
- XSS
- CSRF
- price manipulation
- quantity manipulation
- order manipulation
- inventory manipulation
- webhook replay
- rate-limit weaknesses
- secret exposure
- insecure file upload
- sensitive data leakage
- admin endpoint exposure

Do not perform destructive attacks against external systems.

Test only the application and infrastructure that you are authorized to test.

Fix identified vulnerabilities rather than merely documenting them.

---

# 43. DEPENDENCY SECURITY

Audit installed dependencies.

Identify:

- outdated packages
- known vulnerabilities
- unnecessary dependencies
- development packages accidentally included in production

Update dependencies where safe.

Do not blindly upgrade everything and break the application.

After upgrades:

- rebuild
- test
- run security checks
- verify functionality

---

# 44. BACKUP & RECOVERY

Evaluate a real backup strategy for:

- production database
- important business data
- configuration
- order records

Document recovery expectations.

Do not claim backup/recovery is operational unless actually configured.

---

# 45. NO FAKE FUNCTIONALITY

This rule is absolute.

Never implement:

```text
Fake payment
Fake order success
Fake stock
Fake admin actions
Fake email sending
Fake database persistence
Fake authentication
Fake tracking
Fake reviews
Fake analytics
```

If infrastructure is unavailable:

Build the correct integration point and clearly report:

```text
BLOCKED — PRODUCTION CREDENTIAL / PROVIDER CONFIGURATION REQUIRED
```

A transparent incomplete feature is better than fake functionality.

---

# 46. IMAGE EDITING + BRAND QUALITY LOOP

After the catalogue is connected, visually inspect every product image.

For each product ask:

1. Is the bag clearly visible?
2. Is the background distracting?
3. Is the product well separated from the background?
4. Does the image look premium?
5. Does it match the visual quality of the rest of the catalogue?
6. Does it preserve the actual product?
7. Does it look appropriate on the Shop grid?
8. Does it look appropriate on Product Detail?

If a background is weak:

**improve the presentation using the available image-editing workflow/assets.**

Do not wait for the user to point out every visual problem.

Use your own design judgement.

But preserve product authenticity.

---

# 47. FINAL QUALITY BAR

Before saying the website is ready, ask:

> Would I trust this website with a real customer placing a real order?

If the answer is no:

**do not call it production-ready.**

Fix the underlying issue.

---

# 48. FINAL PRODUCTION CHECKLIST

Before launch, verify:

## E-COMMERCE

- [ ] Product catalogue
- [ ] Product pages
- [ ] Categories
- [ ] Search
- [ ] Filters
- [ ] Cart
- [ ] Checkout
- [ ] Payment integration
- [ ] Order persistence
- [ ] Inventory
- [ ] Customer account where enabled
- [ ] Wishlist where enabled

## BACKEND

- [ ] Database
- [ ] API validation
- [ ] Authorization
- [ ] Admin
- [ ] Orders
- [ ] Contact system
- [ ] Email integration
- [ ] Error handling
- [ ] Logging

## SECURITY

- [ ] Secrets protected
- [ ] Authentication hardened
- [ ] Authorization tested
- [ ] Rate limiting
- [ ] Input validation
- [ ] Security headers
- [ ] CSRF protection where applicable
- [ ] XSS protection
- [ ] IDOR checks
- [ ] Payment integrity
- [ ] Webhook verification
- [ ] File upload security
- [ ] Dependency audit
- [ ] Sensitive data review

## LEGAL / TRUST

- [ ] Privacy Policy
- [ ] Terms
- [ ] Shipping Policy
- [ ] Returns/Refund Policy
- [ ] Cancellation Policy
- [ ] Cookie information where applicable
- [ ] Contact information
- [ ] Client approval of business-specific policies

## PRODUCTION

- [ ] Production build
- [ ] Environment variables
- [ ] HTTPS
- [ ] Domain
- [ ] Database production configuration
- [ ] Cloudinary
- [ ] Payment provider
- [ ] Email provider
- [ ] Error monitoring/logging
- [ ] Backup strategy
- [ ] SEO
- [ ] Sitemap
- [ ] Robots.txt
- [ ] Mobile QA
- [ ] Accessibility QA
- [ ] Performance QA

---

# 49. FINAL EXECUTION INSTRUCTION

Do not merely give recommendations.

**AUDIT → IMPLEMENT → TEST → HARDEN → RE-AUDIT.**

Use the existing MAAIRA Master Prompt as the governing source of truth.

Preserve everything already correct.

Do not rebuild working components without reason.

Prioritize:

1. Real e-commerce functionality
2. Backend correctness
3. Security
4. Data integrity
5. Customer trust
6. Production reliability
7. Performance
8. Accessibility
9. Legal/trust readiness
10. Visual refinement

The visual layer should remain premium, but production correctness comes first.

At the end provide a concise production-readiness report containing:

### COMPLETED
What is genuinely implemented and tested.

### SECURITY
What was hardened and what security checks were performed.

### BACKEND
What is genuinely connected to persistent infrastructure.

### E-COMMERCE
Which shopping flows are genuinely functional.

### CLOUDINARY
Which assets are connected and what image improvements were made.

### LEGAL
Which legal pages are implemented and which require client/legal approval.

### BLOCKERS
Anything still requiring credentials, provider setup, client decisions, legal approval, DNS, payment approval or other external configuration.

### LAUNCH CHECKLIST
Exactly what remains before the domain can safely be pointed to the production deployment.

Do NOT say:

> "Production ready"

unless the relevant production infrastructure has actually been configured and tested.

The goal is not to make the website LOOK production-ready.

The goal is to make the website **BE production-ready.**

---

# 4. FINAL PROMPT ENGINEERING & EXECUTION PROTOCOL

## ROLE

Act as a **senior prompt engineer, product architect, e-commerce strategist, security-minded full-stack engineer and technical specification writer**.

Your job is to transform the supplied MAAIRA requirements and execution instructions into a **clean, high-performance Markdown specification system for Claude Code**.

These Markdown files will be used as direct working instructions for the development of the MAAIRA website.

This is NOT a summarization task.

This is NOT a rewriting-for-shortness task.

This is NOT an opportunity to remove details because they appear repetitive.

Your responsibility is to make the instructions **clearer, more executable, more structured and less ambiguous while preserving the full intent and requirements.**

---

# 1. SOURCE OF TRUTH

The existing:

**MAAIRA_MASTER_PROMPT.md**

is the highest-level source of truth.

The two additional execution specifications are:

1. **E-COMMERCE-FIRST TRANSFORMATION**
2. **PRODUCTION-GRADE FULL-STACK, SECURITY & LAUNCH READINESS**

These three documents must work together.

Hierarchy:

```text
MAAIRA_MASTER_PROMPT.md
        ↓
E-COMMERCE-FIRST TRANSFORMATION
        ↓
PRODUCTION-GRADE FULL-STACK + SECURITY + LAUNCH
```

The Master Prompt establishes the complete project requirements.

The E-Commerce prompt establishes the customer-facing commerce transformation.

The Production prompt establishes full-stack implementation, security, hardening and launch readiness.

---

# 2. DO NOT LOSE INFORMATION

When converting the supplied prompts into `.md` files:

### DO NOT:

- remove important requirements
- shorten detailed technical requirements merely to reduce token count
- replace detailed instructions with vague statements
- remove security requirements
- remove e-commerce requirements
- remove mobile/device requirements
- remove Cloudinary requirements
- remove backend requirements
- remove legal/production requirements
- remove testing requirements
- remove QA requirements
- remove truthfulness constraints
- remove scalability requirements
- remove failure handling
- remove implementation instructions

If two requirements overlap, consolidate them intelligently **without losing the stronger requirement**.

If something is already covered by the Master Prompt, do not unnecessarily duplicate huge sections, but preserve a clear reference to the governing requirement.

---

# 3. OPTIMIZE FOR CLAUDE CODE EXECUTION

The final Markdown files must be written so that Claude Code can understand:

- what it must do
- what it must not do
- what is mandatory
- what is optional
- what requires client confirmation
- what can be decided independently
- what must be tested
- what constitutes completion
- what constitutes a blocker

Use clear hierarchy.

Use:

- MUST
- MUST NOT
- SHOULD
- MAY
- CLIENT CONFIRMATION
- BLOCKED
- COMPLETE
- PARTIAL
- NOT APPLICABLE

where useful.

Avoid vague language such as:

> "Make it better."

Instead use explicit, testable instructions.

---

# 4. CLAUDE SHOULD USE ITS FULL CAPABILITY

This project should NOT be optimized around minimizing Claude's token/credit usage.

### IMPORTANT:

> **Use as much reasoning, context, tool usage and implementation effort as the task genuinely requires.**

Do NOT unnecessarily conserve credits if doing so would reduce:

- code quality
- security
- testing
- UX quality
- architecture quality
- visual quality
- backend correctness
- image quality
- production readiness

However:

> **Do not waste credits on meaningless repetition, unnecessary rewrites, decorative experimentation, or rebuilding working systems without reason.**

The philosophy is:

### MAXIMUM QUALITY
with
### MINIMUM WASTED EFFORT.

If a complex feature genuinely requires significant analysis, implementation, testing or iteration:

**USE THE REQUIRED RESOURCES.**

Do not artificially simplify the task just to save tokens.

---

# 5. "GOD MODE" EXECUTION PHILOSOPHY

Interpret the project as a serious professional client project.

Claude should behave as if:

> **The website is going live for a real luxury handbag business and real customers may interact with it.**

Therefore it should proactively:

- inspect the existing implementation
- identify weaknesses
- investigate dependencies
- inspect assets
- detect broken functionality
- identify security risks
- improve architecture
- test critical flows
- fix discovered issues
- validate responsive behaviour
- validate commerce logic
- improve image presentation
- verify backend integration
- verify production configuration

Do not wait for the user to identify obvious problems.

If something is clearly wrong and can be safely fixed within the existing requirements:

**FIX IT.**

---

# 6. BUT DO NOT OVERSTEP

Autonomous execution does NOT mean inventing business facts.

Claude must never invent:

- product information
- prices
- stock
- reviews
- testimonials
- certifications
- awards
- policies
- shipping promises
- return promises
- materials
- dimensions
- manufacturing claims
- customer statistics
- payment capabilities
- delivery estimates

If information is missing:

1. use only what can be verified
2. create a safe placeholder/integration point where appropriate
3. flag the requirement
4. continue with everything that can legitimately be completed

Do not fabricate information merely to make the website appear finished.

---

# 7. REAL WEBSITE STANDARD

The final website must NOT feel like:

- an AI-generated website
- a VibeCode demo
- a portfolio
- a static catalogue
- a frontend prototype
- a collection of fancy animations
- a fake e-commerce store

It should feel like:

> **A professionally engineered luxury fashion e-commerce website belonging to a real business.**

The final system should have:

- genuine frontend
- genuine backend
- persistent data
- real business logic
- real commerce architecture
- proper security
- proper administration
- proper customer experience
- proper legal/trust structure
- proper responsive behaviour
- proper error handling
- proper production architecture

---

# 8. E-COMMERCE IS THE PRIMARY PRODUCT

The website's central purpose is:

```text
DISCOVER
↓
BROWSE
↓
FILTER
↓
EVALUATE
↓
ADD TO CART
↓
CHECKOUT
↓
PAY
↓
ORDER
↓
FULFILMENT
```

Visual design, animation, 3D and sound are secondary to this.

If a design decision conflicts with commerce usability:

> **Commerce usability wins.**

---

# 9. LUXURY UX PRINCIPLE

The website should combine:

### LUXURY

with

### EXTREME SIMPLICITY.

Take inspiration from the information architecture and usability principles of established luxury e-commerce brands such as Louis Vuitton.

Do NOT copy:

- branding
- layouts
- proprietary visual identity
- typography
- copy
- assets

Instead learn from:

- clear hierarchy
- simple navigation
- strong product imagery
- elegant product grids
- intuitive categories
- clear filters
- minimal interface
- effortless shopping

Target experience:

> **"Anyone can use it."**

while still feeling:

> **"This is a luxury brand."**

---

# 10. PRODUCT INTELLIGENCE

The available MAAIRA product imagery should be treated as real product assets.

Claude must intelligently determine:

- unique products
- duplicate views
- galleries
- primary images
- categories
- styles
- occasions
- relevant tags

Do NOT assume every image is a separate product.

Do NOT invent products.

If only three authentic products are available:

> Build an excellent three-product commerce experience.

The architecture must nevertheless scale to dozens/hundreds of products.

---

# 11. CLOUDINARY

Cloudinary assets will be a major image source.

The system must support:

- remote Cloudinary URLs
- responsive delivery
- transformations
- optimized formats
- high-resolution product detail imagery
- thumbnails
- lazy loading
- CDN delivery
- appropriate cropping/focal positioning

Claude may use design judgement to improve the presentation of supplied imagery.

For example:

- improve a distracting background
- create a refined studio presentation
- improve visual separation
- add tasteful shadows
- improve composition
- create consistent catalogue presentation

BUT:

### NEVER CHANGE THE ACTUAL PRODUCT DECEPTIVELY.

Never alter:

- product shape
- hardware
- logo
- genuine colour
- genuine features
- material identity
- product construction

The product must remain authentic.

---

# 12. DEVICE REQUIREMENT

The website must be fully responsive and production-quality across:

- 360px phones
- 375px phones
- 390px phones
- 414px phones
- larger phones
- tablets
- 768px
- 1024px
- laptops
- 1280px
- 1440px+
- large desktop displays

Mobile is NOT a secondary adaptation.

Mobile is a first-class commerce experience.

Critical flows must work on mobile:

- navigation
- search
- category browsing
- filtering
- product gallery
- product detail
- add to cart
- cart
- checkout
- forms
- account

No horizontal overflow.

No broken touch interactions.

No hover-dependent functionality.

---

# 13. FULL-STACK REQUIREMENT

The implementation must contain real:

### FRONTEND

and

### BACKEND

and

### DATABASE

and

### AUTHORIZATION

and

### ADMINISTRATION

where required.

Do not leave important functionality simulated.

All business-critical values must be server-authoritative.

---

# 14. SECURITY-FIRST REQUIREMENT

Security is a first-class requirement.

Perform a serious security-hardening pass against common web application vulnerabilities including:

- SQL/NoSQL injection
- XSS
- CSRF
- SSRF
- command injection
- path traversal
- IDOR
- broken access control
- authentication bypass
- privilege escalation
- session vulnerabilities
- brute-force attacks
- rate-limit abuse
- malicious uploads
- parameter tampering
- price manipulation
- inventory manipulation
- order manipulation
- payment manipulation
- webhook replay
- secret exposure
- sensitive data leakage

Use established secure engineering practices.

Never claim the website is "unhackable."

Instead:

> Minimize attack surface, implement layered security, test defensively and fix discovered vulnerabilities.

---

# 15. PRODUCTION SECURITY

Protect:

- environment variables
- database credentials
- payment credentials
- Cloudinary secrets
- authentication secrets
- email credentials
- admin credentials

Never expose secrets in:

- frontend code
- Git
- public API responses
- logs
- error messages

Review the repository for accidental secret exposure.

---

# 16. PRODUCTION COMMERCE

Ensure:

- server-authoritative pricing
- inventory validation
- persistent orders
- payment verification
- webhook verification
- idempotency
- replay protection
- secure checkout
- proper order states
- correct failure handling
- customer data protection

Never simulate payment success.

Never trust browser-side payment status.

---

# 17. LEGAL / TRUST READINESS

Prepare the website structure for appropriate:

- Privacy Policy
- Terms & Conditions
- Shipping Policy
- Return/Refund Policy
- Cancellation Policy
- Cookie information where applicable
- Contact/Support information

Do NOT fabricate legal claims.

Business-specific legal information must be clearly marked for client confirmation where necessary.

The website should be structurally ready for these pages before launch.

---

# 18. PRODUCTION ENGINEERING

Audit and prepare:

- database migrations
- environment configuration
- deployment
- HTTPS
- domain
- caching
- image CDN
- error handling
- logging
- monitoring
- backups
- SEO
- sitemap
- robots.txt
- metadata
- Open Graph
- accessibility
- performance

The goal is:

> **The only remaining launch blockers should be genuine external requirements such as credentials, DNS, payment-provider approval, business/legal confirmation or other client-controlled configuration.**

---

# 19. TESTING

Do not declare completion merely because the build succeeds.

Test:

### FUNCTIONAL

- navigation
- search
- filters
- categories
- products
- gallery
- cart
- checkout
- authentication
- account
- wishlist
- admin
- contact

### SECURITY

- unauthorized access
- authorization
- IDOR
- input validation
- rate limiting
- secret exposure
- price manipulation
- order manipulation
- payment integrity

### RESPONSIVE

- phone
- tablet
- laptop
- desktop
- large desktop

### FAILURE

- API failure
- database failure
- image failure
- payment failure
- invalid input
- out-of-stock
- expired session
- network interruption

Fix problems discovered during testing.

---

# 20. NO UNNECESSARY REBUILD

Inspect first.

Preserve what works.

Improve what is weak.

Rebuild only what genuinely requires rebuilding.

Do not consume resources rewriting stable components merely for stylistic reasons.

---

# 21. RESOURCE / CREDIT POLICY

Use this exact philosophy:

> **Credits are a resource, not a constraint. Quality is the priority.**

Use significant context, reasoning, tools and iterations whenever genuinely necessary.

### Spend heavily when it materially improves:

- security
- architecture
- backend
- database
- commerce
- UX
- responsive behaviour
- image quality
- testing
- debugging
- production readiness

### Save resources when the work is:

- repetitive
- cosmetic without meaningful benefit
- unnecessary rewriting
- duplicate analysis
- decorative experimentation
- redundant code generation

Do not tell Claude to "use fewer tokens."

Tell it to:

> **Use whatever resources are necessary for exceptional quality, but eliminate waste.**

---

# 22. DECISION-MAKING

When Claude encounters an implementation decision:

### If clearly defined:
Implement it.

### If technically ambiguous but low-risk:
Use professional judgement and proceed.

### If missing information affects security, legal compliance, payment, customer trust or irreversible business behaviour:
Ask for clarification OR implement a safe blocked integration point.

### Never:
Invent a business fact just to avoid asking.

---

# 23. COMPLETION STANDARD

The project is NOT complete because:

- homepage looks good
- animations work
- Vercel deployment succeeds
- product cards exist
- build passes

The project is complete only when the relevant systems have been:

```text
IMPLEMENTED
↓
INTEGRATED
↓
TESTED
↓
HARDENED
↓
VERIFIED
```

---

# 24. FINAL REPORT

At completion, Claude must provide a concise report containing:

## IMPLEMENTED
What was actually built.

## E-COMMERCE
What shopping functionality is genuinely operational.

## BACKEND
What backend/database functionality is genuinely operational.

## SECURITY
What was hardened and tested.

## CLOUDINARY
What assets were connected and what image presentation improvements were made.

## RESPONSIVE
Which device classes were tested.

## LEGAL
Which pages are implemented and what requires approval.

## PRODUCTION
What is genuinely ready.

## BLOCKERS
What still requires:

- credentials
- provider configuration
- DNS
- payment approval
- email configuration
- client decisions
- legal approval

## TEST EVIDENCE
What was actually tested.

Do not claim something is complete if it was only planned.

Do not claim "production-ready" if critical external configuration remains incomplete.

---

# 25. FINAL DIRECTIVE

Treat MAAIRA as a **real luxury e-commerce business**, not a coding exercise.

Think like:

- a senior product engineer
- a senior e-commerce architect
- a security engineer
- a UX designer
- a luxury brand digital director
- a QA engineer
- a DevOps engineer

Work proactively.

Inspect deeply.

Implement intelligently.

Test aggressively.

Use full capability where it creates real value.

Do not waste resources.

Do not fabricate information.

Do not leave fake functionality.

Do not optimize for looking finished.

Optimize for **actually being finished.**

### THE FINAL STANDARD:

> **If the client gave us the remaining legitimate production credentials, business confirmations and approvals tomorrow, the codebase should be as close as realistically possible to being ready to launch the real MAAIRA business.**

That is the bar.

---

# 5. REQUIREMENTS TRACEABILITY & PRODUCTION CHECKLIST

## Purpose
This document tracks whether the major MAAIRA requirements are actually implemented and validated.

## Status vocabulary
- NOT STARTED
- IN PROGRESS
- COMPLETE
- PARTIAL
- BLOCKED
- NOT APPLICABLE

## Baseline

| ID | Requirement | Validation evidence | Status |
|---|---|---|---|
| R01 | Real luxury e-commerce, not a demo | Genuine storefront and commerce journey | NOT STARTED |
| R02 | Correct brand/business identity | Brand/business data verified in implementation | NOT STARTED |
| R03 | No fabricated commercial claims/data | Product and business audit | NOT STARTED |
| R04 | Drive/assets/access assessment | Access report and asset inventory | NOT STARTED |
| R05 | Product catalogue intelligence | Structured product records and image grouping | NOT STARTED |
| R06 | Cloudinary production media | Optimized responsive delivery and verified assets | NOT STARTED |
| R07 | Product discovery | Search, filters, sorting, categories and occasions | NOT STARTED |
| R08 | Product detail experience | PDP answers purchase questions | NOT STARTED |
| R09 | Cart and checkout | Server-authoritative cart/checkout | NOT STARTED |
| R10 | Payments | Server verification, webhook and idempotency | NOT STARTED |
| R11 | Orders/inventory | Persistent database and transactional integrity | NOT STARTED |
| R12 | Authentication/admin | Secure auth and server-side authorization | NOT STARTED |
| R13 | Security hardening | OWASP-minded audit and tests | NOT STARTED |
| R14 | Accessibility | WCAG-oriented automated + manual QA | NOT STARTED |
| R15 | Mobile/device reliability | 360px through ultrawide validation | NOT STARTED |
| R16 | Performance/SEO | Core Web Vitals, metadata, sitemap, robots | NOT STARTED |
| R17 | Legal/trust readiness | Required pages and approval status | NOT STARTED |
| R18 | Testing/QA | Functional, integration, E2E, security and visual QA | NOT STARTED |
| R19 | Deployment readiness | Environment, HTTPS, domain, backups, monitoring | NOT STARTED |
| R20 | Final production report | Completed/security/backend/e-commerce/Cloudinary/legal/blockers/launch checklist | NOT STARTED |

## Rule
A requirement is COMPLETE only when implementation evidence exists. Mentioning a feature in documentation does not count as completion.

---

# 6. UNIFIED FINAL EXECUTION DIRECTIVE

Claude Code must treat this entire document as one integrated specification.

## Execution priority

1. Truthfulness, legal compliance, security, privacy and customer/business data protection.
2. Genuine e-commerce functionality, business operations and data integrity.
3. Customer UX, usability, accessibility and mobile reliability.
4. Authentic MAAIRA brand identity and real product imagery.
5. Performance, stability, maintainability and operational sustainability.
6. Creative distinction, immersive storytelling and advanced effects.
7. Credit/context efficiency only where it does not reduce quality.

## Non-negotiable behaviour

- Inspect the existing project before changing it.
- Preserve what already works.
- Do not rebuild working systems without a documented reason.
- Do not treat mockups, simulations or placeholders as completed production functionality.
- Do not invent missing commercial data.
- Do not expose or hardcode secrets.
- Do not launch live payment flows without actual provider configuration and testing.
- Do not claim production readiness until the relevant production infrastructure has actually been configured and tested.
- Use full available reasoning, tooling and implementation effort when genuinely useful.
- Avoid meaningless repetition, unnecessary rewrites and decorative experimentation.
- Maintain and update the requirements traceability throughout development.

## Final quality gate

Before declaring completion, verify:

**E-COMMERCE**
- Catalogue
- Product pages
- Categories
- Search
- Filters
- Sorting
- Cart
- Checkout
- Payment
- Orders
- Inventory
- Customer account where enabled
- Wishlist where enabled

**BACKEND**
- Database
- APIs
- Validation
- Authorization
- Admin
- Orders
- Contact system
- Email integration where configured
- Error handling
- Logging

**SECURITY**
- Secrets protected
- Authentication hardened
- Authorization tested
- Rate limiting
- Input validation
- Security headers
- CSRF where applicable
- XSS protection
- IDOR/access-control checks
- Payment integrity
- Webhook verification
- Upload security
- Dependency audit
- Sensitive-data review

**LEGAL / TRUST**
- Privacy Policy
- Terms
- Shipping
- Returns/Refunds
- Cancellation
- Cookie information where applicable
- Contact/support
- Client approval of business-specific policies

**PRODUCTION**
- Production build
- Environment variables
- HTTPS
- Domain
- Production database
- Cloudinary
- Payment provider
- Email provider
- Monitoring/logging
- Backup strategy
- SEO
- Sitemap
- Robots.txt
- Mobile QA
- Accessibility QA
- Performance QA

## Final report

At the end, report only what is genuinely supported by implementation/testing evidence:

### COMPLETED
What is genuinely implemented and tested.

### SECURITY
What was hardened and what checks were performed.

### BACKEND
What is genuinely connected to persistent infrastructure.

### E-COMMERCE
Which shopping flows are genuinely functional.

### CLOUDINARY
Which assets are connected and what improvements were made.

### LEGAL
Which pages are implemented and which require client/legal approval.

### BLOCKERS
Credentials, provider setup, client decisions, legal approval, DNS, payment approval, infrastructure or other external dependencies.

### LAUNCH CHECKLIST
Exactly what remains before production launch.

> **Final rule:** The goal is not to make MAAIRA LOOK production-ready. The goal is to make MAAIRA BE production-ready.
