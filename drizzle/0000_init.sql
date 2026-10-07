CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"full_name" text NOT NULL,
	"phone" text NOT NULL,
	"line1" text NOT NULL,
	"line2" text,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"postal_code" text NOT NULL,
	"country" text DEFAULT 'IN' NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "address_country_check" CHECK ("addresses"."country" = 'IN')
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"actor_id" text,
	"actor_email" text,
	"action" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text,
	"detail" jsonb,
	"result" text DEFAULT 'ok' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"cart_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cart_items_cart_id_product_id_pk" PRIMARY KEY("cart_id","product_id"),
	CONSTRAINT "cart_item_quantity_check" CHECK ("cart_items"."quantity" between 1 and 10)
);
--> statement-breakpoint
CREATE TABLE "carts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token_hash" text NOT NULL,
	"user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "carts_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "enquiries" (
	"id" text PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"product_id" uuid,
	"product_label" text,
	"message" text,
	"callback_window" text,
	"note" text,
	"consent_at" timestamp with time zone NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"idempotency_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "enquiries_idempotency_key_unique" UNIQUE("idempotency_key"),
	CONSTRAINT "enquiry_kind_check" CHECK ("enquiries"."kind" in ('enquiry', 'callback')),
	CONSTRAINT "enquiry_status_check" CHECK ("enquiries"."status" in ('new', 'contacted', 'closed')),
	CONSTRAINT "enquiry_contact_check" CHECK ("enquiries"."email" is not null or "enquiries"."phone" is not null)
);
--> statement-breakpoint
CREATE TABLE "inventory_movements" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"product_id" uuid NOT NULL,
	"delta" integer NOT NULL,
	"stock_after" integer NOT NULL,
	"reason" text NOT NULL,
	"order_id" uuid,
	"actor_id" text,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_reason_check" CHECK ("inventory_movements"."reason" in ('reserve', 'release', 'adjustment')),
	CONSTRAINT "inventory_stock_after_check" CHECK ("inventory_movements"."stock_after" >= 0)
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" text PRIMARY KEY NOT NULL,
	"provider" text DEFAULT 'cloudinary' NOT NULL,
	"cloud_name" text NOT NULL,
	"public_id" text NOT NULL,
	"version" text,
	"format" text NOT NULL,
	"delivery_url" text NOT NULL,
	"alternate_urls" text[] DEFAULT '{}'::text[] NOT NULL,
	"original_filename" text NOT NULL,
	"width" integer,
	"height" integer,
	"intake_batch" text NOT NULL,
	"review_status" text DEFAULT 'pending' NOT NULL,
	"review_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_assets_delivery_url_unique" UNIQUE("delivery_url"),
	CONSTRAINT "media_review_status_check" CHECK ("media_assets"."review_status" in ('pending', 'assigned', 'held', 'rejected')),
	CONSTRAINT "media_dimensions_check" CHECK (("media_assets"."width" is null or "media_assets"."width" > 0) and ("media_assets"."height" is null or "media_assets"."height" > 0))
);
--> statement-breakpoint
CREATE TABLE "order_events" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"order_id" uuid NOT NULL,
	"from_status" text,
	"to_status" text NOT NULL,
	"actor_type" text NOT NULL,
	"actor_id" text,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "order_event_actor_check" CHECK ("order_events"."actor_type" in ('system', 'customer', 'staff', 'provider'))
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" uuid,
	"reference" text NOT NULL,
	"sku" text,
	"name" text NOT NULL,
	"image_url" text,
	"unit_price_paise" integer NOT NULL,
	"quantity" integer NOT NULL,
	"line_total_paise" integer NOT NULL,
	CONSTRAINT "order_item_quantity_check" CHECK ("order_items"."quantity" between 1 and 10),
	CONSTRAINT "order_item_total_check" CHECK ("order_items"."unit_price_paise" > 0 and "order_items"."line_total_paise" = "order_items"."unit_price_paise" * "order_items"."quantity")
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"number" text NOT NULL,
	"user_id" text,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"full_name" text NOT NULL,
	"shipping_address" jsonb NOT NULL,
	"status" text DEFAULT 'pending_payment' NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"subtotal_paise" integer NOT NULL,
	"shipping_paise" integer NOT NULL,
	"tax_paise" integer DEFAULT 0 NOT NULL,
	"total_paise" integer NOT NULL,
	"prices_include_tax" boolean NOT NULL,
	"payment_provider" text,
	"provider_order_id" text,
	"idempotency_key" text NOT NULL,
	"access_token_hash" text NOT NULL,
	"stock_reserved" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp with time zone,
	"placed_at" timestamp with time zone,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_number_unique" UNIQUE("number"),
	CONSTRAINT "orders_provider_order_id_unique" UNIQUE("provider_order_id"),
	CONSTRAINT "orders_idempotency_key_unique" UNIQUE("idempotency_key"),
	CONSTRAINT "order_status_check" CHECK ("orders"."status" in ('pending_payment', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'payment_failed', 'refunded')),
	CONSTRAINT "order_currency_check" CHECK ("orders"."currency" = 'INR'),
	CONSTRAINT "order_amounts_check" CHECK ("orders"."subtotal_paise" > 0 and "orders"."shipping_paise" >= 0 and "orders"."tax_paise" >= 0 and "orders"."total_paise" = "orders"."subtotal_paise" + "orders"."shipping_paise" + "orders"."tax_paise")
);
--> statement-breakpoint
CREATE TABLE "payment_events" (
	"id" text PRIMARY KEY NOT NULL,
	"provider" text NOT NULL,
	"event_type" text NOT NULL,
	"payload_sha256" text NOT NULL,
	"result" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"provider_order_id" text NOT NULL,
	"provider_payment_id" text,
	"status" text NOT NULL,
	"amount_paise" integer NOT NULL,
	"currency" text NOT NULL,
	"error_code" text,
	"error_description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_provider_payment_id_unique" UNIQUE("provider_payment_id"),
	CONSTRAINT "payment_status_check" CHECK ("payments"."status" in ('created', 'authorized', 'captured', 'failed', 'refunded'))
);
--> statement-breakpoint
CREATE TABLE "product_images" (
	"product_id" uuid NOT NULL,
	"asset_id" text NOT NULL,
	"position" integer NOT NULL,
	"role" text DEFAULT 'gallery' NOT NULL,
	"alt" text NOT NULL,
	CONSTRAINT "product_images_product_id_asset_id_pk" PRIMARY KEY("product_id","asset_id"),
	CONSTRAINT "product_image_role_check" CHECK ("product_images"."role" in ('primary', 'gallery', 'detail', 'lifestyle')),
	CONSTRAINT "product_image_position_check" CHECK ("product_images"."position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "product_terms" (
	"product_id" uuid NOT NULL,
	"term_id" text NOT NULL,
	"basis" text NOT NULL,
	"evidence" text,
	CONSTRAINT "product_terms_product_id_term_id_pk" PRIMARY KEY("product_id","term_id"),
	CONSTRAINT "product_terms_basis_check" CHECK ("product_terms"."basis" in ('fact', 'inference', 'client'))
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" text NOT NULL,
	"sku" text,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"name_status" text DEFAULT 'working' NOT NULL,
	"summary" text,
	"description" text,
	"copy_status" text DEFAULT 'draft' NOT NULL,
	"price_paise" integer,
	"currency" text DEFAULT 'INR' NOT NULL,
	"price_status" text DEFAULT 'pending' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"availability" text DEFAULT 'unconfirmed' NOT NULL,
	"track_inventory" boolean DEFAULT false NOT NULL,
	"stock" integer,
	"colour" text,
	"material" text,
	"dimensions" text,
	"features" text[] DEFAULT '{}'::text[] NOT NULL,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"featured_rank" integer,
	"arrived_at" timestamp with time zone,
	"internal_notes" text,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_reference_unique" UNIQUE("reference"),
	CONSTRAINT "products_sku_unique" UNIQUE("sku"),
	CONSTRAINT "products_slug_unique" UNIQUE("slug"),
	CONSTRAINT "product_name_status_check" CHECK ("products"."name_status" in ('working', 'approved')),
	CONSTRAINT "product_copy_status_check" CHECK ("products"."copy_status" in ('draft', 'approved')),
	CONSTRAINT "product_price_status_check" CHECK ("products"."price_status" in ('pending', 'approved')),
	CONSTRAINT "product_price_check" CHECK ("products"."price_paise" is null or "products"."price_paise" > 0),
	CONSTRAINT "product_price_approved_check" CHECK ("products"."price_status" = 'pending' or "products"."price_paise" is not null),
	CONSTRAINT "product_currency_check" CHECK ("products"."currency" = 'INR'),
	CONSTRAINT "product_status_check" CHECK ("products"."status" in ('draft', 'published', 'archived')),
	CONSTRAINT "product_availability_check" CHECK ("products"."availability" in ('unconfirmed', 'in_stock', 'made_to_order', 'out_of_stock')),
	CONSTRAINT "product_stock_check" CHECK ("products"."stock" is null or "products"."stock" >= 0),
	CONSTRAINT "product_inventory_check" CHECK (not "products"."track_inventory" or "products"."stock" is not null),
	CONSTRAINT "product_slug_check" CHECK ("products"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);
--> statement-breakpoint
CREATE TABLE "rate_limit" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"count" integer NOT NULL,
	"last_request" bigint NOT NULL,
	CONSTRAINT "rate_limit_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "rate_limit_buckets" (
	"key" text PRIMARY KEY NOT NULL,
	"window_start" timestamp with time zone NOT NULL,
	"count" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "store_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "taxonomy_terms" (
	"id" text PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"slug" text NOT NULL,
	"label" text NOT NULL,
	"description" text,
	"synonyms" text[] DEFAULT '{}'::text[] NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "taxonomy_kind_check" CHECK ("taxonomy_terms"."kind" in ('style', 'occasion', 'collection'))
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" text DEFAULT 'customer' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_role_check" CHECK ("user"."role" in ('customer', 'staff', 'admin'))
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wishlist_items" (
	"user_id" text NOT NULL,
	"product_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "wishlist_items_user_id_product_id_pk" PRIMARY KEY("user_id","product_id")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_events" ADD CONSTRAINT "order_events_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_asset_id_media_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_terms" ADD CONSTRAINT "product_terms_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_terms" ADD CONSTRAINT "product_terms_term_id_taxonomy_terms_id_fk" FOREIGN KEY ("term_id") REFERENCES "public"."taxonomy_terms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "addresses_user_idx" ON "addresses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_created_idx" ON "audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "audit_target_idx" ON "audit_log" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE UNIQUE INDEX "carts_user_uq" ON "carts" USING btree ("user_id") WHERE "carts"."user_id" is not null;--> statement-breakpoint
CREATE INDEX "enquiries_created_idx" ON "enquiries" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "inventory_product_idx" ON "inventory_movements" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "order_events_order_idx" ON "order_events" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_items_order_idx" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "orders_user_idx" ON "orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payments_order_idx" ON "payments" USING btree ("order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_image_position_uq" ON "product_images" USING btree ("product_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "product_image_asset_uq" ON "product_images" USING btree ("asset_id");--> statement-breakpoint
CREATE INDEX "product_terms_term_idx" ON "product_terms" USING btree ("term_id");--> statement-breakpoint
CREATE INDEX "product_status_idx" ON "products" USING btree ("status");--> statement-breakpoint
CREATE INDEX "session_user_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "taxonomy_kind_slug_uq" ON "taxonomy_terms" USING btree ("kind","slug");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");