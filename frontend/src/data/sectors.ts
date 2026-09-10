/** Secteurs proposés à la sélection (profil candidat). */
export const PROFILE_SECTORS = [
  "Agriculture / Agroalimentaire",
  "Artisanat",
  "BTP",
  "Commerce / Distribution",
  "Hôtellerie / Restauration",
  "Industrie",
  "Logistique / Transport",
  "Numérique",
  "Santé",
  "Services",
  "Social / Médico-social",
  "Autre",
] as const;

export type ProfileSector = (typeof PROFILE_SECTORS)[number];

export function isProfileSector(value: string): value is ProfileSector {
  return (PROFILE_SECTORS as readonly string[]).includes(value);
}
