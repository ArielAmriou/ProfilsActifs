import { apiFetch, ApiError } from "@/lib/api";
import { NO_VIDEO, type VideoDescriptor } from "@/lib/videos";

export interface Profile {
  id: string;
  name: string;
  title: string;
  sector: string;
  location: string;
  availability: string | null;
  skills: string[];
  certified: boolean;
  likes: number;
  updatedAt: string;
  videoId: string | null;
  video: VideoDescriptor;
  subtitlesUrl?: string;
}

interface ApiProfile {
  id: string;
  name: string;
  firstname: string;
  lastname: string;
  title: string | null;
  sector: string | null;
  location: string | null;
  availability: string | null;
  skills: string[];
  certified: boolean;
  favorites: number;
  updatedAt: string;
  videoId: string | null;
  video: VideoDescriptor;
}

const UNKNOWN = "Non renseigné";

function displayName(profile: ApiProfile): string {
  const full = `${profile.firstname} ${profile.lastname}`.trim();
  return full || profile.name;
}

function toProfile(profile: ApiProfile): Profile {
  return {
    id: profile.id,
    name: displayName(profile),
    title: profile.title ?? UNKNOWN,
    sector: profile.sector ?? UNKNOWN,
    location: profile.location ?? UNKNOWN,
    availability: profile.availability ?? null,
    skills: profile.skills,
    certified: profile.certified,
    likes: profile.favorites,
    updatedAt: profile.updatedAt ?? new Date(0).toISOString(),
    videoId: profile.videoId ?? null,
    video: profile.video ?? NO_VIDEO,
  };
}

export async function fetchProfiles(): Promise<Profile[]> {
  try {
    const data = await apiFetch<{ profiles: ApiProfile[] }>("/api/profiles");
    return data.profiles.map(toProfile);
  } catch {
    return [];
  }
}

export async function fetchProfile(id: string): Promise<Profile | null> {
  try {
    return toProfile(await apiFetch<ApiProfile>(`/api/profiles/${id}`));
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    return null;
  }
}

/** Distingue un profil caché d'un profil vraiment introuvable. */
export async function fetchProfileAccess(
  id: string,
): Promise<"ok" | "hidden" | "missing"> {
  try {
    await apiFetch<ApiProfile>(`/api/profiles/${id}`);
    return "ok";
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      const body = error.body;
      if (
        body &&
        typeof body === "object" &&
        (body as { code?: string }).code === "PROFILE_HIDDEN"
      ) {
        return "hidden";
      }
      const message = error.message.toLowerCase();
      if (message.includes("indisponible")) {
        return "hidden";
      }
      return "missing";
    }
    return "missing";
  }
}

export interface MyProfile {
  id: string;
  email: string;
  role: string;
  firstname: string;
  lastname: string;
  name: string;
  birthdate: string;
  title: string | null;
  sector: string | null;
  location: string | null;
  availability: string | null;
  skills: string[];
  certified: boolean;
  profileHidden: boolean;
  favorites: number;
  cguAcceptedAt: string | null;
  cguVersion: string | null;
}

export interface MyProfilePatch {
  firstname?: string;
  lastname?: string;
  name?: string;
  birthdate?: string;
  title?: string | null;
  sector?: string | null;
  location?: string | null;
  availability?: string | null;
  skills?: string[];
  profileHidden?: boolean;
}

export async function fetchMyProfile(): Promise<MyProfile | null> {
  try {
    return await apiFetch<MyProfile>("/api/me/profile");
  } catch {
    return null;
  }
}

export function updateMyProfile(patch: MyProfilePatch): Promise<MyProfile> {
  return apiFetch<MyProfile>("/api/me/profile", {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export interface ProfileView {
  organization: string;
  viewedAt: string;
}

export async function fetchProfileViews(): Promise<ProfileView[]> {
  try {
    const data = await apiFetch<{ views: ProfileView[] }>("/api/me/profile-views");
    return data.views;
  } catch {
    return [];
  }
}

export function setCguConsent(accepted: boolean): Promise<MyProfile> {
  return apiFetch<MyProfile>("/api/me/cgu", {
    method: "PUT",
    body: JSON.stringify({ accepted }),
  });
}
