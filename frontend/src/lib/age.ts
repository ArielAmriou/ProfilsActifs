/** Âge minimum légal pour s'inscrire / travailler sur la plateforme. */
export const MIN_WORK_AGE = 16;

export const UNDERAGE_MESSAGE =
  "Vous n'avez pas l'âge légal pour travailler. L'inscription est réservée aux personnes de 16 ans et plus.";

/** Parse une date YYYY-MM-DD en Date locale (midi pour éviter les décalages UTC). */
export function parseIsoDateLocal(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

export function ageFromBirthdate(birthdate: Date, now = new Date()): number {
  let age = now.getFullYear() - birthdate.getFullYear();
  const monthDiff = now.getMonth() - birthdate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthdate.getDate())) {
    age -= 1;
  }
  return age;
}

export function isOfLegalWorkAge(birthdate: Date, now = new Date()): boolean {
  return ageFromBirthdate(birthdate, now) >= MIN_WORK_AGE;
}
