"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { HeaderBar } from "@/components/HeaderBar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { RequireRole } from "@/components/RequireRole";
import { ContentCard } from "@/components/layout/ContentCard";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/context/AuthContext";
import { fetchFavorites, removeFavorite, type FavoriteItem } from "@/lib/favorites-api";
import { readInteractions, writeInteractions } from "@/lib/interactions";
import { ViewProfileButton } from "@/components/ViewProfileButton";
import { CertifiedBadge } from "@/components/Certif";
import { fetchProfiles, type Profile } from "@/lib/profiles-api";

function FavoriteCard({
  item,
  profile,
  email,
  onRemoved,
}: {
  item: FavoriteItem;
  profile: Profile | null;
  email: string | null;
  onRemoved: (profileId: string) => void;
}) {
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState(false);

  const handleRemove = async () => {
    setRemoving(true);
    setError(false);
    try {
      await removeFavorite(item.id);
      if (email) {
        const all = readInteractions(email);
        all[item.id] = {
          liked: all[item.id]?.liked ?? false,
          likeCount: all[item.id]?.likeCount ?? profile?.likes ?? 0,
          favorited: false,
        };
        writeInteractions(email, all);
      }
      onRemoved(item.id);
    } catch {
      setError(true);
      setRemoving(false);
    }
  };

  if (!item.available) {
    return (
      <article className="rounded-2xl border-2 border-dashed border-border bg-content-bg p-5">
        <h2 className="font-title text-lg font-bold text-institutional">Profil indisponible</h2>
        <p className="mt-2 text-sm text-institutional/75">
          Ce candidat a masqué son profil. Il n&apos;est plus consultable.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <ViewProfileButton profileId={item.id} />
          <button
            type="button"
            onClick={() => void handleRemove()}
            disabled={removing}
            aria-label="Retirer ce profil des favoris"
            className="font-title ml-auto inline-flex items-center justify-center rounded-lg border-2 border-border px-4 py-2 text-sm font-bold text-institutional transition hover:border-action hover:text-action disabled:cursor-not-allowed disabled:opacity-50"
          >
            {removing ? "Retrait…" : "Retirer des favoris"}
          </button>
        </div>
        {error && (
          <p role="alert" className="mt-3 text-sm text-red-800">
            Impossible de retirer ce profil des favoris pour le moment.
          </p>
        )}
      </article>
    );
  }

  const name =
    profile?.name ||
    `${item.firstname} ${item.lastname}`.trim() ||
    item.name;

  return (
    <article className="rounded-2xl border-2 border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-title text-lg font-bold text-institutional">{name}</h2>
          <p className="font-title mt-1 text-sm font-semibold text-institutional/80">
            {profile?.title ?? "—"}
          </p>
        </div>
        {profile?.certified && <CertifiedBadge className="shrink-0" />}
      </div>

      {profile && (
        <dl className="mt-4 space-y-1 text-sm text-institutional/85">
          <div>
            <dt className="sr-only">Secteur</dt>
            <dd>
              <span className="font-title font-bold">Secteur : </span>
              {profile.sector}
            </dd>
          </div>
          <div>
            <dt className="sr-only">Localisation</dt>
            <dd>
              <span className="font-title font-bold">Localisation : </span>
              {profile.location}
            </dd>
          </div>
        </dl>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <ViewProfileButton profileId={item.id} />
        <Link
          href="/"
          className="font-title inline-flex items-center justify-center rounded-lg border-2 border-border px-4 py-2 text-sm font-bold text-institutional no-underline transition hover:border-institutional"
        >
          Voir dans le fil
        </Link>
        <button
          type="button"
          onClick={() => void handleRemove()}
          disabled={removing}
          aria-label={`Retirer ${name} des favoris`}
          className="font-title ml-auto inline-flex items-center justify-center rounded-lg border-2 border-border px-4 py-2 text-sm font-bold text-institutional transition hover:border-action hover:text-action disabled:cursor-not-allowed disabled:opacity-50"
        >
          {removing ? "Retrait…" : "Retirer des favoris"}
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-800">
          Impossible de retirer ce profil des favoris pour le moment.
        </p>
      )}
    </article>
  );
}

export default function FavorisPage() {
  const { email } = useAuth();
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [profilesById, setProfilesById] = useState<Map<string, Profile>>(new Map());

  useEffect(() => {
    let active = true;

    Promise.all([fetchFavorites(), fetchProfiles()]).then(([favorites, profiles]) => {
      if (!active) return;
      setItems(favorites);
      setProfilesById(new Map(profiles.map((profile) => [profile.id, profile])));
    });

    return () => {
      active = false;
    };
  }, [email]);

  const handleRemoved = (profileId: string) => {
    setItems((current) => current.filter((item) => item.id !== profileId));
  };

  return (
    <>
      <PageLayout hideSidebarOnMobile sidebar={<AppSidebar />}>
        <RequireRole allowed={["recruiter"]}>
          <HeaderBar />
          <div className="flex flex-1 flex-col px-6 py-10 lg:px-10">
            <ContentCard className="w-full max-w-4xl">
              <h1 className="font-title text-2xl font-bold text-institutional">
                Mes favoris
              </h1>
              <p className="mt-2 text-sm text-institutional/80">
                Retrouvez ici tous les profils que vous avez enregistrés.
              </p>

              {items.length === 0 ? (
                <div className="mt-8 rounded-xl border-2 border-dashed border-border bg-content-bg px-6 py-10 text-center">
                  <p className="text-sm text-institutional/75">
                    Vous n&apos;avez pas encore de profils favoris.
                  </p>
                  <Link
                    href="/"
                    className="font-title mt-4 inline-flex rounded-lg bg-action px-4 py-2 text-sm font-bold text-white no-underline transition hover:bg-action-hover"
                  >
                    Parcourir les profils
                  </Link>
                </div>
              ) : (
                <div className="mt-8 grid gap-4">
                  {items.map((item) => (
                    <FavoriteCard
                      key={item.id}
                      item={item}
                      profile={profilesById.get(item.id) ?? null}
                      email={email}
                      onRemoved={handleRemoved}
                    />
                  ))}
                </div>
              )}
            </ContentCard>
          </div>
        </RequireRole>
      </PageLayout>
      <MobileBottomNav />
    </>
  );
}
