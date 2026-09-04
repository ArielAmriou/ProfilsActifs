-- AlterTable
ALTER TABLE "users" DROP COLUMN "password";

-- AlterTable: add better-auth columns
ALTER TABLE "users" ADD COLUMN "email_verified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "image" VARCHAR(255);
ALTER TABLE "users" ADD COLUMN "name" VARCHAR(255);

-- Backfill "name" from the legacy firstname/lastname columns, then enforce NOT NULL
UPDATE "users" SET "name" = "firstname" || ' ' || "lastname" WHERE "name" IS NULL;
ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL;

ALTER TABLE "users" ADD COLUMN "updated_at" TIMESTAMPTZ(3);

-- Backfill "updated_at" from "created_at", then enforce NOT NULL
UPDATE "users" SET "updated_at" = "created_at"::timestamptz WHERE "updated_at" IS NULL;
ALTER TABLE "users" ALTER COLUMN "updated_at" SET NOT NULL;

-- AlterTable: created_at moves from timestamp(0) to timestamptz(3)
ALTER TABLE "users" ALTER COLUMN "created_at" TYPE TIMESTAMPTZ(3) USING "created_at" AT TIME ZONE 'UTC';

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateTable
CREATE TABLE "session" (
    "id" VARCHAR(255) NOT NULL,
    "user_id" UUID NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "ip_address" VARCHAR(255),
    "user_agent" VARCHAR(255),
    "created_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" VARCHAR(255) NOT NULL,
    "user_id" UUID NOT NULL,
    "issuer" VARCHAR(255) NOT NULL,
    "account_id" VARCHAR(255) NOT NULL,
    "provider_id" VARCHAR(255) NOT NULL,
    "access_token" VARCHAR(500),
    "refresh_token" VARCHAR(500),
    "access_token_expires_at" TIMESTAMPTZ(3),
    "refresh_token_expires_at" TIMESTAMPTZ(3),
    "scope" VARCHAR(255),
    "id_token" VARCHAR(500),
    "password" VARCHAR(255),
    "created_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" VARCHAR(255) NOT NULL,
    "identifier" VARCHAR(255) NOT NULL,
    "value" VARCHAR(500) NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("user_id");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("user_id");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
