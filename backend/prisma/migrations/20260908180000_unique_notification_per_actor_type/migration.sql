-- Nettoie les doublons éventuels (ex. PROFILE_VIEWED spam) avant l'index unique.
DELETE FROM "notifications" AS n
WHERE n."actor_id" IS NOT NULL
  AND n."id" NOT IN (
    SELECT DISTINCT ON ("recipient_id", "actor_id", "type") "id"
    FROM "notifications"
    WHERE "actor_id" IS NOT NULL
    ORDER BY "recipient_id", "actor_id", "type", "created_at" ASC
  );

-- Une seule notification par couple destinataire / acteur / type.
CREATE UNIQUE INDEX IF NOT EXISTS notifications_recipient_actor_type_unique
ON "notifications" ("recipient_id", "actor_id", "type")
WHERE "actor_id" IS NOT NULL;
