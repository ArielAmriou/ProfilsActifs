/** Âge minimum légal pour s'inscrire / travailler sur la plateforme. */
export const MIN_WORK_AGE = 16;

export const UNDERAGE_MESSAGE =
  "Vous n'avez pas l'âge légal pour travailler. L'inscription est réservée aux personnes de 16 ans et plus.";

/** Calcule l'âge révolu à la date `now` (défaut : aujourd'hui). */
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
