-- AlterTable
ALTER TABLE "users" ADD COLUMN "cgu_accepted_at" TIMESTAMPTZ(3);
ALTER TABLE "users" ADD COLUMN "cgu_version" VARCHAR(50);

-- Accounts created before the terms were collected are considered to have
-- accepted them when they registered, so they keep working after this migration.
UPDATE "users"
SET "cgu_accepted_at" = "created_at",
    "cgu_version" = '2026-09-04'
WHERE "cgu_accepted_at" IS NULL;
