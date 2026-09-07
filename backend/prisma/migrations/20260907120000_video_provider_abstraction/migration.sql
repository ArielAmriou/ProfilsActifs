-- CreateEnum
CREATE TYPE "video_status" AS ENUM ('PROCESSING', 'READY', 'ERROR');

-- AlterTable
ALTER TABLE "videos" ADD COLUMN "provider_name" VARCHAR(32);
ALTER TABLE "videos" ADD COLUMN "provider_id" VARCHAR(255);
ALTER TABLE "videos" ADD COLUMN "status" "video_status";
ALTER TABLE "videos" ADD COLUMN "created_at" TIMESTAMPTZ(3);
ALTER TABLE "videos" ADD COLUMN "updated_at" TIMESTAMPTZ(3);

-- Backfill legacy rows onto the "legacy" provider, kept PROCESSING until the bytes are moved
UPDATE "videos"
SET "provider_name" = 'legacy',
    "provider_id" = "video_link",
    "status" = 'PROCESSING'
WHERE "provider_id" IS NULL;

UPDATE "videos" SET "created_at" = CURRENT_TIMESTAMP WHERE "created_at" IS NULL;
UPDATE "videos" SET "updated_at" = CURRENT_TIMESTAMP WHERE "updated_at" IS NULL;

ALTER TABLE "videos" ALTER COLUMN "provider_name" SET NOT NULL;
ALTER TABLE "videos" ALTER COLUMN "provider_id" SET NOT NULL;
ALTER TABLE "videos" ALTER COLUMN "status" SET NOT NULL;
ALTER TABLE "videos" ALTER COLUMN "status" SET DEFAULT 'PROCESSING';
ALTER TABLE "videos" ALTER COLUMN "created_at" SET NOT NULL;
ALTER TABLE "videos" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "videos" ALTER COLUMN "updated_at" SET NOT NULL;

-- DropColumn
ALTER TABLE "videos" DROP COLUMN "video_link";

-- CreateIndex
CREATE INDEX "videos_provider_name_provider_id_idx" ON "videos"("provider_name", "provider_id");
