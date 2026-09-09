
/** Aligné sur l'enum Prisma `UserRole` (hors `admin`, non exposé dans l'UI). */
export type UserRole = "recruiter" | "jobseeker";

export function isUserRole(value: string | null | undefined): value is UserRole {
  return value === "recruiter" || value === "jobseeker";
}

/**
 * Profil demandeur d'emploi côté UI.
 * Champs identité alignés sur le modèle back `Users` :
 * - firstname (prénom)
 * - lastname (nom)
 * - name (username / nom affiché better-auth)
 */
export interface JobseekerProfile {
  firstname: string;
  lastname: string;
  /** Username / display name (champ `name` better-auth / Prisma). */
  name: string;
  /** Date de naissance au format YYYY-MM-DD (input type="date"). */
  birthdate: string;
  title: string;
  sector: string;
  location: string;
  availability: string;
  skills: string;
  likes: number;
  favorites: number;
  certified?: boolean;
}

export const AUTH_KEY = "profilsactifs-auth";
export const ROLE_KEY = "profilsactifs-role";
export const EMAIL_KEY = "profilsactifs-email";
export const JOBSEEKER_PROFILE_KEY = "profilsactifs-jobseeker-profile";

export const DEFAULT_JOBSEEKER_PROFILE: JobseekerProfile = {
  firstname: "",
  lastname: "",
  name: "",
  birthdate: "",
  title: "",
  sector: "",
  location: "",
  availability: "",
  skills: "",
  likes: 0,
  favorites: 0,
  certified: false,
};

/** Convertit une date API (ISO) vers YYYY-MM-DD pour les inputs date. */
export function toDateInputValue(value: string | Date | null | undefined): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function getHomeForRole(role: UserRole): string {
  return role === "recruiter" ? "/" : "/profil";
}

export function splitSkills(skills: string): string[] {
  return skills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

export function joinSkills(skills: string[]): string {
  return skills.join(", ");
}
