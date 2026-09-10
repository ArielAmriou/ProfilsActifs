-- Favoris par profil candidat (plus par vidéo), pour permettre le favori sans vidéo uploadée.
ALTER TABLE "favorites" DROP CONSTRAINT IF EXISTS "favorites_pkey";
ALTER TABLE "favorites" DROP CONSTRAINT IF EXISTS "favorites_video_id_fkey";

ALTER TABLE "favorites" ADD COLUMN IF NOT EXISTS "favorited_user_id" UUID;

UPDATE "favorites" f
SET "favorited_user_id" = v."user_id"
FROM "videos" v
WHERE f."video_id" = v."id"
  AND f."favorited_user_id" IS NULL;

DELETE FROM "favorites" WHERE "favorited_user_id" IS NULL;

ALTER TABLE "favorites" ALTER COLUMN "favorited_user_id" SET NOT NULL;

ALTER TABLE "favorites" DROP COLUMN IF EXISTS "video_id";

ALTER TABLE "favorites"
  ADD CONSTRAINT "favorites_pkey" PRIMARY KEY ("favorited_user_id", "user_id");

ALTER TABLE "favorites"
  ADD CONSTRAINT "favorites_favorited_user_id_fkey"
  FOREIGN KEY ("favorited_user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "favorites"
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS "favorites_user_id_idx" ON "favorites"("user_id");
