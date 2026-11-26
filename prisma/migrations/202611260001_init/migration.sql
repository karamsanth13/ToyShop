-- CreateTable
CREATE TABLE "admin_profiles" (
    "id" UUID NOT NULL,
    "full_name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'Admin',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "admin_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shop_details" (
    "id" SMALLINT NOT NULL DEFAULT 1,
    "name" VARCHAR(160),
    "description" VARCHAR(2000),
    "logo_url" VARCHAR(2048),
    "logo_public_id" VARCHAR(255),
    "address" VARCHAR(500),
    "map_location" VARCHAR(2048),
    "phone" VARCHAR(40),
    "whatsapp_number" VARCHAR(40),
    "email" VARCHAR(254),
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "shop_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_links" (
    "id" UUID NOT NULL,
    "platform" TEXT NOT NULL,
    "url" VARCHAR(2048) NOT NULL,
    "label" VARCHAR(80),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "social_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "login_rate_limits" (
    "key_hash" CHAR(64) NOT NULL,
    "hits" INTEGER NOT NULL DEFAULT 0,
    "reset_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "login_rate_limits_pkey" PRIMARY KEY ("key_hash")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "description" VARCHAR(1000),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "category_id" UUID,
    "price" DECIMAL(10,2) NOT NULL,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "description" TEXT,
    "availability" TEXT NOT NULL DEFAULT 'in_stock',
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "is_rare" BOOLEAN NOT NULL DEFAULT false,
    "is_new" BOOLEAN NOT NULL DEFAULT false,
    "is_recommended" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offers" (
    "id" UUID NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "description" VARCHAR(2000),
    "starts_at" TIMESTAMPTZ(6) NOT NULL,
    "ends_at" TIMESTAMPTZ(6) NOT NULL,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offer_products" (
    "offer_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "offer_products_pkey" PRIMARY KEY ("offer_id","product_id")
);

-- CreateTable
CREATE TABLE "pre_bookings" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "customer_name" VARCHAR(120) NOT NULL,
    "phone" VARCHAR(40) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pre_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_profiles_email_key" ON "admin_profiles"("email");

-- CreateIndex
CREATE INDEX "social_links_sort_order_platform_idx" ON "social_links"("sort_order", "platform");

-- CreateIndex
CREATE INDEX "login_rate_limits_reset_at_idx" ON "login_rate_limits"("reset_at");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "categories_is_published_sort_order_name_idx" ON "categories"("is_published", "sort_order", "name");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE INDEX "products_category_id_idx" ON "products"("category_id");

-- CreateIndex
CREATE INDEX "products_is_published_created_at_idx" ON "products"("is_published", "created_at");

-- CreateIndex
CREATE INDEX "products_is_published_availability_idx" ON "products"("is_published", "availability");

-- CreateIndex
CREATE INDEX "products_is_published_is_recommended_is_rare_is_new_idx" ON "products"("is_published", "is_recommended", "is_rare", "is_new");

-- CreateIndex
CREATE INDEX "offers_is_published_starts_at_ends_at_idx" ON "offers"("is_published", "starts_at", "ends_at");

-- CreateIndex
CREATE INDEX "offer_products_product_id_idx" ON "offer_products"("product_id");

-- CreateIndex
CREATE INDEX "pre_bookings_created_at_idx" ON "pre_bookings"("created_at");

-- CreateIndex
CREATE INDEX "pre_bookings_product_id_idx" ON "pre_bookings"("product_id");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_products" ADD CONSTRAINT "offer_products_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_products" ADD CONSTRAINT "offer_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pre_bookings" ADD CONSTRAINT "pre_bookings_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "admin_profiles" ADD CONSTRAINT "admin_profiles_valid_role_check" CHECK ("role" IN ('Admin', 'Super Admin'));
ALTER TABLE "shop_details" ADD CONSTRAINT "shop_details_singleton_id_check" CHECK ("id" = 1);
ALTER TABLE "social_links" ADD CONSTRAINT "social_links_valid_platform_check" CHECK ("platform" IN ('Instagram', 'Facebook', 'YouTube', 'TikTok', 'Other'));
ALTER TABLE "products" ADD CONSTRAINT "products_valid_availability_check" CHECK ("availability" IN ('in_stock', 'out_of_stock'));
ALTER TABLE "products" ADD CONSTRAINT "products_nonnegative_price_check" CHECK ("price" >= 0);
ALTER TABLE "offers" ADD CONSTRAINT "offers_valid_window_check" CHECK ("ends_at" > "starts_at");

