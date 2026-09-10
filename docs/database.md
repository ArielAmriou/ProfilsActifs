# Modèle de données

PostgreSQL 17, accédé par Prisma 7. Le schéma fait autorité :
[backend/prisma/schema.prisma](../backend/prisma/schema.prisma).

Les noms Prisma sont en `camelCase`, les colonnes en `snake_case` via `@map`. Toute requête écrite
à la main doit utiliser les noms de colonnes, pas les noms de champs.

## Vue d'ensemble

```
users ─┬─< videos (0..1)
       ├─< favorites (donnés et reçus)
       ├─< notifications (reçues et émises)
       ├─< answers
       ├─< surveys
       ├─< session
       └─< account
```

## users

La table centrale. Elle porte l'identité, le rôle, le profil candidat et le consentement.

| Colonne | Type | Notes |
| --- | --- | --- |
| `id` | uuid | Clé primaire |
| `firstname`, `lastname`, `name` | varchar(255) | `name` est le nom d'affichage better-auth |
| `email` | varchar(255) | Unique |
| `email_verified` | boolean | Géré par better-auth |
| `image` | varchar(255) | Facultatif |
| `role` | `user_role` | `jobseeker`, `recruiter`, `admin` |
| `title`, `sector`, `location`, `availability` | varchar(255) | Profil candidat, nullables |
| `skills` | text[] | Vide par défaut |
| `certified` | boolean | Badge « Talent Certifié » |
| `cgu_accepted_at` | timestamptz(3) | `NULL` = non accepté ou révoqué |
| `cgu_version` | varchar(50) | Version acceptée |
| `created_at`, `updated_at` | timestamptz(3) | |
| `birthdate` | timestamp(0) | |

`cgu_accepted_at` est **le filtre du catalogue public** : un profil dont la valeur est `NULL`
n'apparaît ni dans `GET /api/profiles`, ni sur sa fiche.

Les champs de profil sont nullables : un compte fraîchement créé n'a ni titre ni secteur. Les
clients doivent donc gérer l'absence de valeur, ce que fait `lib/profiles-api.ts` côté front.

## videos

Une vidéo par candidat au maximum (`user_id` unique).

| Colonne | Type | Notes |
| --- | --- | --- |
| `id` | uuid | Clé primaire |
| `user_id` | uuid | Unique, `ON DELETE CASCADE` |
| `provider_name` | varchar(32) | `local`, `fake`, `legacy` |
| `provider_id` | varchar(255) | **Identifiant opaque**, jamais un chemin |
| `status` | `video_status` | `PROCESSING`, `READY`, `ERROR` |
| `size` | int | Octets, nullable |
| `created_at`, `updated_at` | timestamptz(3) | |

Index sur `(provider_name, provider_id)`, **non unique** : plusieurs lignes peuvent légitimement
porter le même identifiant legacy quand elles pointaient vers le même fichier.

`size` est un `INTEGER`, donc plafonné à ~2 Go. C'est cohérent avec l'architecture actuelle, où
l'upload est limité à 100 Mo et le fichier transite entièrement en mémoire.

`provider_name = 'legacy'` désigne une ligne héritée de l'ancien modèle à chemin de fichier, dont
les octets n'ont pas encore été déplacés. Elle s'affiche en mode dégradé jusqu'au passage de
`bun run migrate:videos`.

## favorites

Association recruteur → candidat, clé primaire composite.

| Colonne | Type | Notes |
| --- | --- | --- |
| `favorited_user_id` | uuid | Le candidat mis en favori |
| `user_id` | uuid | Le recruteur |
| `created_at` | timestamptz(3) | |

Les deux relations pointent vers `users`, d'où les noms explicites côté Prisma :
`favoritesGiven` (relation `RecruiterFavorites`) et `favoritesReceived`
(relation `FavoritedAsJobseeker`).

## notifications

| Colonne | Type | Notes |
| --- | --- | --- |
| `id` | uuid | Clé primaire |
| `recipient_id` | uuid | `ON DELETE CASCADE` |
| `actor_id` | uuid | Nullable, `ON DELETE SET NULL` |
| `type` | `notification_type` | `FAVORITE_ADDED`, `PROFILE_VIEWED` |
| `payload` | jsonb | `{}` par défaut |
| `created_at` | timestamptz(3) | |
| `read_at` | timestamptz(3) | `NULL` = non lue |

Deux index : `(recipient_id, created_at)` pour le rejeu chronologique,
`(recipient_id, read_at)` pour le compteur de non-lues.

Le comportement des clés étrangères est délibéré : supprimer un destinataire efface ses
notifications, supprimer un acteur les conserve en les rendant anonymes.

## surveys et answers

`surveys` référence un fichier de questionnaire (`questionnaire_file`) plutôt que de stocker les
questions en base ; elles vivent dans `backend/certification/questions.v1.json`, validé au
démarrage. `answers` porte une contrainte d'unicité `(survey_id, user_id)` : une réponse par
questionnaire et par utilisateur.

## session, account, verification

Tables gérées par better-auth. Elles ne doivent pas être modifiées à la main : leur forme est
imposée par la bibliothèque et une migration a déjà dû ajuster leurs types.

## Migrations

17 migrations dans [backend/prisma/migrations](../backend/prisma/migrations), appliquées par ordre
lexicographique du nom de dossier.

```bash
bunx prisma migrate deploy    # applique les migrations en attente
bunx prisma generate          # régénère le client après modification du schéma
```

Le conteneur backend exécute `migrate deploy` à chaque démarrage : une base neuve se met à niveau
seule, et les 17 migrations s'appliquent d'affilée sans intervention.

Deux points à connaître avant d'ajouter une migration :

- **Datez-la après la dernière existante.** Une migration antérieure à une migration déjà
  appliquée fonctionne, mais rend l'historique trompeur pour l'équipe.
- **PostgreSQL ne sait pas retirer une valeur d'un enum.** La migration
  `20260908130000_restrict_notification_types` montre le contournement : créer le nouveau type,
  convertir la colonne, supprimer l'ancien, renommer. Ce n'est sûr que si aucune ligne ne porte
  la valeur retirée.
