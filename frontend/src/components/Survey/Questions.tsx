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
    intitulé: "Quelle est votre principale compétence ?",
    content: "Détaillez le domaine dans lequel vous excellez le plus.",
    options: ["Développement Web", "Design", "Marketing", "Autre"],
  },
  {
    noq: 2,
    intitulé: "Combien d'années d'expérience avez-vous ?",
    content: "Incluez vos stages et alternances.",
    options: ["0-1 an", "2-5 ans", "5-10 ans", "+10 ans"],
  },
  {
    noq: 3,
    intitulé: "Combien d'années d'expérience avez-vous ?",
    content: "Incluez vos stages et alternances.",
    options: ["0-1 an", "2-5 ans", "5-10 ans", "+10 ans"],
  },
  {
    noq: 4,
    intitulé: "Combien d'années d'expérience avez-vous ?",
    content: "Incluez vos stages et alternances.",
    options: ["0-1 an", "2-5 ans", "5-10 ans", "+10 ans"],
  },
  {
    noq: 5,
    intitulé: "Combien d'années d'expérience avez-vous ?",
    content: "Incluez vos stages et alternances.",
    options: ["0-1 an", "2-5 ans", "5-10 ans", "+10 ans"],
  },
];