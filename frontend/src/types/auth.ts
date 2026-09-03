import { EXAMPLE_VIDEO_URL } from "@/data/media";

export type UserRole = "recruteur" | "demandeur";

export interface DemandeurProfile {
  name: string;
  title: string;
  sector: string;
  location: string;
  skills: string;
  videoUrl: string;
  likes: number;
  favorites: number;
}

export const AUTH_KEY = "profilsactifs-auth";
export const ROLE_KEY = "profilsactifs-role";
export const EMAIL_KEY = "profilsactifs-email";
export const DEMANDEUR_PROFILE_KEY = "profilsactifs-demandeur-profile";

export const DEFAULT_DEMANDEUR_PROFILE: DemandeurProfile = {
  name: "",
  title: "",
  sector: "",
  location: "",
  skills: "",
  videoUrl: EXAMPLE_VIDEO_URL,
  likes: 0,
  favorites: 0,
};

export function getHomeForRole(role: UserRole): string {
  return role === "recruteur" ? "/" : "/profil";
}
