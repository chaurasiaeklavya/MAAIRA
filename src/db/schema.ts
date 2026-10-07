/**
 * Database schema (PostgreSQL, Drizzle ORM).
 *
 * One source of truth for the catalogue, carts, orders, payments, inventory,
 * enquiries, staff/customer accounts and the audit trail. Money is stored as
 * integer paise; every business-critical value is constrained in the
 * database as well as validated in code.
 *
 * Evidence rule (master brief §2.3): product attributes stay NULL until they
 * are verified. Taxonomy assignments record their evidence basis
 * ('fact' | 'inference' | 'client') so an inference is never shown as fact.
 */
import { sql } from 'drizzle-orm';
import {
  bigint,
  bigserial,
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

const createdAt = () => timestamp('created_at', { withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

// ─────────────────────────────────────────────────────────────── Auth (Better Auth)

export const user = pgTable(
  'user',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').notNull().default(false),
    image: text('image'),
    /** 'customer' | 'staff' | 'admin'. Never settable from sign-up input. */
    role: text('role').notNull().default('customer'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [check('user_role_check', sql`${t.role} in ('customer', 'staff', 'admin')`)],
);

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    token: text('token').notNull().unique(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (t) => [index('session_user_idx').on(t.userId)],
);

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
    scope: text('scope'),
    /** Password hash (scrypt, managed by Better Auth). Never logged or returned. */
    password: text('password'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index('account_user_idx').on(t.userId)],
);

export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index('verification_identifier_idx').on(t.identifier)],
);

/** Better Auth's own limiter for sign-in, sign-up and password reset. */
export const rateLimit = pgTable('rate_limit', {
  id: text('id').primaryKey(),
  key: text('key').notNull().unique(),
  count: integer('count').notNull(),
  lastRequest: bigint('last_request', { mode: 'number' }).notNull(),
});

// ─────────────────────────────────────────────────────────────── Media

/**
 * Every supplied image, whether or not it is assigned to a product, so no
 * asset is silently ignored. Originals are never modified; delivery
 * transformations are applied at request time.
 */
export const mediaAssets = pgTable(
  'media_assets',
  {
    /** Stable internal ID, e.g. MFB-IMG-8786 (from the camera filename). */
    id: text('id').primaryKey(),
    provider: text('provider').notNull().default('cloudinary'),
    cloudName: text('cloud_name').notNull(),
    publicId: text('public_id').notNull(),
    version: text('version'),
    format: text('format').notNull(),
    /** Exact delivery URL as supplied. */
    deliveryUrl: text('delivery_url').notNull().unique(),
    /** Earlier delivery URLs for the same camera file (other clouds/batches). */
    alternateUrls: text('alternate_urls').array().notNull().default(sql`'{}'::text[]`),
    originalFilename: text('original_filename').notNull(),
    width: integer('width'),
    height: integer('height'),
    intakeBatch: text('intake_batch').notNull(),
    /** pending → assigned | held | rejected, after visual review. */
    reviewStatus: text('review_status').notNull().default('pending'),
    reviewNotes: text('review_notes'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    check('media_review_status_check', sql`${t.reviewStatus} in ('pending', 'assigned', 'held', 'rejected')`),
    check('media_dimensions_check', sql`(${t.width} is null or ${t.width} > 0) and (${t.height} is null or ${t.height} > 0)`),
  ],
);

// ─────────────────────────────────────────────────────────────── Catalogue

export const products = pgTable(
  'products',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    /** Internal catalogue reference (not a client SKU). */
    reference: text('reference').notNull().unique(),
    /** Client-supplied SKU only. */
    sku: text('sku').unique(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    nameStatus: text('name_status').notNull().default('working'),
    summary: text('summary'),
    description: text('description'),
    copyStatus: text('copy_status').notNull().default('draft'),
    /** Authoritative price in paise. NULL until the client approves a price. */
    pricePaise: integer('price_paise'),
    currency: text('currency').notNull().default('INR'),
    priceStatus: text('price_status').notNull().default('pending'),
    status: text('status').notNull().default('draft'),
    /** 'unconfirmed' until the business confirms how the piece is sold. */
    availability: text('availability').notNull().default('unconfirmed'),
    trackInventory: boolean('track_inventory').notNull().default(false),
    stock: integer('stock'),
    /** Verified attributes only (NULL = unknown, never shown). */
    colour: text('colour'),
    material: text('material'),
    dimensions: text('dimensions'),
    features: text('features').array().notNull().default(sql`'{}'::text[]`),
    /** Free search keywords from verified/visible facts. */
    tags: text('tags').array().notNull().default(sql`'{}'::text[]`),
    /** Merchandising order for "Featured"; NULL = not featured. */
    featuredRank: integer('featured_rank'),
    /** Set only when the piece is merchandised as a new arrival. */
    arrivedAt: timestamp('arrived_at', { withTimezone: true }),
    /** Art-directed backdrop around the untouched photograph. */
    stage: text('stage').notNull().default('ivory-plaster'),
    /** Staff-only notes: provisional grouping, open questions. */
    internalNotes: text('internal_notes'),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    check('product_name_status_check', sql`${t.nameStatus} in ('working', 'approved')`),
    check('product_copy_status_check', sql`${t.copyStatus} in ('draft', 'approved')`),
    check('product_price_status_check', sql`${t.priceStatus} in ('pending', 'approved')`),
    check('product_price_check', sql`${t.pricePaise} is null or ${t.pricePaise} > 0`),
    check('product_price_approved_check', sql`${t.priceStatus} = 'pending' or ${t.pricePaise} is not null`),
    check('product_currency_check', sql`${t.currency} = 'INR'`),
    check('product_status_check', sql`${t.status} in ('draft', 'published', 'archived')`),
    check(
      'product_availability_check',
      sql`${t.availability} in ('unconfirmed', 'in_stock', 'made_to_order', 'out_of_stock')`,
    ),
    check('product_stock_check', sql`${t.stock} is null or ${t.stock} >= 0`),
    check('product_inventory_check', sql`not ${t.trackInventory} or ${t.stock} is not null`),
    check('product_slug_check', sql`${t.slug} ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`),
    check('product_stage_check', sql`${t.stage} in ('champagne-studio', 'ivory-plaster', 'espresso-leather')`),
    index('product_status_idx').on(t.status),
  ],
);

export const productImages = pgTable(
  'product_images',
  {
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    assetId: text('asset_id')
      .notNull()
      .references(() => mediaAssets.id, { onDelete: 'restrict' }),
    position: integer('position').notNull(),
    role: text('role').notNull().default('gallery'),
    alt: text('alt').notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.productId, t.assetId] }),
    uniqueIndex('product_image_position_uq').on(t.productId, t.position),
    // A photograph shows one physical bag, so it can belong to one product only.
    uniqueIndex('product_image_asset_uq').on(t.assetId),
    check('product_image_role_check', sql`${t.role} in ('primary', 'gallery', 'detail', 'lifestyle')`),
    check('product_image_position_check', sql`${t.position} >= 0`),
  ],
);

