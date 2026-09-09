"use client";

import { useEffect, useMemo, useState } from "react";
import { CATALOG_PAGE_SIZE } from "@/data/profiles";
import {
  applyCatalogFilters,
  collectLocationOptions,
  collectSectorOptions,
  EMPTY_CATALOG_FILTERS,
  type CatalogFilterState,
} from "@/data/catalog-filters";
import { fetchProfiles, type Profile } from "@/lib/profiles-api";
import { useAuth } from "@/context/AuthContext";
import { ProfileCard } from "@/components/ProfileCard";
import { CatalogFilters } from "@/components/CatalogFilters";
import { LoginPromptModal } from "@/components/LoginPromptModal";

type LoginAction =
  | "liker ce profil"
  | "ajouter ce profil à vos favoris"
  | "visionner cette vidéo"
  | "changer de page";

export function ProfileCatalog() {
  const { isAuthenticated } = useAuth();
  const [page, setPage] = useState(1);
  const [loginAction, setLoginAction] = useState<LoginAction | null>(null);
  const [catalog, setCatalog] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CatalogFilterState>(EMPTY_CATALOG_FILTERS);

  useEffect(() => {
    let active = true;

    // Instantané figé pour la session : la pagination reste cohérente même si un
    // profil est mis à jour côté serveur pendant le parcours (voir docs/catalog-pagination.md).
    fetchProfiles().then((fetched) => {
      if (!active) return;
      setCatalog(fetched);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const filteredCatalog = useMemo(
    () => applyCatalogFilters(catalog, filters),
    [catalog, filters],
  );

  const sectorOptions = useMemo(() => collectSectorOptions(catalog), [catalog]);
  const locationOptions = useMemo(() => collectLocationOptions(catalog), [catalog]);

  const totalPages = Math.max(1, Math.ceil(filteredCatalog.length / CATALOG_PAGE_SIZE));

  const profiles = useMemo(() => {
    const start = (Math.min(page, totalPages) - 1) * CATALOG_PAGE_SIZE;
    return filteredCatalog.slice(start, start + CATALOG_PAGE_SIZE);
  }, [filteredCatalog, page, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const requireLogin = (actionLabel: LoginAction) => {
    setLoginAction(actionLabel);
  };

  const goToPage = (next: number) => {
    if (!isAuthenticated) {
      requireLogin("changer de page");
      return;
    }
    const clamped = Math.min(Math.max(1, next), totalPages);
    setPage(clamped);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const emptyMessage =
    catalog.length === 0
      ? "Aucun profil publié pour le moment."
      : "Aucun profil ne correspond à ces filtres.";

  return (
    <section
      className="mx-auto w-full max-w-7xl px-4 pb-28 pt-20 sm:px-6"
      aria-labelledby="catalog-heading"
    >
      <div className="mb-6">
        <h2 id="catalog-heading" className="font-title text-2xl font-bold text-institutional">
          Catalogue de profils
        </h2>
        <p className="mt-1 text-sm text-institutional/75">
          {CATALOG_PAGE_SIZE} profils par page · lecture vidéo à la demande
        </p>
      </div>

      {!loading && catalog.length > 0 && (
        <CatalogFilters
          filters={filters}
          sectorOptions={sectorOptions}
          locationOptions={locationOptions}
          onChange={setFilters}
          onReset={() => setFilters(EMPTY_CATALOG_FILTERS)}
          resultCount={filteredCatalog.length}
          totalCount={catalog.length}
        />
      )}

      {loading ? (
        <p role="status" className="py-16 text-center text-sm text-institutional/70">
          Chargement des profils…
        </p>
      ) : profiles.length === 0 ? (
        <p role="status" className="py-16 text-center text-sm text-institutional/70">
          {emptyMessage}
        </p>
      ) : (
        <ul className="grid list-none grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {profiles.map((profile) => (
            <li key={profile.id}>
              <ProfileCard profile={profile} onRequireLogin={requireLogin} />
            </li>
          ))}
        </ul>
      )}

      <nav
        className="mt-10 flex items-center justify-center gap-4"
        aria-label="Pagination du catalogue"
      >
        <button
          type="button"
          onClick={() => goToPage(page - 1)}
          disabled={isAuthenticated && page <= 1}
          aria-label="Page précédente"
          className="font-title flex size-11 items-center justify-center rounded-lg border-2 border-border text-institutional transition hover:border-institutional disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="currentColor">
            <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
        </button>

        <p className="font-title min-w-[7rem] text-center text-sm font-bold text-institutional" aria-live="polite">
          Page {page} / {totalPages}
        </p>

        <button
          type="button"
          onClick={() => goToPage(page + 1)}
          disabled={isAuthenticated && page >= totalPages}
          aria-label="Page suivante"
          className="font-title flex size-11 items-center justify-center rounded-lg border-2 border-border text-institutional transition hover:border-institutional disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="currentColor">
            <path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
          </svg>
        </button>
      </nav>

      {loginAction && (
        <LoginPromptModal actionLabel={loginAction} onClose={() => setLoginAction(null)} />
      )}
    </section>
  );
}
