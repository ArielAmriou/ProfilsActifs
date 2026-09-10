# Guide de développement

Installation, commandes, et les pièges qui font perdre des heures quand on ne les connaît pas.

## Installation

```bash
cp .env.example .env
cp backend/.env.example backend/.env
docker compose up -d --build
```

Front sur [:3000](http://localhost:3000), API sur [:8081](http://localhost:8081), Swagger sur
[:8081/docs](http://localhost:8081/docs). Les migrations Prisma s'appliquent au démarrage du
backend.

## Cycle de travail

**Une seule commande à retenir** :

```bash
docker compose up -d --build
```

Elle reconstruit tout et ne touche jamais à la base. Nommer un service (`--build back-bun`) ne
fait qu'accélérer en limitant le périmètre.

| Ce que vous avez modifié | Ce qu'il faut reconstruire |
| --- | --- |
| Code backend, `backend/.env` | `back-bun` |
| Code frontend | `front-bun` |
| `frontend/.env.local` | `front-bun`, **obligatoire** |
| Schéma Prisma | `back-bun`, après `bunx prisma generate` |

`docker compose stop` met en pause sans supprimer. `docker compose down` supprime les conteneurs
en gardant les données. **`docker compose down -v` efface la base** : comptes, profils, tout.

## Variables d'environnement

### `backend/.env`

| Variable | Rôle |
| --- | --- |
| `DATABASE_URL` | Connexion PostgreSQL |
| `BETTER_AUTH_SECRET` | Secret de signature des sessions |
| `BETTER_AUTH_URL` | URL publique de l'API, sert à construire les URL de lecture vidéo |
| `FRONTEND_URL` | Origine autorisée par CORS |
| `PORT` | Port d'écoute |
| `VIDEO_PROVIDER` | `local` ou `fake` |
| `VIDEO_STORAGE_PATH` | Répertoire de stockage des vidéos |
| `VIDEO_MAX_UPLOAD_BYTES` | Taille maximale d'un dépôt |
| `PROFILES_CACHE_TTL_MS` | Durée de mémorisation du catalogue, 5000 par défaut |

### `frontend/.env.local`

`NEXT_PUBLIC_API_URL` — adresse de l'API.

## Jeu de données de démonstration

```bash
./seed.sh                            # 500 profils, 40 recruteurs, 900 favoris
cd backend && bun run seed:videos    # 300 vidéos via VideoProvider
```

Identifiants générés : `jobseeker-001@seed.profilsactifs.test` ou
`recruiter-001@seed.profilsactifs.test`, mot de passe `SeedPassword123!`.

`seed.sh` exige `curl` et **`ffmpeg` avec libx264 et aac**. Un build minimal — celui que Playwright
installe, par exemple — fait échouer les transcodages en silence puis planter le script sur une
division par zéro, en laissant des lignes `videos` sans aucun octet sur le disque.

`seed:videos` dépose les vidéos par `replaceUserVideo`, donc par `VideoProvider.store()` : le même
chemin de code que l'upload HTTP. Il ne demande pas ffmpeg, il est rejouable, et il ignore les
profils dont les octets sont déjà présents.

## Tests

```bash
cd backend && bun test
```

Certaines suites parlent à une vraie base. Voir le piège `DATABASE_URL` ci-dessous.

## Tests de charge

Installer k6 une fois (binaire autonome, sans droits root) :

```bash
mkdir -p ~/.local/bin
K6V=$(curl -s https://api.github.com/repos/grafana/k6/releases/latest | grep -oP '"tag_name": "\K[^"]+')
curl -sL "https://github.com/grafana/k6/releases/download/${K6V}/k6-${K6V}-linux-amd64.tar.gz" \
  | tar xz --strip-components=1 -C ~/.local/bin --wildcards '*/k6'
```

Puis, la pile démarrée et la base peuplée :

```bash
./perf/run-all.sh
```

Le script vérifie k6, l'API et le jeu de données avant de commencer, enchaîne les paliers de
charge, échantillonne le CPU des conteneurs, et écrit une synthèse dans
`perf/results/<horodatage>/SYNTHESE.md`.

Tout est paramétrable :

```bash
LEVELS="50 100 200 400" DURATION=2m ./perf/run-all.sh
BASE_URL=http://autre-hote:8081 ./perf/run-all.sh
```

Pour une exécution isolée :

```bash
k6 run -e VUS=200 -e DURATION=2m perf/catalogue-browse.js   # les 3 routes
k6 run -e VUS=200 perf/catalogue-only.js                    # catalogue seul
```

Résultats et analyse dans [../perf/RAPPORT.md](../perf/RAPPORT.md).

> Ces mesures sont prises sur un poste de développement, où k6, le backend et PostgreSQL se
> partagent les mêmes cœurs. Au-delà de quelques centaines de VUs, une part de la latence vient de
> k6 lui-même : les chiffres valent comme comparatif avant/après sur une même machine, pas comme
> capacité de production.

## Éprouver le mode dégradé vidéo

```bash
sed -i 's/^VIDEO_PROVIDER=local$/VIDEO_PROVIDER=fake/' backend/.env
docker compose up -d back-bun
```

Le fournisseur factice simule l'instance ministérielle injoignable. Les fiches profil restent
consultables, avec un message à la place du lecteur, et un dépôt renvoie `503` plutôt qu'une
erreur serveur.

Attention : la résolution d'une vidéo dépend du `provider_name` **de la ligne**, pas de la variable
d'environnement. Celle-ci décide seulement où partent les **nouveaux** dépôts. Pour voir une vidéo
existante basculer en mode dégradé, il faut aussi repointer sa ligne sur `fake`.

---

# Pièges connus

## `DATABASE_URL` pointe sur `db`, injoignable depuis l'hôte

`backend/.env` contient `postgresql://...@db:5432/...`. `db` est le nom du service Docker : il ne
se résout **que** depuis le réseau Docker. Et **Bun charge automatiquement `.env`**, donc tout
script lancé depuis le dépôt hérite de cette valeur et échoue en `ESERVFAIL`.

```bash
DATABASE_URL="postgresql://username:password@localhost:5432/databasename" bun test
```

Le même piège vaut pour `VIDEO_STORAGE_PATH`, qui vaut le chemin **du conteneur**. C'est pourquoi
`migrate:videos` et `seed:videos` redéfinissent eux-mêmes les chemins hôte dans `package.json`.

## `EACCES` au dépôt d'une vidéo

Le stockage est monté depuis l'hôte (`./backend/var/videos`) et le conteneur tourne en `USER bun`,
**UID 1000**. Un bind mount ignore les permissions de l'image : seul l'UID numérique côté hôte
compte.

Deux causes :

1. **Le dossier n'existait pas.** `backend/var/` est gitignoré, donc absent d'un clone neuf. Docker
   crée alors la source du montage **en `root:root`**, et l'UID 1000 ne peut pas y écrire.
2. **L'UID de l'utilisateur hôte n'est pas 1000.** Le dossier est en 775 : ni le groupe ni les
   autres ne correspondent.

```bash
docker compose down
sudo chown -R $(id -u):$(id -g) backend/var
docker compose up -d
```

Si l'UID n'est pas 1000, ajouter `user: "${UID:-1000}:${GID:-1000}"` au service `back-bun` et
lancer avec `UID=$(id -u) GID=$(id -g) docker compose up -d`.

Le correctif définitif est un **volume nommé** à la place du bind mount : le volume hérite du
propriétaire déclaré dans l'image et l'UID hôte n'entre plus en jeu. Contrepartie : les octets ne
sont plus accessibles directement depuis l'hôte.

## Les variables `NEXT_PUBLIC_*` sont figées au build

Modifier `frontend/.env.local` sans reconstruire l'image n'a **aucun effet**, et rien ne le
signale. `docker compose up -d --build front-bun`.

## Le lockfile se dégrade selon la version de Bun

Le Bun de l'hôte peut être plus ancien que celui de l'image. Un `bun install` local réécrit alors
`bun.lock` dans un format antérieur et bouge des versions au passage. Après un `bun install` sur
l'hôte, vérifiez `git diff bun.lock` et restaurez-le s'il a changé sans raison.

## Le client Prisma se régénère à la main

Après toute modification de `schema.prisma` :

```bash
cd backend && bunx prisma generate
```

Sans cela, le typage évoque des modèles ou des champs « inexistants » alors qu'ils sont bien dans
le schéma.

## Une route SSE court-circuite Fastify

Écrire dans `reply.raw` contourne les en-têtes que Fastify aurait posés, **CORS compris** : le
navigateur refuse alors le flux. Il faut reprendre les en-têtes `access-control-*`, appeler
`flushHeaders()`, et émettre un premier octet — Firefox n'expose pas une réponse `chunked` avant
son premier octet de corps, et la connexion resterait en attente jusqu'au heartbeat.

---

# Chantiers ouverts

Points connus, documentés plutôt que passés sous silence.

**La certification n'est pas vérifiable.** Le score du questionnaire est calculé dans le
navigateur et la colonne `certified` n'est alimentée par aucune route. Le badge peut être
obtenu en modifiant son `localStorage`. Il manque une route de soumission corrigeant côté serveur.

**Le catalogue ne pagine pas.** Cf. [../perf/RAPPORT.md](../perf/RAPPORT.md).

**`PROFILE_VIEWED` n'est pas dédoublonné par visite.** Un recruteur qui rafraîchit une fiche
génère une notification à chaque fois.

**Le registre SSE est en mémoire du processus.** Il ne survit pas à une mise à l'échelle
horizontale.

**Le seed principal contourne l'interface vidéo.** `seed.sh` insère les lignes `videos` et copie
les fichiers directement dans le stockage. `seed:videos` corrige ce point pour les vidéos, mais la
partie de `seed.sh` qui les crée reste à retirer.
