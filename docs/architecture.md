# Architecture

Vue d'ensemble technique de Compétences+ : comment les briques s'assemblent, ce qui traverse
une requête, et les décisions structurantes qui expliquent la forme du code.

## 1. Les trois services

```
navigateur ──► front-bun (Next.js, :3000)
                   │  fetch / EventSource, cookie de session
                   ▼
              back-bun (Fastify sur Bun, :8081)
                   │  Prisma
                   ▼
              postgres-pf (PostgreSQL 17, :5432)
```

Les trois tournent en conteneurs orchestrés par `docker-compose.yml`. Le backend attend que la
base soit saine (`healthcheck` `pg_isready`) avant de démarrer, puis applique les migrations
Prisma en attente avant d'ouvrir le port. Un `docker compose up -d --build` suffit donc à obtenir
une pile à jour, sans commande de migration séparée.

Le front et le back sont sur des **origines différentes** (`:3000` et `:8081`). Toutes les
requêtes authentifiées portent donc `credentials: "include"` et le backend autorise cette origine
avec `credentials: true`.

## 2. Découpe du backend

`src/module/` contient un dossier par domaine, tous bâtis sur le même patron :

| Fichier | Rôle |
| --- | --- |
| `routes.ts` | Déclaration HTTP, validation d'entrée, codes de retour |
| `service.ts` | Logique métier, seul à parler à Prisma |
| `schemas.ts` | Schémas zod partagés entre validation et documentation |
| `errors.ts` | Erreurs typées que les routes traduisent en statuts |

Les modules présents : `auth`, `profiles`, `video`, `notifications`, `favorite`, `admin`, `user`,
`certification`, `health`.

Cette séparation a une conséquence pratique : une route ne contient jamais de requête Prisma, et
un service ne connaît jamais Fastify. C'est ce qui permet aux scripts de `scripts/` d'appeler la
même logique métier que l'API sans passer par HTTP.

## 3. Authentification

L'authentification repose sur **better-auth**, monté sur `/api/auth/*` par un handler générique
qui traduit la requête Fastify en `Request` standard ([module/auth/routes.ts](../backend/src/module/auth/routes.ts)).

- Les champs métier (`firstname`, `lastname`, `role`, `birthdate`, `cguAcceptedAt`, `cguVersion`)
  sont déclarés en `additionalFields` et vivent dans la table `users`.
- La session est portée par un **cookie**, jamais par un en-tête. C'est une contrainte imposée par
  `EventSource`, qui ne permet pas d'en-tête personnalisé et sert le flux de notifications.
- `middleware/session.ts` expose `getSessionUser(request)` : le point unique par lequel toute route
  protégée identifie l'appelant.

### Consentement aux CGU

Un compte ne peut pas être créé sans acceptation. L'enforcement est un
`databaseHooks.user.create.before` qui **refuse la création** si l'acceptation manque et
**réécrit l'horodatage avec l'heure du serveur** : une date fournie par le client n'aurait aucune
valeur. La révocation (`PUT /api/me/cgu`) remet `cguAcceptedAt` à `null`, ce qui sort le profil du
catalogue public — l'affichage repose sur la licence que les CGU concèdent.

## 4. L'abstraction vidéo

C'est la pièce la plus structurée du backend, et celle dont la forme est la plus intentionnelle.

Aucun fichier vidéo n'est servi statiquement. La base **ne stocke pas de chemin** mais un couple
`provider_name` + `provider_id` opaque. L'interface, dans
[provider/types.ts](../backend/src/module/video/provider/types.ts) :

```ts
interface VideoProvider {
  readonly name: string;
  store(file: VideoUpload): Promise<string>;
  status(id: string): Promise<VideoStatus>;
  playbackUrl(id: string): Promise<string>;
  delete(id: string): Promise<void>;
}
```

Trois principes tiennent l'ensemble :

- **`store` renvoie un identifiant, pas une URL.** L'identifiant est la seule chose durable ; une
  URL est dérivée, elle peut être signée, expirer, changer de domaine.
- **`status` ne lève jamais d'erreur.** Elle répond `PROCESSING`, `READY` ou `ERROR` même quand le
  fournisseur est injoignable. C'est ce contrat qui garantit qu'une fiche profil s'affiche
  toujours et qu'une indisponibilité devienne un message plutôt qu'une erreur 500.
- **`delete` efface les octets**, pas seulement la ligne. C'est le seul endroit du code qui
  supprime réellement le contenu, et il sert autant à la suppression volontaire qu'à la révocation
  du consentement.

Deux implémentations existent : `local` (stockage disque hors du répertoire web, servi par une
route applicative avec support des requêtes `Range`) et `fake` (instance ministérielle simulée
injoignable, sélectionnable par `VIDEO_PROVIDER=fake`, qui sert à éprouver le mode dégradé).

`StreamingVideoProvider` étend l'interface avec `head()` et `openStream()` : ce sont des capacités
**optionnelles**, propres au stockage local. Un fournisseur distant renverra une URL vers son
propre serveur et n'aura pas à les implémenter.

## 5. Notifications temps réel

Les notifications sont **unilatérales** : elles vont vers les candidats, jamais vers les
recruteurs. Deux types existent aujourd'hui, `FAVORITE_ADDED` et `PROFILE_VIEWED`.

Le transport est **Server-Sent Events** sur `GET /api/notifications/stream`. Un registre en
mémoire ([registry.ts](../backend/src/module/notifications/registry.ts)) associe chaque
destinataire à ses connexions ouvertes.

`publishNotification` **n'échoue jamais** : une notification qui ne part pas ne doit pas casser
l'action qui l'a déclenchée. Une mise en favori réussit même si l'écriture de la notification
échoue.

La table `notifications` n'est pas une boîte de réception mais un **tampon de rattrapage** :
`?since=<ISO>` rejoue ce qui a été créé après cet horodatage.

> Ce registre est **en mémoire du processus**. Avec plusieurs instances du backend, un événement
> publié par l'une n'atteindrait pas les clients connectés à l'autre. Un bus externe serait
> nécessaire avant toute mise à l'échelle horizontale.

## 6. Catalogue public et cache

`GET /api/profiles` renvoie tous les profils candidats ayant accepté les CGU, avec leur
descripteur vidéo intégré — ce qui évite une requête HTTP par carte affichée.

Cette route ne pagine pas et reconstruit l'intégralité de la liste à chaque appel. Sous charge,
c'est le point qui sature en premier. Elle est donc **mémorisée en mémoire quelques secondes**
(`PROFILES_CACHE_TTL_MS`, 5 s par défaut), avec déduplication des reconstructions concurrentes :
à l'expiration, une seule requête recalcule, les autres attendent le même résultat. Le cache est
invalidé explicitement à la modification d'un profil et au changement de consentement.

Mesures et limites dans [../perf/RAPPORT.md](../perf/RAPPORT.md). La correction structurelle
reste la pagination côté serveur ; le cache la reporte, il ne la remplace pas.

## 7. Validation et documentation

Les schémas zod servent **deux usages simultanés** : la validation des entrées et sorties par
`fastify-type-provider-zod`, et la génération de la documentation OpenAPI exposée sur `/docs`.
Un schéma corrigé met donc à jour la documentation sans action supplémentaire.

Une conséquence à connaître : le typage de `reply.send()` est contraint par le schéma de réponse
déclaré. Une route qui écrit directement dans `reply.raw` — le flux SSE — doit reprendre elle-même
les en-têtes que Fastify aurait posés, CORS compris.
