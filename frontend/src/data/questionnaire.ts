export interface QcmQuestion {
  id: number;
  text: string;
  options: string[];
}

const THEMES = [
  {
    text: "Quel est votre niveau d'expérience dans votre domaine ?",
    options: [
      "Débutant (moins de 1 an)",
      "Intermédiaire (1 à 3 ans)",
      "Confirmé (3 à 7 ans)",
      "Expert (plus de 7 ans)",
    ],
  },
  {
    text: "Quelle est votre disponibilité pour commencer un poste ?",
    options: [
      "Immédiate",
      "Sous 1 mois",
      "Sous 3 mois",
      "À convenir",
    ],
  },
  {
    text: "Quel type de contrat recherchez-vous en priorité ?",
    options: ["CDI", "CDD", "Intérim", "Alternance / Stage"],
  },
  {
    text: "Quelle est votre mobilité géographique ?",
    options: [
      "Locale uniquement",
      "Régionale",
      "Nationale",
      "Internationale",
    ],
  },
  {
    text: "Comment évaluez-vous votre aisance relationnelle en équipe ?",
    options: ["Faible", "Moyenne", "Bonne", "Excellente"],
  },
];

export const TOTAL_QUESTIONS = 100;
export const VISIBLE_MOCK_COUNT = 5;

export function buildMockQcmQuestions(count: number): QcmQuestion[] {
  return Array.from({ length: count }, (_, index) => {
    const template = THEMES[index % THEMES.length]!;
    return {
      id: index + 1,
      text: `Question ${index + 1} — ${template.text}`,
      options: template.options,
    };
  });
}