/** Controlled vocabulary: bag styles, occasions/uses and curated collections. */
export const taxonomyTerms = pgTable(
  'taxonomy_terms',
  {
    id: text('id').primaryKey(),
    kind: text('kind').notNull(),
    slug: text('slug').notNull(),
    label: text('label').notNull(),
    description: text('description'),
    synonyms: text('synonyms').array().notNull().default(sql`'{}'::text[]`),
    position: integer('position').notNull().default(0),
  },
  (t) => [
    uniqueIndex('taxonomy_kind_slug_uq').on(t.kind, t.slug),
    check('taxonomy_kind_check', sql`${t.kind} in ('style', 'occasion', 'collection')`),
  ],
);

export const productTerms = pgTable(
  'product_terms',
  {
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    termId: text('term_id')
      .notNull()
      .references(() => taxonomyTerms.id, { onDelete: 'cascade' }),
    /** fact = directly visible/supplied · inference = strongly supported · client = confirmed by the business */
    basis: text('basis').notNull(),
    evidence: text('evidence'),
  },
  (t) => [
    primaryKey({ columns: [t.productId, t.termId] }),
    index('product_terms_term_idx').on(t.termId),
    check('product_terms_basis_check', sql`${t.basis} in ('fact', 'inference', 'client')`),
  ],
);

// ─────────────────────────────────────────────────────────────── Customers

