import { fetchProfiles, type Profile } from "@/lib/profiles-api";
import { fetchFavoriteUserIds } from "@/lib/favorites-api";
import { readInteractions } from "@/lib/interactions";

/** Favoris serveur (recruteur) + repli localStorage pour compat. */
export async function getFavoritedProfiles(email: string | null): Promise<Profile[]> {
  const fromApi = await fetchFavoriteUserIds();
  const ids = new Set(
    fromApi.length > 0
      ? fromApi
      : Object.entries(readInteractions(email))
          .filter(([, state]) => state.favorited)
          .map(([profileId]) => profileId),
  );

  if (ids.size === 0) {
    return [];
  }

  return (await fetchProfiles()).filter((profile) => ids.has(profile.id));
}

export function getFavoriteCount(email: string | null): number {
  return Object.entries(readInteractions(email)).filter(([, state]) => state.favorited)
    .length;
}
