import type { Profile } from "@/data/profiles";
import { getProfileById } from "@/data/profiles";
import { readInteractions } from "@/lib/interactions";

function resolveProfile(profileId: string): Profile | null {
  return getProfileById(profileId);
}

export function getFavoritedProfiles(email: string | null): Profile[] {
  const interactions = readInteractions(email);

  return Object.entries(interactions)
    .filter(([, state]) => state.favorited)
    .map(([profileId]) => resolveProfile(profileId))
    .filter((profile): profile is Profile => profile !== null);
}

export function getFavoriteCount(email: string | null): number {
  return getFavoritedProfiles(email).length;
}
