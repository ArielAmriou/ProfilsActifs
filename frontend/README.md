# Frontend — Compétences+

Application Next.js 16 (App Router) en React 19, stylée avec Tailwind CSS 4.

Documentation détaillée : [../docs/frontend.md](../docs/frontend.md).

## Démarrer

Depuis la racine du dépôt, avec le backend :

```bash
docker compose up -d --build
```

En développement local, avec rechargement à chaud :

```bash
bun install
bun run dev
```

L'application est servie sur [http://localhost:3000](http://localhost:3000) et interroge l'API
à l'adresse définie par `NEXT_PUBLIC_API_URL` dans `.env.local`.

## Commandes

| Commande | Rôle |
| --- | --- |
| `bun run dev` | Serveur de développement |
| `bun run build` | Build de production |
| `bun run start` | Sert le build de production |
| `bunx tsc --noEmit` | Vérification des types |

## Point d'attention

Next.js fige les variables `NEXT_PUBLIC_*` **au moment du build**. Après avoir modifié
`.env.local`, un `docker compose up -d --build front-bun` est nécessaire : un simple redémarrage
ne prendra pas le changement en compte.

## Organisation

```
src/
├── app/            Routes App Router, une page par dossier
├── components/     Composants d'interface, regroupés par domaine
├── context/        État global : authentification, notifications
├── hooks/          Hooks réutilisables
├── lib/            Clients HTTP vers l'API et utilitaires
├── data/           Données statiques (CGU, secteurs, filtres)
└── types/          Types partagés
```
