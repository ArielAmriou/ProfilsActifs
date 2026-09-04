import { EXAMPLE_VIDEO_URL } from "@/data/media";

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
  title: string;
  sector: string;
  location: string;
  skills: string;
  videoLink: string;
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
  title: "",
  sector: "",
  location: "",
  skills: "",
  videoLink: EXAMPLE_VIDEO_URL,
  likes: 0,
  favorites: 0,
  certified: false,
};

export function getHomeForRole(role: UserRole): string {
  return role === "recruiter" ? "/" : "/profil";
}