export const addresses = pgTable(
  'addresses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    fullName: text('full_name').notNull(),
    phone: text('phone').notNull(),
    line1: text('line1').notNull(),
    line2: text('line2'),
    city: text('city').notNull(),
    state: text('state').notNull(),
    postalCode: text('postal_code').notNull(),
    country: text('country').notNull().default('IN'),
    isDefault: boolean('is_default').notNull().default(false),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index('addresses_user_idx').on(t.userId), check('address_country_check', sql`${t.country} = 'IN'`)],
);

export const wishlistItems = pgTable(
  'wishlist_items',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.productId] })],
);

// ─────────────────────────────────────────────────────────────── Cart

export const carts = pgTable(
  'carts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    /** SHA-256 of the guest cart cookie; the raw token never touches the DB. */
    tokenHash: text('token_hash').notNull().unique(),
    userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex('carts_user_uq').on(t.userId).where(sql`${t.userId} is not null`)],
);

export const cartItems = pgTable(
  'cart_items',
  {
    cartId: uuid('cart_id')
      .notNull()
      .references(() => carts.id, { onDelete: 'cascade' }),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').notNull(),
    addedAt: createdAt(),
  },
  (t) => [
    primaryKey({ columns: [t.cartId, t.productId] }),
    check('cart_item_quantity_check', sql`${t.quantity} between 1 and 10`),
  ],
);

// ─────────────────────────────────────────────────────────────── Orders & payments

export const ORDER_STATUSES = [
  'pending_payment',
  'paid',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'payment_failed',
  'refunded',
] as const;

export const orders = pgTable(
  'orders',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    /** Human-readable order number, e.g. MA-261007-7K2QH. */
    number: text('number').notNull().unique(),
    userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
    email: text('email').notNull(),
    phone: text('phone').notNull(),
    fullName: text('full_name').notNull(),
    shippingAddress: jsonb('shipping_address').notNull(),
    status: text('status').notNull().default('pending_payment'),
    currency: text('currency').notNull().default('INR'),
    subtotalPaise: integer('subtotal_paise').notNull(),
    shippingPaise: integer('shipping_paise').notNull(),
    taxPaise: integer('tax_paise').notNull().default(0),
    totalPaise: integer('total_paise').notNull(),
    pricesIncludeTax: boolean('prices_include_tax').notNull(),
    paymentProvider: text('payment_provider'),
    providerOrderId: text('provider_order_id').unique(),
    /** De-duplicates double-submitted checkouts. */
    idempotencyKey: text('idempotency_key').notNull().unique(),
    /** SHA-256 of the order's private access token (guest order page). */
    accessTokenHash: text('access_token_hash').notNull(),
    /** Cart that produced the order; emptied once payment is confirmed. */
    sourceCartId: uuid('source_cart_id').references(() => carts.id, { onDelete: 'set null' }),
    /** Stock held for this order until payment or expiry. */
    stockReserved: boolean('stock_reserved').notNull().default(false),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    placedAt: timestamp('placed_at', { withTimezone: true }),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index('orders_user_idx').on(t.userId),
    index('orders_status_idx').on(t.status),
    check(
      'order_status_check',
      sql`${t.status} in ('pending_payment', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'payment_failed', 'refunded')`,
    ),
    check('order_currency_check', sql`${t.currency} = 'INR'`),
    check(
      'order_amounts_check',
      sql`${t.subtotalPaise} > 0 and ${t.shippingPaise} >= 0 and ${t.taxPaise} >= 0 and ${t.totalPaise} = ${t.subtotalPaise} + ${t.shippingPaise} + ${t.taxPaise}`,
    ),
  ],
);

export const orderItems = pgTable(
  'order_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    productId: uuid('product_id').references(() => products.id, { onDelete: 'set null' }),
    /** Snapshots: the order keeps what was bought even if the product changes. */
    reference: text('reference').notNull(),
    sku: text('sku'),
    name: text('name').notNull(),
    imageUrl: text('image_url'),
    unitPricePaise: integer('unit_price_paise').notNull(),
    quantity: integer('quantity').notNull(),
    lineTotalPaise: integer('line_total_paise').notNull(),
  },
  (t) => [
    index('order_items_order_idx').on(t.orderId),
    check('order_item_quantity_check', sql`${t.quantity} between 1 and 10`),
    check('order_item_total_check', sql`${t.unitPricePaise} > 0 and ${t.lineTotalPaise} = ${t.unitPricePaise} * ${t.quantity}`),
  ],
);

