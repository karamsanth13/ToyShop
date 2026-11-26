-- AlterTable
ALTER TABLE "admin_profiles" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "last_login_at" TIMESTAMPTZ(6),
ADD COLUMN     "username" VARCHAR(40);

UPDATE "admin_profiles"
SET "username" = LEFT(COALESCE(NULLIF(REGEXP_REPLACE(LOWER(SPLIT_PART("email", '@', 1)), '[^a-z0-9_.-]', '', 'g'), ''), 'admin') || '-' || SUBSTRING("id"::text, 1, 8), 40)
WHERE "username" IS NULL;
ALTER TABLE "admin_profiles" ALTER COLUMN "username" SET NOT NULL;

-- AlterTable
ALTER TABLE "shop_details" ADD COLUMN     "opening_hours" VARCHAR(1000);

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "age_group" VARCHAR(40),
ADD COLUMN     "is_best_seller" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stock_quantity" INTEGER NOT NULL DEFAULT 0;
UPDATE "products" SET "stock_quantity" = CASE WHEN "availability" = 'in_stock' THEN 10 ELSE 0 END;

-- AlterTable
ALTER TABLE "offers" ADD COLUMN     "discount_percent" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "pre_bookings" ADD COLUMN     "email" VARCHAR(254),
ADD COLUMN     "message" VARCHAR(1000),
ADD COLUMN     "status" VARCHAR(20) NOT NULL DEFAULT 'Pending',
ADD COLUMN     "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "pre_bookings" ALTER COLUMN "updated_at" DROP DEFAULT;

-- CreateTable
CREATE TABLE "enquiries" (
    "id" UUID NOT NULL,
    "customer_name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(254),
    "phone" VARCHAR(40),
    "product_id" UUID,
    "message" VARCHAR(2000) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'New',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "enquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_subscribers" (
    "id" UUID NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "consented_at" TIMESTAMPTZ(6) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_activities" (
    "id" UUID NOT NULL,
    "admin_id" UUID,
    "action" VARCHAR(80) NOT NULL,
    "target_type" VARCHAR(80) NOT NULL,
    "target_id" VARCHAR(80),
    "details" VARCHAR(1000),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "enquiries_status_created_at_idx" ON "enquiries"("status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "notification_subscribers_email_key" ON "notification_subscribers"("email");

-- CreateIndex
CREATE INDEX "notification_subscribers_is_active_created_at_idx" ON "notification_subscribers"("is_active", "created_at");

-- CreateIndex
CREATE INDEX "admin_activities_created_at_idx" ON "admin_activities"("created_at");

-- CreateIndex
CREATE INDEX "admin_activities_admin_id_created_at_idx" ON "admin_activities"("admin_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "admin_profiles_username_key" ON "admin_profiles"("username");

-- AddForeignKey
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_activities" ADD CONSTRAINT "admin_activities_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admin_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "products" ADD CONSTRAINT "products_nonnegative_stock_check" CHECK ("stock_quantity" >= 0);
ALTER TABLE "offers" ADD CONSTRAINT "offers_discount_percent_check" CHECK ("discount_percent" BETWEEN 0 AND 90);
ALTER TABLE "pre_bookings" ADD CONSTRAINT "pre_bookings_valid_status_check" CHECK ("status" IN ('Pending', 'Contacted', 'Confirmed', 'Rejected'));
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_valid_status_check" CHECK ("status" IN ('New', 'Read', 'Resolved'));

