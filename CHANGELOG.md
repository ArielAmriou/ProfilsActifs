# Journal des modifications

## 2026-09-10 — Renommage : ProfilsActifs devient Compétences+

**Décision** : abandon du nom « ProfilsActifs » au profit de « Compétences+ », arbitrée par le
directeur de cabinet à 15h30 et notifiée par Benjamin Sellami. Motif : le nom est jugé non
récupérable par le service de veille du cabinet.

### Conventions retenues

| Contexte | Forme |
| --- | --- |
| Nom affiché, documentation, contenus | `Compétences+` — accent compris |
| Identifiants techniques : paquets, clés de stockage, noms d'hôte, artefacts | `competences-plus` — ASCII |

**Décision sur l'accent dans les adresses de pages : aucune URL ne portera d'accent.** Le cas ne se
présente pas : aucune route ne contient le nom du produit (`/connexion`, `/profils/[id]`,
`/ma-video`, `/favoris`, `/questionnaire`, `/cgu`, `/notifications`, `/admin/*`). Aucune
redirection n'est donc nécessaire, et la règle est posée pour les routes à venir.

### Ce qui a changé

**Interface** — titre de page et `og:title`, description, en-tête et mot-symbole, écrans de
connexion et d'inscription, page d'erreur globale, invite de connexion, CGU, espace
d'administration, intitulé de navigation.

**Contenus** — texte des CGU et adresse du délégué à la protection des données
(`dpo@competences-plus.gouv.fr`).

**Stockage navigateur** — les clés `profilsactifs-*` deviennent `competences-plus-*`. Les sessions
et interactions enregistrées sous les anciennes clés sont perdues : une reconnexion est nécessaire.

**API** — titre et description OpenAPI exposés sur `/docs`.

**Base de données** — 541 comptes de démonstration migrés du domaine `seed.profilsactifs.test`
vers `seed.competences-plus.test`, dont le compte témoin des tests vidéo.

**Jeu de données** — domaine de génération dans `seed.sh`.

**Documentation** — README racine et par service, documentation technique, guide de développement,
rapport de tests de charge.

**Intégration continue** — nom du workflow et artefact de publication `competences-plus-release`.

### Correction de rendu

Le mot-symbole `Compétences+` débordait de 9 px de son cadre dans la barre latérale, sur toutes les
pages. Mesuré au navigateur, corrigé en réduisant la graisse d'affichage : il tient désormais avec
5 px de marge.

### Occurrences subsistantes, et pourquoi

Relevé brut joint : [docs/renommage/recherche-ancien-nom.txt](docs/renommage/recherche-ancien-nom.txt).

La base de données ne contient **plus aucune occurrence** — 14 colonnes vérifiées, toutes à zéro.

Le dépôt en conserve trois, toutes légitimes :

| Emplacement | Justification |
| --- | --- |
| `perf/RAPPORT.md:54` | Sortie brute de `docker stats` citée dans le rapport. Le nom de conteneur dérive du répertoire du dépôt, que le cabinet a demandé de ne pas renommer. Retoucher une sortie brute la priverait de sa valeur de preuve. |
| `perf/results/03-saturation-before.txt:10` | Sortie brute de k6. La chaîne est le chemin de fichier de la machine de test, pas le nom du produit dans le code. |
| `perf/results/04-saturation-after.txt:10` | Idem, exécution « après » du même comparatif. |

L'historique Git et le présent journal contiennent également l'ancien nom, par nature.

### Hors périmètre

Le logotype n'a pas été refait : le mot-symbole reprend la typographie existante avec le nouveau
nom. Aucun favicon n'existe dans le projet, ni avant ni après ce renommage. Aucun gabarit de mail
transactionnel n'existe non plus : l'authentification n'envoie aucun message. Ces trois points
restent ouverts.
