# Backend — Compétences+

API Fastify servie par Bun, adossée à PostgreSQL via Prisma.

Documentation détaillée : [../docs/api.md](../docs/api.md) pour les endpoints,
[../docs/database.md](../docs/database.md) pour le modèle de données,
[../docs/architecture.md](../docs/architecture.md) pour les choix de conception.

## Démarrer

Le plus simple est de lancer la pile complète depuis la racine du dépôt :

```bash
docker compose up -d --build
```

Les migrations Prisma en attente sont appliquées automatiquement au démarrage du conteneur.

Pour travailler sans Docker, la base doit tourner et `DATABASE_URL` doit pointer sur elle :

```bash
bun install
DATABASE_URL="postgresql://username:password@localhost:5432/databasename" bun run src/index.ts
```

## Commandes

| Commande | Rôle |
| --- | --- |
| `bun test` | Suites de tests (nécessite une base joignable) |
| `bun run seed:videos` | Dépose des vidéos de démonstration via `VideoProvider` |
| `bun run migrate:videos` | Migre les anciennes vidéos vers le modèle à identifiant opaque |
| `bunx prisma migrate deploy` | Applique les migrations en attente |
| `bunx prisma generate` | Régénère le client Prisma après modification du schéma |

## Organisation

```
src/
├── app.ts              Construction de l'instance Fastify, CORS, Swagger, routes
├── server.ts           Démarrage HTTP
├── config/             Constantes de configuration (vidéo, CGU)
├── lib/                Client Prisma, schéma du questionnaire
├── middleware/         better-auth et récupération de session
├── module/             Un dossier par domaine métier
└── services/           Services transverses
scripts/                Scripts de maintenance rejouables
tests/                  Tests bun
```

Chaque module suit la même découpe : `routes.ts` (HTTP), `service.ts` (métier),
`schemas.ts` (validation zod), `errors.ts` si nécessaire.
