"use client";

import {
  AVAILABILITY_OPTIONS,
  type CatalogFilterState,
  type CertificationFilter,
  type DateSort,
} from "@/data/catalog-filters";

interface CatalogFiltersProps {
  filters: CatalogFilterState;
  sectorOptions: string[];
  locationOptions: string[];
  onChange: (next: CatalogFilterState) => void;
  onReset: () => void;
  resultCount: number;
  totalCount: number;
}

const selectClassName =
  "font-title w-full rounded-lg border-2 border-border bg-surface px-3 py-2.5 text-sm text-institutional transition hover:border-institutional focus:border-institutional";

export function CatalogFilters({
  filters,
  sectorOptions,
  locationOptions,
  onChange,
  onReset,
  resultCount,
  totalCount,
}: CatalogFiltersProps) {
  const update = <K extends keyof CatalogFilterState>(
    key: K,
    value: CatalogFilterState[K],
  ) => {
    onChange({ ...filters, [key]: value });
  };

  const active = Object.values(filters).some(Boolean);

  return (
    <div className="mb-8 rounded-2xl border-2 border-border bg-content-bg p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-title text-sm font-bold text-institutional">Filtrer le catalogue</h3>
          <p className="mt-0.5 text-sm text-institutional/70">
            {resultCount === totalCount
              ? `${totalCount} profil${totalCount > 1 ? "s" : ""}`
              : `${resultCount} profil${resultCount > 1 ? "s" : ""} sur ${totalCount}`}
          </p>
        </div>
        {active && (
          <button
            type="button"
            onClick={onReset}
            className="font-title text-sm font-bold text-action underline-offset-2 transition hover:underline"
          >
            Réinitialiser
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <label className="block min-w-0">
          <span className="font-title mb-1.5 block text-xs font-bold text-institutional">
            Secteur
          </span>
          <select
            value={filters.sector}
            onChange={(event) => update("sector", event.target.value)}
            className={selectClassName}
            aria-label="Filtrer par secteur"
          >
            <option value="">Tous les secteurs</option>
            {sectorOptions.map((sector) => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))}
          </select>
        </label>

        <label className="block min-w-0">
          <span className="font-title mb-1.5 block text-xs font-bold text-institutional">
            Localisation
          </span>
          <select
            value={filters.location}
            onChange={(event) => update("location", event.target.value)}
            className={selectClassName}
            aria-label="Filtrer par localisation"
          >
            <option value="">Toutes les localisations</option>
            {locationOptions.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </label>

        <label className="block min-w-0">
          <span className="font-title mb-1.5 block text-xs font-bold text-institutional">
            Disponibilité
          </span>
          <select
            value={filters.availability}
            onChange={(event) => update("availability", event.target.value)}
            className={selectClassName}
            aria-label="Filtrer par disponibilité"
          >
            <option value="">Toutes les disponibilités</option>
            {AVAILABILITY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="block min-w-0">
          <span className="font-title mb-1.5 block text-xs font-bold text-institutional">
            Certification
          </span>
          <select
            value={filters.certification}
            onChange={(event) =>
              update("certification", event.target.value as CertificationFilter)
            }
            className={selectClassName}
            aria-label="Filtrer par statut de certification"
          >
            <option value="">Tous les statuts</option>
            <option value="certified">Certifiés</option>
            <option value="uncertified">Non certifiés</option>
          </select>
        </label>

        <label className="block min-w-0">
          <span className="font-title mb-1.5 block text-xs font-bold text-institutional">
            Date
          </span>
          <select
            value={filters.date}
            onChange={(event) => update("date", event.target.value as DateSort)}
            className={selectClassName}
            aria-label="Trier par date"
          >
            <option value="">Par défaut</option>
            <option value="newest">Plus récents</option>
            <option value="oldest">Plus anciens</option>
          </select>
        </label>
      </div>
    </div>
  );
}
