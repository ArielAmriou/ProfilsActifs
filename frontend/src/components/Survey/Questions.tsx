/*
** EPITECH PROJECT, 2026
** ProfilsActifs
** File description:
** Questions
*/

export type QuestionType = {
  noq: number;
  intitulé: string;
  content: string;
  options: string[];
};

export const questions: QuestionType[] = [
  {
    noq: 1,
    intitulé: 'Quelle est votre principale spécialité ?',
    content: 'Détaillez le domaine dans lequel vous excellez le plus.',
    options: ['Développement Web', 'Design', 'Marketing', 'Data/Autre']
  },
  {
    noq: 2,
    intitulé: 'Combien d\'années d\'expérience globale avez-vous ?',
    content: 'Incluez vos stages et alternances pertinents.',
    options: ['0-1 an', '2-5 ans', '5-10 ans', '+10 ans']
  },
  {
    noq: 3,
    intitulé: 'Quel est votre plus haut niveau de diplôme ?',
    content: 'Sélectionnez le niveau d\'études validé.',
    options: ['Bac+2 / Bac+3', 'Bac+5 (Master/Ingénieur)', 'Doctorat', 'Autodidacte']
  },
  {
    noq: 4,
    intitulé: 'Quel type de structure privilégiez-vous ?',
    content: 'Indiquez l\'environnement d\'entreprise qui vous correspond.',
    options: ['Startup / TPE', 'PME', 'Grand Groupe', 'Agence / ESN']
  },
  {
    noq: 5,
    intitulé: 'Quel statut de travail recherchez-vous actuellement ?',
    content: 'Choisissez votre objectif contractuel.',
    options: ['CDI', 'CDD / Mission temporaire', 'Freelance', 'Stage / Alternance']
  },
  {
    noq: 6,
    intitulé: 'Quel est votre rythme de travail idéal ?',
    content: 'Précisez vos attentes concernant le télétravail.',
    options: ['100% Présentiel', 'Hybride (1-3 jours remote)', '100% Télétravail', 'Flexible selon besoin']
  },
  {
    noq: 7,
    intitulé: 'Avez-vous déjà eu une expérience à l\'international ?',
    content: 'Études, stages ou emplois hors de votre pays d\'origine.',
    options: ['Oui, plus d\'un an', 'Oui, moins d\'un an', 'Non, mais je le souhaite', 'Non, pas d\'intérêt']
  },
  {
    noq: 8,
    intitulé: 'Comment évaluez-vous votre niveau d\'anglais professionnel ?',
    content: 'Capacité à lire, écrire et participer à des réunions.',
    options: ['Bilingue / Courant', 'Intermédiaire avancé (B2/C1)', 'Intermédiaire (B1)', 'Débutant']
  },
  {
    noq: 9,
    intitulé: 'Quelle est votre principale motivation au travail ?',
    content: 'Ce qui vous pousse à vous dépasser au quotidien.',
    options: ['Le salaire et les avantages', 'Les défis techniques', 'L\'impact du projet', 'L\'ambiance d\'équipe']
  },
  {
    noq: 10,
    intitulé: 'Comment préférez-vous être rémunéré ?',
    content: 'Structure de votre rémunération idéale.',
    options: ['Fixe élevé', 'Fixe + variables (primes)', 'Actions / BSPCE', 'Paiement à la mission (Freelance)']
  },
  {
    noq: 11,
    intitulé: 'Côté développement, quelle est votre orientation ?',
    content: 'Si applicable, choisissez votre domaine de prédilection.',
    options: ['Frontend', 'Backend', 'Fullstack', 'Je ne suis pas développeur']
  },
  {
    noq: 12,
    intitulé: 'Quel langage Backend maîtrisez-vous le mieux ?',
    content: 'Celui avec lequel vous êtes le plus à l\'aise en production.',
    options: ['Node.js / TypeScript', 'Python', 'Java / C#', 'PHP / Autre']
  },
  {
    noq: 13,
    intitulé: 'Quel framework Frontend préférez-vous utiliser ?',
    content: 'L\'outil principal pour vos interfaces.',
    options: ['React / Next.js', 'Vue.js / Nuxt', 'Angular', 'Vanilla JS / Autre']
  },
  {
    noq: 14,
    intitulé: 'Comment gérez-vous vos bases de données ?',
    content: 'Le type de base de données que vous utilisez le plus.',
    options: ['Relationnelles (PostgreSQL, MySQL)', 'NoSQL (MongoDB, Firebase)', 'Les deux', 'Je ne gère pas la BDD']
  },
  {
    noq: 15,
    intitulé: 'Quel est votre niveau en intégration / CSS ?',
    content: 'Capacité à créer des interfaces complexes et responsive.',
    options: ['Expert (SASS, Animations)', 'Avancé (Tailwind, Bootstrap)', 'Intermédiaire', 'Bases uniquement']
  },
  {
    noq: 16,
    intitulé: 'Quelle approche adoptez-vous pour le développement mobile ?',
    content: 'Vos outils pour créer des apps.',
    options: ['Natif (Swift, Kotlin)', 'Hybride (React Native, Flutter)', 'PWA / Web Mobile', 'Pas de dev mobile']
  },
  {
    noq: 17,
    intitulé: 'Utilisez-vous des outils de conteneurisation ?',
    content: 'Expérience avec Docker, Kubernetes, etc.',
    options: ['Quotidiennement (Docker, K8s)', 'Occasionnellement', 'Bases théoriques', 'Jamais']
  },
  {
    noq: 18,
    intitulé: 'Quelle est votre expérience avec le Cloud (AWS, GCP, Azure) ?',
    content: 'Capacité à déployer et gérer des infrastructures.',
    options: ['Architecture complète', 'Déploiement simple', 'Utilisation de services tiers', 'Aucune']
  },
  {
    noq: 19,
    intitulé: 'Comment abordez-vous les tests automatisés ?',
    content: 'Votre pratique concernant l\'assurance qualité du code.',
    options: ['TDD / Tests systématiques', 'Tests unitaires fréquents', 'Tests fonctionnels occasionnels', 'Pas de tests']
  },
  {
    noq: 20,
    intitulé: 'Quelle est votre maîtrise de Git ?',
    content: 'Votre aisance avec le versioning.',
    options: ['Expert (Rebase, Hooks, CI)', 'Avancé (Merge, Branching)', 'Basique (Commit, Push, Pull)', 'Jamais utilisé']
  },
  {
    noq: 21,
    intitulé: 'Faites-vous de la revue de code (Code Review) ?',
    content: 'Votre implication dans la qualité du code de l\'équipe.',
    options: ['Oui, j\'en fais et j\'en reçois', 'Surtout j\'en reçois', 'Rarement', 'Jamais']
  },
  {
    noq: 22,
    intitulé: 'Comment gérez-vous la sécurité dans vos projets ?',
    content: 'Votre sensibilité aux failles courantes (OWASP).',
    options: ['Application stricte (OWASP)', 'Vérifications de base', 'Je délègue à un expert', 'Pas une priorité']
  },
  {
    noq: 23,
    intitulé: 'Quel système d\'exploitation utilisez-vous pour travailler ?',
    content: 'Votre environnement de bureau principal.',
    options: ['macOS', 'Linux (Ubuntu, etc.)', 'Windows', 'Double boot (Linux/Win)']
  },
  {
    noq: 24,
    intitulé: 'Avez-vous une expérience avec l\'Intelligence Artificielle ?',
    content: 'Intégration d\'API, prompts ou création de modèles.',
    options: ['Création de modèles (ML)', 'Intégration d\'API (OpenAI, etc.)', 'Utilisation (Copilot, ChatGPT)', 'Aucune']
  },
  {
    noq: 25,
    intitulé: 'Quel est votre niveau en conception d\'architecture logicielle ?',
    content: 'Capacité à concevoir un système de A à Z.',
    options: ['Architecte / Lead', 'Conception de modules', 'Je suis des architectures existantes', 'Débutant']
  },
  {
    noq: 26,
    intitulé: 'Comment optimisez-vous les performances web ?',
    content: 'Techniques pour accélérer le chargement et l\'exécution.',
    options: ['Audit complet (Lighthouse, Memory)', 'Optimisations de base (Images, Caching)', 'Utilisation de CDN uniquement', 'Ce n\'est pas mon rôle']
  },
  {
    noq: 27,
    intitulé: 'Quelle est votre approche vis-à-vis de l\'accessibilité (a11y) ?',
    content: 'Rendre vos produits utilisables par tous.',
    options: ['Normes WCAG respectées', 'Bases (alt, aria-labels)', 'Sensibilisé mais peu de pratique', 'Sujet inconnu']
  },
  {
    noq: 28,
    intitulé: 'Avez-vous des compétences en conception UI/UX ?',
    content: 'Création de maquettes ou parcours utilisateurs.',
    options: ['Expert Figma / UX', 'Bases en design', 'Je donne mon avis', 'Strictement intégrateur/développeur']
  },
  {
    noq: 29,
    intitulé: 'Maîtrisez-vous les méthodologies de CI/CD ?',
    content: 'Intégration et déploiement continus (GitHub Actions, GitLab CI).',
    options: ['Configuration de A à Z', 'Modification de pipelines existants', 'Utilisation transparente', 'Aucune connaissance']
  },
  {
    noq: 30,
    intitulé: 'Quelle est votre approche de la dette technique ?',
    content: 'Comment traitez-vous le code legacy.',
    options: ['Refactoring continu', 'Sprints dédiés au refactoring', 'Quand le temps le permet', 'Je reconstruis tout']
  },
  {
    noq: 31,
    intitulé: 'Quelle méthodologie de travail préférez-vous ?',
    content: 'Cadre de gestion de vos projets.',
    options: ['Scrum', 'Kanban', 'Cycle en V', 'Pas de méthode fixe']
  },
  {
    noq: 32,
    intitulé: 'Quel outil de gestion de tickets utilisez-vous ?',
    content: 'Suivi des tâches et bugs.',
    options: ['Jira', 'Notion / Trello', 'Linear', 'GitHub / GitLab Issues']
  },
  {
    noq: 33,
    intitulé: 'Comment réagissez-vous face à une deadline très courte ?',
    content: 'Votre gestion du stress et des priorités.',
    options: ['Je priorise le MVP (l\'essentiel)', 'Je fais des heures supplémentaires', 'Je négocie le délai', 'Je panique un peu']
  },
  {
    noq: 34,
    intitulé: 'Comment estimez-vous le temps de vos tâches ?',
    content: 'Méthode de chiffrage.',
    options: ['Story points (Poker planning)', 'En jours/heures précis', 'Au feeling', 'Je ne fais pas les estimations']
  },
  {
    noq: 35,
    intitulé: 'Êtes-vous à l\'aise avec la documentation ?',
    content: 'Rédaction technique et fonctionnelle.',
    options: ['Je documente tout (Confluence, Readme)', 'Je fais le minimum syndical', 'Le code est ma documentation', 'Je déteste écrire de la doc']
  },
  {
    noq: 36,
    intitulé: 'Quelle est votre approche face à un bug bloquant en production ?',
    content: 'Gestion d\'incident critique.',
    options: ['Rollback immédiat puis analyse', 'Hotfix direct en prod', 'Analyse locale avec les logs', 'J\'alerte un senior']
  },
  {
    noq: 37,
    intitulé: 'Pratiquez-vous le Pair Programming ?',
    content: 'Coder à deux sur le même poste.',
    options: ['Souvent, c\'est très utile', 'Parfois, pour débloquer', 'Rarement', 'Jamais, je préfère être seul']
  },
  {
    noq: 38,
    intitulé: 'Comment gérez-vous les changements de spécifications en cours de projet ?',
    content: 'Adaptabilité face aux demandes du client.',
    options: ['J\'adapte l\'architecture (Agile)', 'Je demande un avenant au cahier des charges', 'Je fais au mieux avec le temps restant', 'Je m\'y oppose']
  },
  {
    noq: 39,
    intitulé: 'Quel est votre rôle habituel lors des réunions (Daily, Sprint Planning) ?',
    content: 'Votre implication dans les rituels d\'équipe.',
    options: ['Animateur (Scrum Master)', 'Participant actif (propositions)', 'Écoute et reporting bref', 'Je préfère les éviter']
  },
  {
    noq: 40,
    intitulé: 'Comment assurez-vous le suivi de votre temps de travail ?',
    content: 'Time-tracking et facturation.',
    options: ['Outil précis (Toggl, Harvest)', 'Via les tickets Jira', 'Approximation en fin de journée', 'Je ne compte pas mes heures']
  },
  {
    noq: 41,
    intitulé: 'Quelle importance accordez-vous à l\'onboarding d\'un nouveau membre ?',
    content: 'Accueil et formation d\'un nouveau collègue.',
    options: ['Essentiel, j\'aime mentorer', 'Important mais chronophage', 'Utile', 'C\'est le rôle des RH/Manager']
  },
  {
    noq: 42,
    intitulé: 'Avez-vous déjà géré un projet de A à Z (Freelance ou Lead) ?',
    content: 'Expérience en gestion complète.',
    options: ['Oui, plusieurs fois', 'Une seule fois', 'Je gère des parties de projets', 'Non, jamais']
  },
  {
    noq: 43,
    intitulé: 'Que pensez-vous des réunions en visio-conférence ?',
    content: 'Votre avis sur la communication à distance.',
    options: ['Indispensables et efficaces', 'Utiles mais souvent trop longues', 'Je préfère l\'écrit (Slack/Mail)', 'Je préfère le présentiel']
  },
  {
    noq: 44,
    intitulé: 'Comment gérez-vous la dette technique générée par l\'équipe ?',
    content: 'Votre proactivité sur la qualité à long terme.',
    options: ['Je crée des tickets dédiés', 'J\'en parle en rétrospective', 'Je corrige discrètement', 'Je l\'ignore si ça marche']
  },
  {
    noq: 45,
    intitulé: 'Avez-vous l\'habitude de travailler avec des designers / profils UX ?',
    content: 'Collaboration inter-métiers.',
    options: ['Très souvent (intégration fidèle)', 'Occasionnellement', 'Rarement, on utilise des templates', 'Jamais']
  },
  {
    noq: 46,
    intitulé: 'Comment réagissez-vous face à la critique sur votre travail ?',
    content: 'Gestion des retours négatifs ou constructifs.',
    options: ['Je prends du recul et j\'améliore', 'Je me justifie techniquement', 'Ça me touche personnellement', 'Je l\'ignore']
  },
  {
    noq: 47,
    intitulé: 'Êtes-vous plutôt autonome ou demandeur d\'accompagnement ?',
    content: 'Votre besoin de supervision.',
    options: ['100% Autonome', 'Autonome avec des points réguliers', 'Besoin d\'être guidé', 'J\'aime travailler en binôme permanent']
  },
  {
    noq: 48,
    intitulé: 'Comment abordez-vous un problème technique inconnu ?',
    content: 'Votre méthode de résolution de problèmes.',
    options: ['Recherche doc/StackOverflow/IA', 'Je tente des choses empiriquement', 'Je demande tout de suite à un collègue', 'Je bloque']
  },
  {
    noq: 49,
    intitulé: 'Avez-vous de la facilité à communiquer à l\'oral ?',
    content: 'Présentations, pitchs ou démos.',
    options: ['Très à l\'aise (Démos clients)', 'À l\'aise avec mon équipe', 'Timide mais j\'y arrive', 'Je fuis les prises de parole']
  },
  {
    noq: 50,
    intitulé: 'Comment gérez-vous un désaccord avec un collègue ?',
    content: 'Résolution de conflit.',
    options: ['Discussion directe et argumentée', 'Je fais des concessions', 'Je laisse le manager trancher', 'J\'évite le conflit']
  },
  {
    noq: 51,
    intitulé: 'Êtes-vous force de proposition ?',
    content: 'Votre proactivité dans l\'entreprise.',
    options: ['Souvent (nouvelles technos, process)', 'Parfois, si le sujet me passionne', 'Seulement si on me le demande', 'Je me contente de mes tâches']
  },
  {
    noq: 52,
    intitulé: 'Quelle est votre capacité de concentration (Deep Work) ?',
    content: 'Focalisation sur une tâche complexe.',
    options: ['Excellente, je peux m\'isoler des heures', 'Bonne, avec la méthode Pomodoro', 'Intermédiaire, souvent interrompu', 'J\'ai du mal à rester concentré']
  },
  {
    noq: 53,
    intitulé: 'Comment transmettez-vous votre savoir ?',
    content: 'Partage de connaissances.',
    options: ['Ateliers, talks ou présentations', 'Mentorat 1-to-1', 'Documentation écrite', 'Je garde mes connaissances']
  },
  {
    noq: 54,
    intitulé: 'Êtes-vous sensible à l\'impact écologique du numérique ?',
    content: 'Éco-conception et Green IT.',
    options: ['Très sensible (Optimisation, sobriété)', 'J\'y fais attention de temps en temps', 'C\'est une notion que je découvre', 'Pas du tout']
  },
  {
    noq: 55,
    intitulé: 'Comment décririez-vous votre esprit d\'analyse ?',
    content: 'Capacité à décortiquer un système complexe.',
    options: ['Excellent (Vision globale et détail)', 'Bon (Je repère les failles)', 'Moyen', 'Je préfère suivre des plans détaillés']
  },
  {
    noq: 56,
    intitulé: 'Êtes-vous plutôt créatif ou rigoureux ?',
    content: 'Votre trait de caractère dominant au travail.',
    options: ['Très créatif (Out of the box)', 'Très rigoureux (Méthodique, précis)', 'Un bon équilibre des deux', 'Ça dépend du projet']
  },
  {
    noq: 57,
    intitulé: 'Comment gérez-vous les tâches répétitives ou ennuyeuses ?',
    content: 'Votre tolérance aux missions moins valorisantes.',
    options: ['Je crée des scripts pour les automatiser', 'Je les fais rapidement pour m\'en débarrasser', 'Je les délègue si possible', 'Je procrastine']
  },
  {
    noq: 58,
    intitulé: 'Avez-vous le sens du détail ?',
    content: 'Pixel perfect, gestion des edge-cases, etc.',
    options: ['Perfectionniste', 'Soucieux de la qualité globale', 'Je me concentre sur la fonctionnalité', 'Fait vaut mieux que parfait']
  },
  {
    noq: 59,
    intitulé: 'Quel est votre rapport avec la clientèle/les utilisateurs ?',
    content: 'Interactions avec le client final.',
    options: ['J\'adore échanger et comprendre leurs besoins', 'Je le fais si nécessaire', 'Je préfère qu\'un PO s\'en charge', 'Je refuse le contact client']
  },
  {
    noq: 60,
    intitulé: 'Comment réagissez-vous face à l\'échec d\'un projet ?',
    content: 'Gestion de la frustration.',
    options: ['J\'en tire des leçons (Post-mortem)', 'Je passe vite à autre chose', 'Ça me démotive longtemps', 'Ce n\'est jamais de ma faute']
  },
  {
    noq: 61,
    intitulé: 'Êtes-vous organisé dans votre espace de travail physique/numérique ?',
    content: 'Rangement, dossiers, bureau.',
    options: ['Très organisé (Zéro inbox, dossiers classés)', 'Organisé à ma façon', 'Bordélique mais je m\'y retrouve', 'Totalement chaotique']
  },
  {
    noq: 62,
    intitulé: 'Quelle est votre approche de la diversité en entreprise ?',
    content: 'Inclusion sociale et culturelle.',
    options: ['Je m\'implique activement pour l\'inclusion', 'C\'est un gros plus pour l\'équipe', 'Je suis neutre', 'Peu importe, seul le code compte']
  },
  {
    noq: 63,
    intitulé: 'Aimez-vous le travail en équipe ?',
    content: 'Votre préférence sociale.',
    options: ['C\'est fondamental pour moi', 'J\'aime bien, mais avec de l\'indépendance', 'Indifférent', 'Je suis un loup solitaire']
  },
  {
    noq: 64,
    intitulé: 'Quelle est votre attitude face à la hiérarchie ?',
    content: 'Rapport à l\'autorité.',
    options: ['Respectueux mais je débats si besoin', 'Exécutant fidèle', 'J\'aime un management horizontal/plat', 'J\'ai du mal avec l\'autorité']
  },
  {
    noq: 65,
    intitulé: 'Êtes-vous ponctuel ?',
    content: 'Respect des horaires et des réunions.',
    options: ['Toujours en avance', 'À l\'heure exacte', 'Souvent quelques minutes de retard', 'Horaires totalement flexibles']
  },
  {
    noq: 66,
    intitulé: 'Faites-vous de la veille technologique ?',
    content: 'Suivi des nouveautés de votre secteur.',
    options: ['Tous les jours', 'Quelques heures par semaine', 'Une fois par mois', 'Seulement quand j\'en ai besoin']
  },
  {
    noq: 67,
    intitulé: 'Quelles sources utilisez-vous pour votre veille ?',
    content: 'Médias favoris pour apprendre.',
    options: ['Newsletters, Blogs (Medium, Dev.to)', 'Vidéos (YouTube, Twitch)', 'Réseaux sociaux (Twitter, LinkedIn)', 'Podcasts']
  },
  {
    noq: 68,
    intitulé: 'Avez-vous des projets personnels (Side Projects) ?',
    content: 'Réalisations hors temps de travail.',
    options: ['Plusieurs projets actifs / Open Source', 'Un projet de temps en temps', 'Surtout des tests/POC', 'Je ne code pas en dehors du travail']
  },
  {
    noq: 69,
    intitulé: 'Contribuez-vous à l\'Open Source ?',
    content: 'Partage de code public.',
    options: ['Créateur de librairies / Maintainer', 'Contributeur régulier (PR, Issues)', 'Je fork et modifie pour moi', 'Je consomme seulement']
  },
  {
    noq: 70,
    intitulé: 'Comment apprenez-vous un nouveau langage ou outil ?',
    content: 'Méthodologie d\'apprentissage.',
    options: ['Je lis la documentation officielle', 'Je suis un tutoriel / cours vidéo', 'Je démarre un projet crash-test', 'Je demande à l\'IA']
  },
  {
    noq: 71,
    intitulé: 'Quel éditeur de code / IDE utilisez-vous principalement ?',
    content: 'Votre outil quotidien.',
    options: ['VS Code', 'JetBrains (IntelliJ, WebStorm, etc.)', 'Vim / Neovim', 'Autre']
  },
  {
    noq: 72,
    intitulé: 'Utilisez-vous des assistants IA pour coder ?',
    content: 'Intégration de l\'IA dans le dev.',
    options: ['Quotidiennement (GitHub Copilot, Cursor)', 'Pour des tâches précises (ChatGPT)', 'Rarement', 'Je suis contre / Je n\'en ressens pas le besoin']
  },
  {
    noq: 73,
    intitulé: 'Êtes-vous certifié sur certaines technologies ?',
    content: 'Diplômes professionnels spécifiques (AWS, Scrum, etc.).',
    options: ['Oui, plusieurs certifications à jour', 'Une ou deux', 'Non, mais je le prévois', 'Non, ça ne m\'intéresse pas']
  },
  {
    noq: 74,
    intitulé: 'Participez-vous à des événements tech ?',
    content: 'Meetups, conférences, hackathons.',
    options: ['Régulièrement (Speaker ou participant)', 'Occasionnellement', 'Je regarde les replays en ligne', 'Jamais']
  },
  {
    noq: 75,
    intitulé: 'Quel est votre rapport aux algorithmes classiques (LeetCode, etc.) ?',
    content: 'Exercices d\'algorithmie pure.',
    options: ['Je m\'entraîne souvent (compétition)', 'J\'ai un bon niveau scolaire', 'J\'ai oublié mais je peux m\'y remettre', 'Ce n\'est pas utile pour mon travail']
  },
  {
    noq: 76,
    intitulé: 'Préférez-vous la spécialisation ou la polyvalence ?',
    content: 'Votre profil type.',
    options: ['Hyper-spécialiste (Expert d\'une techno)', 'Profil en T (Expertise + bases larges)', 'Fullstack / Touche-à-tout', 'Généraliste (Management, Produit)']
  },
  {
    noq: 77,
    intitulé: 'Comment gérez-vous vos environnements de développement ?',
    content: 'Setup local.',
    options: ['Docker / Conteneurs systématisés', 'Environnements virtuels locaux (venv, nvm)', 'Installation directe sur l\'OS', 'Machines distantes (Cloud dev)']
  },
  {
    noq: 78,
    intitulé: 'Êtes-vous à l\'aise avec la ligne de commande (CLI) ?',
    content: 'Utilisation du terminal.',
    options: ['Expert (Bash/Zsh scripts complexes)', 'Courant (Git, npm, ssh)', 'Basique (Commandes simples)', 'Je préfère les interfaces graphiques (GUI)']
  },
  {
    noq: 79,
    intitulé: 'Quel est votre niveau en administration système / DevOps ?',
    content: 'Gestion des serveurs.',
    options: ['Je gère la prod sans souci', 'Je sais configurer un serveur Linux de base', 'Je connais la théorie', 'Je délègue à 100%']
  },
  {
    noq: 80,
    intitulé: 'Avez-vous déjà mentorié un développeur junior ?',
    content: 'Accompagnement pédagogique.',
    options: ['Oui, j\'ai été tuteur/mentor officiel', 'Oui, informellement', 'Non, mais j\'aimerais bien', 'Non, je n\'ai pas la fibre']
  },
  {
    noq: 81,
    intitulé: 'Quelle est votre ambition à moyen terme (3-5 ans) ?',
    content: 'Évolution de carrière souhaitée.',
    options: ['Devenir Lead/Architecte technique', 'Passer Manager/Directeur', 'Lancer ma propre entreprise', 'Gagner en expertise sans changer de rôle']
  },
  {
    noq: 82,
    intitulé: 'Seriez-vous intéressé par un rôle de Lead Tech ?',
    content: 'Prendre la responsabilité technique d\'une équipe.',
    options: ['C\'est mon objectif principal', 'Oui, si l\'équipe est à taille humaine', 'Je le suis déjà', 'Non, je veux juste coder']
  },
  {
    noq: 83,
    intitulé: 'Seriez-vous intéressé par un rôle de Management (People Manager) ?',
    content: 'Gestion humaine, entretiens, carrières.',
    options: ['Oui, j\'aime gérer l\'humain', 'Pourquoi pas plus tard', 'Non, je veux rester dans la technique', 'Je fuis ce type de poste']
  },
  {
    noq: 84,
    intitulé: 'Êtes-vous ouvert à une reconversion ou à changer de stack ?',
    content: 'Apprendre un nouveau métier ou langage métier.',
    options: ['Totalement, j\'adore la nouveauté', 'Oui, si le projet est motivant', 'Non, je veux consolider ma stack actuelle', 'Seulement si j\'y suis contraint']
  },
  {
    noq: 85,
    intitulé: 'Quelle est votre tranche de salaire cible (Brut annuel) ?',
    content: 'Fourchette de rémunération souhaitée.',
    options: ['Moins de 40k€', '40k€ - 60k€', '60k€ - 80k€', '+80k€']
  },
  {
    noq: 86,
    intitulé: 'Qu\'est-ce qui pourrait vous faire quitter une entreprise ?',
    content: 'Le principal motif de démission pour vous.',
    options: ['Management toxique ou micro-management', 'Stagnation technique', 'Salaire insuffisant', 'Manque de sens ou de vision']
  },
  {
    noq: 87,
    intitulé: 'Qu\'attendez-vous de votre futur manager ?',
    content: 'Style de leadership préféré.',
    options: ['Qu\'il soit un mentor technique', 'Qu\'il me laisse 100% autonome', 'Qu\'il donne du feedback constructif régulier', 'Qu\'il me protège des pressions externes']
  },
  {
    noq: 88,
    intitulé: 'Seriez-vous prêt à faire des astreintes (on-call) ?',
    content: 'Disponibilité soir et week-end en cas de panne.',
    options: ['Oui, si c\'est bien rémunéré', 'Seulement exceptionnellement', 'Je le fais déjà', 'Hors de question']
  },
  {
    noq: 89,
    intitulé: 'Accepteriez-vous des déplacements professionnels fréquents ?',
    content: 'Voyages pour voir des clients ou des équipes.',
    options: ['Oui, j\'adore bouger', 'Jusqu\'à 1 fois par mois max', 'Seulement pour les gros events', 'Non, je veux être sédentaire']
  },
  {
    noq: 90,
    intitulé: 'Que pensez-vous du modèle Freelance ?',
    content: 'Indépendance vs Salariat.',
    options: ['C\'est mon statut actuel ou futur proche', 'Ça m\'attire pour l\'argent/liberté', 'Trop d\'incertitude et de charge mentale', 'Je préfère la sécurité du salariat']
  },
  {
    noq: 91,
    intitulé: 'Quelle importance a le secteur d\'activité de l\'entreprise ?',
    content: 'Finance, Santé, E-commerce, Écologie, etc.',
    options: ['Primordiale, je veux un secteur éthique/utile', 'Importante, ça doit m\'intéresser', 'Peu importe si la tech est cool', 'Je vais là où on paie le mieux']
  },
  {
    noq: 92,
    intitulé: 'Participez-vous à la vie de l\'entreprise hors travail ?',
    content: 'Afterworks, séminaires, team building.',
    options: ['Je suis toujours présent', 'Je viens de temps en temps', 'Rarement', 'Mon travail s\'arrête à la fin de la journée']
  },
  {
    noq: 93,
    intitulé: 'Comment gérez-vous l\'équilibre vie pro / vie perso ?',
    content: 'Frontière entre le travail et la maison.',
    options: ['Frontière stricte (Pas de mails le soir)', 'Flexible selon les pics d\'activité', 'Je suis un bourreau de travail (Workaholic)', 'J\'intègre les deux (Work-life integration)']
  },
  {
    noq: 94,
    intitulé: 'Comment jugez-vous le succès d\'un projet ?',
    content: 'Votre métrique de réussite.',
    options: ['Code propre et maintenable', 'Client/Utilisateurs satisfaits', 'Délais et budget respectés', 'Impact généré (CA, traffic)']
  },
  {
    noq: 95,
    intitulé: 'Quel type de produit vous passionne le plus ?',
    content: 'Nature du développement.',
    options: ['SaaS B2B complexe', 'Application grand public (B2C)', 'Outils internes / Infrastructure', 'Jeux vidéo / Divertissement']
  },
  {
    noq: 96,
    intitulé: 'Comment souhaitez-vous passer vos 90 premiers jours dans une nouvelle entreprise ?',
    content: 'L\'onboarding idéal.',
    options: ['Formation intensive et pair-programming', 'Découverte des projets et premières petites PR', 'Autonomie rapide, je fouille moi-même', 'Observation et rencontres avec l\'équipe']
  },
  {
    noq: 97,
    intitulé: 'Avez-vous le syndrome de l\'imposteur ?',
    content: 'Sentiment de ne pas être à la hauteur.',
    options: ['Très souvent, ça me freine', 'Parfois, quand je change de techno', 'Rarement, je connais ma valeur', 'Jamais']
  },
  {
    noq: 98,
    intitulé: 'Quelle place accordez-vous à l\'éthique dans la Tech ?',
    content: 'RGPD, utilisation des données, algorithmes biaisés.',
    options: ['C\'est au cœur de mes décisions', 'J\'applique les lois en vigueur', 'C\'est l\'affaire de l\'entreprise, pas la mienne', 'Je ne me pose pas la question']
  },
  {
    noq: 99,
    intitulé: 'Que lisez-vous principalement sur Internet ?',
    content: 'Consommation de contenu digital.',
    options: ['Articles techniques pointus', 'Tendances globales (Tech, Startups, IA)', 'Jeux vidéo, culture pop, mangas', 'Actualités générales / Politiques']
  },
  {
    noq: 100,
    intitulé: 'Enfin, comment vous décririez-vous en un mot ?',
    content: 'Votre trait de caractère principal.',
    options: ['Passionné', 'Pragmatique', 'Curieux', 'Résilient']
  }
];
