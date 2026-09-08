export const CGU_VERSION = "2026-09-04";
export const CGU_VERSION_LABEL = "4 septembre 2026";

interface CguArticle {
  heading: string;
  paragraphs: string[];
  items?: string[];
}

export const CGU_ARTICLES: CguArticle[] = [
  {
    heading: "Préambule et mentions légales",
    paragraphs: [
      "Les présentes Conditions Générales d'Utilisation encadrent l'accès et l'utilisation de la plateforme web de recrutement vidéo interactive ProfilsActifs. Le service est opéré sous la tutelle du Ministère du Job et du Bonheur.",
      "L'utilisation du Service implique l'acceptation pleine et entière des présentes CGU par l'ensemble des utilisateurs.",
    ],
  },
  {
    heading: "Article 1. Définitions",
    paragraphs: ["Pour l'interprétation des présentes CGU, les termes suivants sont définis ainsi :"],
    items: [
      "Plateforme : le site web et l'application d'itinérance vidéo développés pour le Ministère du Job et du Bonheur.",
      "Candidat : utilisateur inscrit cherchant une opportunité professionnelle et publiant du contenu vidéo ou un profil.",
      "Recruteur : utilisateur professionnel représentant une organisation, autorisé à consulter les profils mis en avant, à interagir avec les candidats et à enregistrer des vidéos en favoris.",
      "Administrateur : profil disposant des droits de modération, de gestion des comptes et de supervision des profils mis en avant.",
      "Profils mis en avant : interface dynamique de défilement vertical continu présentant les séquences vidéo publiées.",
    ],
  },
  {
    heading: "Article 2. Accès au service et création de compte",
    paragraphs: [
      "L'accès à la Plateforme nécessite la création d'un compte selon trois rôles distincts : Candidat, Recruteur et Administrateur.",
      "Le compte Candidat permet de créer un profil personnalisé et de téléverser des vidéos de présentation. Le badge « Talent Certifié » atteste de la complétion du parcours d'évaluation ; il constitue un indicateur d'engagement et ne garantit ni l'identité du candidat ni l'exactitude des compétences déclarées.",
      "L'utilisateur est responsable de la confidentialité de ses identifiants de connexion. Toute action effectuée depuis son compte est réputée avoir été réalisée par lui-même.",
    ],
  },
  {
    heading: "Article 3. Règles d'utilisation des profils mis en avant",
    paragraphs: ["Les vidéos déposées par les Candidats doivent respecter les spécifications suivantes :"],
    items: [
      "Format vertical orienté portrait (ratio 9:16 recommandé).",
      "Durée maximale de 2 minutes par séquence.",
      "Résolution 1080p exigée.",
      "Obligation d'intégrer des sous-titres incrustés.",
      "Contenu exclusivement axé sur la présentation professionnelle ou les compétences.",
    ],
  },
  {
    heading: "Article 4. Modération et conduite des utilisateurs",
    paragraphs: [
      "Toute vidéo déposée est soumise à une modération a priori : elle est placée en attente et n'est rendue visible aux tiers qu'après validation explicite par un Administrateur. Les éléments textuels font l'objet d'une modération a posteriori.",
      "Sont formellement interdits les propos diffamatoires, injurieux, haineux, racistes ou violents, la publication de contenus protégés par le droit d'auteur sans autorisation, les éléments visuels ou sonores inappropriés au cadre professionnel, ainsi que le spam et les liens malveillants.",
      "En cas de manquement, l'Administrateur peut adresser un avertissement, supprimer la vidéo litigieuse ou suspendre le compte de manière temporaire ou définitive.",
    ],
  },
  {
    heading: "Article 5. Propriété intellectuelle et droit à l'image",
    paragraphs: [
      "En téléversant une vidéo, l'utilisateur autorise le Ministère du Job et du Bonheur à reproduire et diffuser son image et sa voix uniquement dans le cadre de la mise en relation professionnelle au sein de la Plateforme.",
      "L'utilisateur conserve la propriété intellectuelle de ses vidéos. Il concède à la Plateforme une licence non exclusive, gratuite et mondiale pour héberger, stocker, afficher et diffuser ce contenu dans le cadre du fonctionnement normal du Service.",
    ],
  },
  {
    heading: "Article 6. Protection des données personnelles (RGPD)",
    paragraphs: [
      "Sont collectés : les nom, prénom, date de naissance, adresse e-mail et image de profil facultative des utilisateurs ; les données techniques de connexion (adresse IP, agent utilisateur, jetons de session) ; les contenus de la plateforme (vidéo de présentation, réponses au questionnaire, statistiques d'interaction).",
      "Chaque utilisateur dispose d'un droit d'accès, de rectification, de suppression et de portabilité de ses données. Pour exercer ces droits, contactez le Délégué à la Protection des Données : dpo@profilsactifs.gouv.fr.",
    ],
  },
  {
    heading: "Article 7. Responsabilité du service",
    paragraphs: [
      "La Plateforme agit en qualité d'hébergeur et d'intermédiaire technique de mise en relation. Elle ne saurait être tenue responsable de l'inexactitude des contenus publiés par les Candidats, des suites données aux prises de contact, ni des interruptions temporaires du service pour maintenance.",
    ],
  },
  {
    heading: "Article 8. Nature du service et droit applicable",
    paragraphs: [
      "ProfilsActifs est un service public numérique édité et opéré par le Ministère du Job et du Bonheur. Les présentes CGU sont régies par le droit français. Tout litige relève, à défaut de résolution amiable, de la compétence exclusive des juridictions françaises.",
    ],
  },
  {
    heading: "Article 9. Accessibilité et hébergement",
    paragraphs: [
      "Le Ministère s'engage à rendre le service accessible conformément à l'article 47 de la loi n° 2005-102, en visant une conformité au Référentiel Général d'Amélioration de l'Accessibilité (RGAA).",
      "Pour garantir la souveraineté numérique, la Plateforme s'affranchit de tout prestataire cloud externe : les données, les vidéos et l'infrastructure sont hébergées exclusivement sur les serveurs internes du Ministère.",
    ],
  },
];
