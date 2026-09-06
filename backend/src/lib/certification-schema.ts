import { z } from "zod";

export const questionSchema = z.object({
  id: z.string().min(1, "L'identifiant de la question est requis"),
  statement: z.string().min(1, "L'énoncé de la question est requis"),
  type: z.enum(["single_choice", "multiple_choice", "text"]),
  options: z.array(z.string()).min(1, "Au moins une option est requise"),
  weight: z.number().positive("La pondération doit être un nombre positif"),
});

export const certificationFileSchema = z.object({
  version: z.string().min(1, "La version du questionnaire est requise"),
  questions: z.array(questionSchema).min(1, "Le questionnaire doit contenir au moins une question"),
});

export type CertificationData = z.infer<typeof certificationFileSchema>;