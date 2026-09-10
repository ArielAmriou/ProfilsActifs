# Référence de l'API

Base : `http://localhost:8081`. Documentation interactive OpenAPI sur
[`/docs`](http://localhost:8081/docs), générée depuis les mêmes schémas zod que la validation —
elle ne peut donc pas diverger du code.

## Conventions

**Authentification par cookie de session.** Aucun en-tête `Authorization` n'est utilisé. Depuis le
navigateur, toute requête authentifiée doit porter `credentials: "include"` ; `lib/api.ts` le fait
systématiquement côté front.

**Erreurs.** Corps uniforme `{ "error": "message" }`.

| Statut | Signification |
| --- | --- |
| 401 | Aucune session valide |
| 403 | Session valide mais rôle insuffisant |
| 404 | Ressource inexistante, ou invisible pour cet appelant |
| 413 | Charge utile trop volumineuse (upload vidéo) |
| 415 | Type de contenu non supporté |
| 422 | Validation du corps de requête échouée |
| 503 | Fournisseur vidéo injoignable |

## Santé

### `GET /health`
Public. Vérifie que l'API répond **et que la base est joignable**.
`200 { status, uptime, version }` · `503` si la base ne répond pas.

## Authentification

### `ALL /api/auth/*`
Endpoints better-auth : `sign-up/email`, `sign-in/email`, `sign-out`, sessions.

L'inscription exige les champs métier `firstname`, `lastname`, `role`, `birthdate` **et
`cguAcceptedAt`**. Sans ce dernier, la création est refusée (`400`). L'horodatage envoyé est
ignoré et remplacé par l'heure du serveur.

### `GET /api/me`
Utilisateur de la session courante. `200 { user }` · `401`.

## Profils

### `GET /api/profiles`
Public. Tous les candidats ayant accepté les CGU, descripteur vidéo inclus.
`200 { profiles: Profile[] }`

Cette route **ne pagine pas** : elle renvoie l'intégralité du catalogue. Réponse mémorisée
quelques secondes côté serveur.

### `GET /api/profiles/:id`
Public. Détail d'un candidat. `200 Profile` · `404` si l'identifiant ne correspond à aucun
candidat ayant accepté les CGU — un recruteur ou un profil révoqué renvoie donc `404`.

Effet de bord : consultée par un recruteur connecté, cette route publie une notification
`PROFILE_VIEWED` au candidat.

### `GET /api/me/profile`
Profil éditable de l'utilisateur connecté, consentement CGU compris. `200` · `401` · `404`.

### `PATCH /api/me/profile`
Met à jour son propre profil. Tous les champs sont facultatifs.

Corps : `firstname`, `lastname`, `name`, `birthdate`, `title`, `sector`, `location`, `skills[]`.

Tout autre champ envoyé est **ignoré silencieusement**, `role` et `certified` en particulier : un
compte ne s'attribue ni un rôle ni une certification.

`200` profil à jour · `401` · `422`.

### `PUT /api/me/cgu`
Accepte ou révoque les CGU. Corps `{ "accepted": boolean }`.

Une révocation retire le profil du catalogue public et de sa fiche. La connexion reste possible,
pour que la personne puisse revenir sur sa décision. `200` · `401`.

### `GET /api/users`
Flux paginé de profils. `200` · `401`.

## Vidéo

### `GET /api/videos/me`
Descripteur de sa propre vidéo. `200 { status, providerName, playbackUrl, size }` · `401`.

### `GET /api/profiles/:userId/video`
Public. Descripteur de la vidéo d'un profil. Toujours `200` : sans vidéo lisible, le descripteur
porte un statut dégradé plutôt qu'une erreur.

### `POST /api/videos`
Dépose ou remplace sa vidéo. Corps **binaire brut**, pas de `multipart`.

En-têtes : `Content-Type` parmi `video/mp4`, `video/webm`, `video/quicktime`, `video/x-m4v`,
`video/ogg` ; `x-video-filename` facultatif.

Un remplacement **efface les octets de la vidéo précédente**.

`201` descripteur · `401` · `413` au-delà de `VIDEO_MAX_UPLOAD_BYTES` · `415` · `503` si le
fournisseur est injoignable.

### `DELETE /api/videos/me`
Supprime sa vidéo **et ses octets sur le disque**. `200 { deleted: boolean }` · `401`.

### `DELETE /api/me/consent`
Révocation du consentement. Emprunte exactement le même chemin de suppression que la route
précédente. `200` · `401`.

### `GET /api/videos/:providerId/stream`
Public. Diffuse la vidéo par l'application. Supporte `Range` (`206 Partial Content`), en-têtes
`Accept-Ranges` et `Cache-Control: private, no-store`.

L'identifiant est opaque et n'est pas devinable ; aucun listing n'est exposé. `404` si aucune ligne
ne référence cet identifiant, ce qui couvre aussi les tentatives de traversée de chemin.

## Favoris

Les trois routes sont **réservées aux recruteurs** : `401` sans session, `403` avec un autre rôle.

| Route | Effet |
| --- | --- |
| `POST /api/favorites/:profileId` | Ajoute un candidat aux favoris · `201` · `404` |
| `GET /api/favorites` | Liste ses favoris · `200` |
| `DELETE /api/favorites/:profileId` | Retire un favori |

Un premier ajout publie une notification `FAVORITE_ADDED` au candidat. Un ajout répété du même
profil ne la republie pas.

## Notifications

Toutes authentifiées (`401` sinon).

| Route | Effet |
| --- | --- |
| `GET /api/notifications` | Liste ses notifications |
| `GET /api/notifications/unread-count` | Nombre de non-lues |
| `POST /api/notifications/read` | Marque tout comme lu |
| `DELETE /api/notifications/:id` | Supprime une notification · `404` |
| `GET /api/notifications/stream` | Flux Server-Sent Events |

### Le flux SSE

`GET /api/notifications/stream?since=<ISO-8601>`

Connexion `text/event-stream` maintenue ouverte. À utiliser avec `EventSource`, **pas** avec
`fetch` : la réponse ne se termine jamais.

```
id: <uuid>
event: FAVORITE_ADDED | PROFILE_VIEWED
data: {"id":"...","type":"...","actor":{...}|null,"payload":{...},"createdAt":"..."}
```

Un commentaire `: ping` est émis toutes les 20 s pour traverser les proxys ; `EventSource`
l'ignore. Un événement peut être relivré après reconnexion : **dédupliquez par `id`**.

`since` rejoue ce qui a été créé après cet horodatage. **Sans `since`, tout l'historique du
destinataire est rejoué**, pas seulement le direct.

## Certification

### `GET /api/certification/questions`
Public. Questions du questionnaire, chargées depuis
`backend/certification/questions.v1.json` et validées au démarrage.

> Le backend **sert** les questions mais ne corrige pas les réponses : le score et l'attribution
> du badge sont calculés côté navigateur. La colonne `certified` n'est donc alimentée par aucune
> route. Une route de soumission corrigeant côté serveur reste à écrire.

## Administration

Toutes réservées au rôle `admin` : `403` sinon.

| Route | Effet |
| --- | --- |
| `GET /api/admin/users` | Liste tous les utilisateurs |
| `DELETE /api/admin/users/:id` | Supprime un utilisateur et ses vidéos |
| `GET /api/admin/videos/pending` | Vidéos en attente de modération (`PROCESSING`) |
| `POST /api/admin/videos/:id/validate` | Passe la vidéo en `READY` |
| `POST /api/admin/videos/:id/reject` | Refuse et supprime la vidéo |