export const orderEvents = pgTable(
  'order_events',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    fromStatus: text('from_status'),
    toStatus: text('to_status').notNull(),
    actorType: text('actor_type').notNull(),
    actorId: text('actor_id'),
    note: text('note'),
    createdAt: createdAt(),
  },
  (t) => [
    index('order_events_order_idx').on(t.orderId),
    check('order_event_actor_check', sql`${t.actorType} in ('system', 'customer', 'staff', 'provider')`),
  ],
);

export const payments = pgTable(
  'payments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    provider: text('provider').notNull(),
    providerOrderId: text('provider_order_id').notNull(),
    providerPaymentId: text('provider_payment_id').unique(),
    status: text('status').notNull(),
    amountPaise: integer('amount_paise').notNull(),
    currency: text('currency').notNull(),
    errorCode: text('error_code'),
    errorDescription: text('error_description'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index('payments_order_idx').on(t.orderId),
    check('payment_status_check', sql`${t.status} in ('created', 'authorized', 'captured', 'failed', 'refunded')`),
  ],
);

/** Webhook de-duplication: one row per provider event id. */
export const paymentEvents = pgTable('payment_events', {
  id: text('id').primaryKey(),
  provider: text('provider').notNull(),
  eventType: text('event_type').notNull(),
  payloadSha256: text('payload_sha256').notNull(),
  result: text('result'),
  receivedAt: createdAt(),
});

export const inventoryMovements = pgTable(
  'inventory_movements',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    delta: integer('delta').notNull(),
    stockAfter: integer('stock_after').notNull(),
    reason: text('reason').notNull(),
    orderId: uuid('order_id').references(() => orders.id, { onDelete: 'set null' }),
    actorId: text('actor_id'),
    note: text('note'),
    createdAt: createdAt(),
  },
  (t) => [
    index('inventory_product_idx').on(t.productId),
    check('inventory_reason_check', sql`${t.reason} in ('reserve', 'release', 'adjustment')`),
    check('inventory_stock_after_check', sql`${t.stockAfter} >= 0`),
  ],
);

// ─────────────────────────────────────────────────────────────── Enquiries & callbacks

export const enquiries = pgTable(
  'enquiries',
  {
    id: text('id').primaryKey(),
    kind: text('kind').notNull(),
    name: text('name').notNull(),
    email: text('email'),
    phone: text('phone'),
    productId: uuid('product_id').references(() => products.id, { onDelete: 'set null' }),
    /** Snapshot of the product reference the visitor asked about. */
    productLabel: text('product_label'),
    message: text('message'),
    callbackWindow: text('callback_window'),
    note: text('note'),
    consentAt: timestamp('consent_at', { withTimezone: true }).notNull(),
    status: text('status').notNull().default('new'),
    idempotencyKey: text('idempotency_key').notNull().unique(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index('enquiries_created_idx').on(t.createdAt),
    check('enquiry_kind_check', sql`${t.kind} in ('enquiry', 'callback')`),
    check('enquiry_status_check', sql`${t.status} in ('new', 'contacted', 'closed')`),
    check('enquiry_contact_check', sql`${t.email} is not null or ${t.phone} is not null`),
  ],
);

// ─────────────────────────────────────────────────────────────── Operations

/** Business rules staff can change without a deploy (shipping, tax, checkout switch). */
export const storeSettings = pgTable('store_settings', {
  key: text('key').primaryKey(),
  value: jsonb('value').notNull(),
  updatedBy: text('updated_by'),
  updatedAt: updatedAt(),
});

/** Fixed-window counters shared by every server instance. */
export const rateLimitBuckets = pgTable('rate_limit_buckets', {
  key: text('key').primaryKey(),
  windowStart: timestamp('window_start', { withTimezone: true }).notNull(),
  count: integer('count').notNull(),
});

export const auditLog = pgTable(
  'audit_log',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    actorId: text('actor_id'),
    actorEmail: text('actor_email'),
    action: text('action').notNull(),
    targetType: text('target_type').notNull(),
    targetId: text('target_id'),
    detail: jsonb('detail'),
    result: text('result').notNull().default('ok'),
    createdAt: createdAt(),
  },
  (t) => [index('audit_created_idx').on(t.createdAt), index('audit_target_idx').on(t.targetType, t.targetId)],
);
