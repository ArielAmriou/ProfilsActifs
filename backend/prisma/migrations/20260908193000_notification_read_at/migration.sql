-- Statut lu / non lu des notifications
ALTER TABLE "notifications"
  ADD COLUMN IF NOT EXISTS "read_at" TIMESTAMPTZ(3);
