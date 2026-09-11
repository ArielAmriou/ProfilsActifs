/*
** EPITECH PROJECT, 2026
** Compétences+
** File description:
** certification.service
*/

import { certificationFileSchema, type CertificationData } from "../lib/certification-schema";

let cachedCertification: CertificationData | null = null;

export async function getCertificationData(): Promise<CertificationData> {
  if (cachedCertification)
    return cachedCertification;

  const file = Bun.file("certification/questions.v1.json");
  const exists = await file.exists();

  if (!exists)
    throw new Error("Fichier de certification introuvable : certification/questions.v1.json");

  const rawData = await file.json();
  cachedCertification = certificationFileSchema.parse(rawData);
  return cachedCertification;
}
