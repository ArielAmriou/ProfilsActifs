import { PROFILE_SECTORS } from "@/data/sectors";
import type { Profile } from "@/lib/profiles-api";

/** Aligné sur la question 4 du questionnaire de certification. */
export const AVAILABILITY_OPTIONS = [
  "Immédiate",
  "Sous 1 mois",
  "Sous 3 mois ou plus",
] as const;

export type CertificationFilter = "" | "certified" | "uncertified";
export type DateSort = "" | "newest" | "oldest";

export interface CatalogFilterState {
  sector: string;
  location: string;
  availability: string;
  certification: CertificationFilter;
  date: DateSort;
}

export const EMPTY_CATALOG_FILTERS: CatalogFilterState = {
  sector: "",
  location: "",
  availability: "",
  certification: "",
  date: "",
};

export function collectLocationOptions(profiles: Profile[]): string[] {
  const values = new Set<string>();
  for (const profile of profiles) {
    if (profile.location && profile.location !== "Non renseigné") {
      values.add(profile.location);
    }
  }
  return Array.from(values).sort((a, b) => a.localeCompare(b, "fr"));
}

export function collectSectorOptions(profiles: Profile[]): string[] {
  const fromCatalog = new Set<string>();
  for (const profile of profiles) {
    if (profile.sector && profile.sector !== "Non renseigné") {
      fromCatalog.add(profile.sector);
    }
  }
  const known = PROFILE_SECTORS.filter((sector) => fromCatalog.has(sector));
  const extras = Array.from(fromCatalog)
    .filter((sector) => !(PROFILE_SECTORS as readonly string[]).includes(sector))
    .sort((a, b) => a.localeCompare(b, "fr"));
  return [...known, ...extras];
}

export function applyCatalogFilters(
  profiles: Profile[],
  filters: CatalogFilterState,
): Profile[] {
  let next = profiles.filter((profile) => {
    if (filters.sector && profile.sector !== filters.sector) return false;
    if (filters.location && profile.location !== filters.location) return false;
    if (filters.availability && profile.availability !== filters.availability) {
      return false;
    }
    if (filters.certification === "certified" && !profile.certified) return false;
    if (filters.certification === "uncertified" && profile.certified) return false;
    return true;
  });

  if (filters.date === "newest") {
    next = [...next].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  } else if (filters.date === "oldest") {
    next = [...next].sort(
      (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
    );
  }

  return next;
}

export function hasActiveCatalogFilters(filters: CatalogFilterState): boolean {
  return Object.values(filters).some(Boolean);
}
