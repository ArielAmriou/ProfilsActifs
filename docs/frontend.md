# Frontend

Next.js 16 en App Router, React 19, Tailwind CSS 4. Toutes les pages sont des composants clients :
l'état d'authentification vit dans le navigateur et conditionne l'affichage.

## Pages

| Route | Accès | Rôle |
| --- | --- | --- |
| `/` | Public sauf candidats | Catalogue de profils paginé |
| `/profils/[id]` | Public sauf candidats | Fiche détaillée avec lecteur vidéo |
| `/connexion` | Public | Connexion et inscription |
| `/cgu` | Public | Conditions Générales d'Utilisation |
| `/profil` | Candidat | Édition du profil, consentement CGU |
| `/ma-video` | Candidat | Dépôt et suppression de sa vidéo |
| `/questionnaire` | Candidat | Questionnaire de certification |
| `/favoris` | Recruteur | Profils mis en favori |
| `/notifications` | Authentifié | Boîte de notifications |
| `/admin`, `/admin/utilisateurs`, `/admin/videos`, `/admin/parametres` | Admin | Espace d'administration |

`error.tsx`, `global-error.tsx` et `not-found.tsx` couvrent les cas d'échec.

## Contrôle d'accès

Deux composants, dans [RequireRole.tsx](../frontend/src/components/RequireRole.tsx) :

- `<RequireRole allowed={["jobseeker"]}>` — n'affiche le contenu qu'aux rôles listés
- `<BlockRole blocked="jobseeker">` — affiche à tout le monde sauf au rôle indiqué

Ce contrôle est **une commodité d'affichage, pas une sécurité**. L'autorisation réelle est
appliquée par l'API, qui renvoie 401 ou 403 indépendamment de ce que le navigateur décide de
montrer.

## État global

### `AuthContext`

Source de vérité de la session. Expose `isAuthenticated`, `isLoading`, `role`, `email`, `userId`,
`jobseekerProfile`, ainsi que `login`, `register`, `logout` et `updateJobseekerProfile`.

À la connexion, le profil candidat est chargé depuis `GET /api/me/profile`. `updateJobseekerProfile`
met à jour l'état local **et** envoie un `PATCH` à l'API. Le `localStorage` ne sert plus que de
cache d'affichage : la base fait autorité.

`isLoading` mérite attention : tant qu'il est vrai, le rôle n'est pas connu. Les gardes affichent
un état de chargement plutôt que de rediriger, sinon un rafraîchissement de page éjecterait
l'utilisateur avant que sa session ne soit résolue.

### `NotificationsContext`

Expose `notifications`, `unreadCount`, `loading`, `error`, `refresh`, `deleteNotification` et
`markAllReadOnLeave`. Alimenté par `useNotifications`, qui ouvre le flux SSE et fusionne les
événements reçus avec la liste déjà chargée.

## Clients d'API

Tout passe par `apiFetch` ([lib/api.ts](../frontend/src/lib/api.ts)), qui pose
`credentials: "include"`, sérialise le corps, et lève une `ApiError` portant le statut et le corps
de réponse.

| Module | Couvre |
| --- | --- |
| `auth-api.ts` | Connexion, inscription, déconnexion, session courante |
| `profiles-api.ts` | Catalogue, fiche, profil éditable, consentement CGU |
| `videos.ts` | Descripteurs, dépôt, suppression |
| `favorites-api.ts` | Favoris recruteur |
| `notifications-api.ts` | Liste, compteur, lecture, suppression |
| `admin-api.ts` | Espace d'administration |
| `certification-api.ts` | Questions du questionnaire |

**Une exception à connaître** : le flux SSE n'utilise pas `apiFetch`. `fetch` attend la fin de la
réponse, or ce flux ne se termine jamais. Il faut `EventSource` avec `withCredentials: true`.

`profiles-api.ts` remplit les champs nullables de l'API par un libellé de repli plutôt que de
laisser passer `null` dans l'interface — un profil neuf n'a ni titre ni secteur.

## Composants notables

| Composant | Rôle |
| --- | --- |
| `ProfileCatalog` | Catalogue, pagination client à 20 profils par page |
| `ProfileCard` | Carte de profil avec lecteur intégré |
| `VideoPlayer` | Lecteur, ou message explicite si la vidéo n'est pas lisible |
| `VideoUnavailable` | Message de mode dégradé selon le statut |
| `CguConsent` | Date d'acceptation et bouton de révocation |
| `Survey` | Questionnaire de certification |
| `CatalogFilters` | Filtres du catalogue |
| `PostalCodeAutocomplete` | Saisie de localisation |

### Le mode dégradé vidéo

`VideoPlayer` n'affiche un lecteur que si le descripteur est `READY` **et** porte une
`playbackUrl`. Dans tous les autres cas il rend `VideoUnavailable`, qui distingue trois messages :
vidéo en cours de traitement, hébergeur indisponible, aucune vidéo déposée.

C'est la contrepartie visible du contrat backend : une vidéo illisible ne doit jamais produire une
page blanche ni une erreur, seulement un message à la place du lecteur, le reste du profil restant
consultable.

## Pagination : une inefficacité connue

`ProfileCatalog` affiche 20 profils par page mais **télécharge les 504** à chaque chargement :
`GET /api/profiles` ne pagine pas. Le catalogue est mémorisé côté serveur pour limiter les dégâts,
mais le correctif réel est une pagination serveur, qui imposera de reprendre `ProfileCatalog` et
`lib/favorites.ts`. Voir [../perf/RAPPORT.md](../perf/RAPPORT.md).

## Variables d'environnement

`NEXT_PUBLIC_API_URL` — adresse de l'API, `http://localhost:8081` par défaut.

Ces variables sont **figées au moment du build**. Modifier `.env.local` impose de reconstruire
l'image (`docker compose up -d --build front-bun`) ; un redémarrage ne suffit pas.

> `.env.local` contient encore `NEXT_PUBLIC_DEMO_VIDEO_OWNER`, qui n'est plus lu par aucun code
> depuis que le catalogue est alimenté par la base. Cette ligne peut être supprimée.
