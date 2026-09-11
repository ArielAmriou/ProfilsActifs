# Rapport de test de charge — Compétences+

**Date d'exécution** : 10 septembre 2026
**Outil** : k6 v2.2.0 (linux/amd64)
**Machine de test** : AMD Ryzen 7 7735U, 16 cœurs, 14 Gio de RAM, kernel 6.14.0-37, Docker 29.8.0
**Cible** : pile complète en conteneurs sur la même machine (backend Bun/Fastify, PostgreSQL 17)

Toutes les mesures ci-dessous ont été produites sur cette machine à cette date. Les sorties brutes
de k6 sont jointes dans `perf/results/`.

## 1. Jeu de données

504 profils candidats, dont **303 avec une vidéo réellement présente sur disque** (1,6 Go), 44
recruteurs et 900 mises en favori.

Les comptes et les favoris viennent de `seed.sh`. Les vidéos sont déposées par
`backend/scripts/seed-videos.ts` (`bun run seed:videos`), qui appelle `replaceUserVideo`, donc
`VideoProvider.store()` — le même chemin de code que l'upload HTTP. Aucun octet n'est écrit
directement dans le stockage, aucune ligne `videos` n'est insérée à la main.

## 2. Scénario

`perf/catalogue-browse.js` — 100 utilisateurs virtuels constants pendant 2 minutes.

Chaque itération reproduit un recruteur qui parcourt le catalogue, avec 1 seconde de réflexion
entre chaque étape :

1. `GET /api/profiles` — la liste des profils
2. `GET /api/profiles/:id` — une fiche tirée au hasard
3. `GET /api/videos/:id/stream` avec `Range: bytes=0-262143` — les 256 premiers Kio d'une vidéo,
   comme le fait un lecteur au démarrage

4 000 itérations, 12 001 requêtes HTTP, 2,1 Go reçus.

## 3. Résultats — exécution de référence

Sortie brute : `perf/results/01-baseline.txt`

| Route | Médiane | p95 | p99 | Erreurs |
|---|---|---|---|---|
| `GET /api/profiles` | 13,09 ms | **65,45 ms** | **672,73 ms** | 0 |
| `GET /api/profiles/:id` | 1,41 ms | 4,85 ms | 8,28 ms | 0 |
| `GET /api/videos/:id/stream` | 1,82 ms | 5,46 ms | 8,36 ms | 0 |

**0 erreur sur 12 000 vérifications.** Le service tient les 100 utilisateurs, mais le catalogue
est 13 fois plus lent que les deux autres routes au p95, et son p99 dépasse la demi-seconde.

## 4. Goulot d'étranglement identifié

Un test complémentaire, catalogue seul à 100 VUs (`perf/catalogue-only.js`), pousse la route
jusqu'à sa limite : **117 req/s, médiane 857 ms**. Pendant cette exécution :

```
profilsactifs-back-bun-1   CPU 201,71 %
postgres-pf                CPU  37,58 %
```

**Ce n'est pas la base de données.** PostgreSQL reste à 40 % pendant que le processus backend
sature. La décomposition du coût unitaire le confirme :

| Étape | Coût |
|---|---|
| Requête Prisma + projection des 504 profils | ~10,8 ms |
| Accès disque des 323 vidéos (`videoFileState`) | 1,0 ms |
| Validation zod de la réponse | 1,1 ms |
| `JSON.stringify` (251 Kio) | 0,5 ms |

Aucune étape n'est anormalement lente. **Le problème est structurel : la route ne pagine pas.**
Elle reconstruit les 504 profils et sérialise 251 Kio à chaque appel. À 117 req/s cela représente
~29 Mo/s de JSON produits par un processus dont la boucle d'événements est mono-thread. Le p99
s'effondre parce que les requêtes s'accumulent derrière ce travail CPU.

## 5. Correctif appliqué

Le catalogue est identique pour tous les visiteurs et ne change que lorsqu'un profil est modifié.
Il est désormais **mémorisé en mémoire pendant 5 secondes** (`PROFILES_CACHE_TTL_MS`), avec
déduplication des requêtes concurrentes : à l'expiration, une seule reconstruit la liste, les
autres attendent le même résultat au lieu de recalculer chacune la leur. Le cache est invalidé
explicitement à la mise à jour d'un profil et au changement de consentement CGU.

Diff : `backend/src/module/profiles/service.ts`, 25 lignes.

## 6. Résultats — après correctif

Scénario strictement identique. Sortie brute : `perf/results/02-after-cache.txt`

| Route | Médiane | p95 | p99 | Erreurs |
|---|---|---|---|---|
| `GET /api/profiles` | 10,80 ms | **28,14 ms** | **163,65 ms** | 0 |
| `GET /api/profiles/:id` | 0,79 ms | 3,34 ms | 65,26 ms | 0 |
| `GET /api/videos/:id/stream` | 1,71 ms | 5,93 ms | 55,87 ms | 0 |

Sur le catalogue : **p95 divisé par 2,3** (65,45 → 28,14 ms), **p99 divisé par 4,1**
(672,73 → 163,65 ms), maximum divisé par 4,9 (822 → 168 ms).

Le test de saturation donne la mesure la plus parlante
(`03-saturation-before.txt` / `04-saturation-after.txt`) :

| Catalogue seul, 100 VUs | Avant | Après | Gain |
|---|---|---|---|
| Débit | 117 req/s | **1 081 req/s** | ×9,2 |
| Médiane | 856,6 ms | **91,6 ms** | ÷9,3 |
| p95 | 889,3 ms | **101,8 ms** | ÷8,7 |
| CPU backend | 201 % | 115 % | |
| CPU PostgreSQL | 37,6 % | 5,3 % | |

## 7. Ce que nous n'avons pas corrigé, et pourquoi

**Le cache masque le problème, il ne le supprime pas.** La route renvoie toujours 504 profils en
251 Kio. Le vrai correctif est la **pagination côté serveur** : le front n'affiche que 20 profils
par page (`CATALOG_PAGE_SIZE = 20`) et télécharge pourtant les 504 à chaque chargement. Nous ne
l'avons pas fait ici parce que cela change le contrat de l'API et impose de reprendre
`ProfileCatalog` et `lib/favorites.ts` côté front — hors du périmètre de ce ticket. À 5 000
profils, le cache ne suffira plus : la reconstruction coûtera dix fois plus et le pic de 5 secondes
deviendra visible.

**Le correctif a un effet de bord mesuré.** Le p99 des deux autres routes a augmenté (8,3 → 65,3 ms
sur la fiche profil, 8,4 → 55,9 ms sur le flux vidéo). La reconstruction du cache concentre
désormais le coût en pics toutes les 5 secondes, qui bloquent brièvement les autres requêtes. Le
bilan reste très favorable, mais c'est un déplacement de la charge, pas une disparition.

**Les données peuvent avoir jusqu'à 5 secondes de retard** pour un changement non couvert par une
invalidation explicite — la suppression d'une vidéo, par exemple. Une fiche peut alors annoncer une
vidéo lisible qui ne l'est plus ; le front bascule en mode dégradé, sans erreur 500.
