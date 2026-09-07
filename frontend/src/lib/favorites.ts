import { fetchProfiles, type Profile } from "@/lib/profiles-api";
import { readInteractions } from "@/lib/interactions";

function favoritedIds(email: string | null): string[] {
  return Object.entries(readInteractions(email))
    .filter(([, state]) => state.favorited)
    .map(([profileId]) => profileId);
}

export async function getFavoritedProfiles(email: string | null): Promise<Profile[]> {
  const ids = new Set(favoritedIds(email));

  if (ids.size === 0) {
    return [];
  }

  return (await fetchProfiles()).filter((profile) => ids.has(profile.id));
}

export function getFavoriteCount(email: string | null): number {
  return favoritedIds(email).length;
}
