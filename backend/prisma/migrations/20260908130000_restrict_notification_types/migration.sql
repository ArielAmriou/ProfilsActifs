-- Notifications are unilateral (recruiter/admin -> jobseeker only). PROFILE_UPDATED
-- (self-confirmation) and FAVORITE_VIDEO_CHANGED (jobseeker -> recruiter) do not belong
-- in that model and are removed. Postgres has no DROP VALUE for enums, so the type is
-- recreated. Safe here: the `notifications` table is empty in every environment this
-- migration has been applied to (feature not yet released).
BEGIN;

CREATE TYPE "notification_type_new" AS ENUM ('FAVORITE_ADDED', 'PROFILE_VIEWED');

ALTER TABLE "notifications"
  ALTER COLUMN "type" TYPE "notification_type_new"
  USING ("type"::text::"notification_type_new");

DROP TYPE "notification_type";

ALTER TYPE "notification_type_new" RENAME TO "notification_type";

COMMIT;
