import type { Profile } from "@/data/profiles";
import { getInitialProfiles } from "@/data/profiles";
import { readInteractions } from "@/lib/interactions";

function resolveProfile(profileId: string): Profile | null {
  const baseId = profileId.split("-")[0] ?? profileId;
  return getInitialProfiles().find((profile) => profile.id === baseId) ?? null;
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
