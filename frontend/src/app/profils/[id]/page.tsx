"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { HeaderBar } from "@/components/HeaderBar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { BlockRole } from "@/components/RequireRole";
import { ContentCard } from "@/components/layout/ContentCard";
import { PageLayout } from "@/components/layout/PageLayout";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { CertifiedBadge } from "@/components/Certif";
import { fetchProfileResult, type Profile } from "@/lib/profiles-api";

interface ProfileDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProfileDetailPage({ params }: ProfileDetailPageProps) {
  const { id } = use(params);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [access, setAccess] = useState<"loading" | "ok" | "hidden" | "missing">("loading");

  useEffect(() => {
    let active = true;

    fetchProfileResult(id).then((result) => {
      if (!active) return;
      if (result.status === "ok") {
        setProfile(result.profile);
      }
      setAccess(result.status);
    });

    return () => {
      active = false;
    };
  }, [id]);

  if (access === "loading") {
    return (
      <PageLayout hideSidebarOnMobile sidebar={<AppSidebar />}>
        <BlockRole blocked="jobseeker">
          <HeaderBar />
          <p role="status" className="px-6 py-20 text-center text-sm text-institutional/70">
            Chargement du profil…
          </p>
        </BlockRole>
      </PageLayout>
    );
  }

  if (access === "hidden" || access === "missing" || !profile) {
    return (
      <>
        <PageLayout hideSidebarOnMobile sidebar={<AppSidebar />}>
          <BlockRole blocked="jobseeker">
            <HeaderBar />
            <div className="flex flex-1 flex-col px-6 py-10 lg:px-10">
              <ContentCard className="w-full max-w-2xl">
                <Link
                  href="/favoris"
                  className="font-title text-sm font-bold text-institutional no-underline hover:underline"
                >
                  ← Retour
                </Link>
                <h1 className="font-title mt-6 text-2xl font-bold text-institutional">
                  Profil indisponible
                </h1>
                <p className="mt-3 text-sm text-institutional/80">
                  Ce profil n&apos;est plus consultable. Le candidat l&apos;a peut-être masqué
                  ou retiré du catalogue.
                </p>
              </ContentCard>
            </div>
          </BlockRole>
        </PageLayout>
        <MobileBottomNav />
      </>
    );
  }

  return (
    <>
      <PageLayout hideSidebarOnMobile sidebar={<AppSidebar />}>
        <BlockRole blocked="jobseeker">
          <HeaderBar />
          <div className="flex flex-1 flex-col px-6 py-10 lg:px-10">
            <ContentCard className="w-full max-w-2xl">
              <Link
                href="/"
                className="font-title text-sm font-bold text-institutional no-underline hover:underline"
              >
                ← Retour aux profils
              </Link>

              <div className="mt-6 flex items-start justify-between gap-4">
                <div>
                  <h1 className="font-title text-2xl font-bold text-institutional">
                    {profile.name}
                  </h1>
                  <p className="font-title mt-1 text-base font-semibold text-institutional/80">
                    {profile.title}
                  </p>
                </div>
                {profile.certified && <CertifiedBadge className="shrink-0" />}
              </div>

              <div className="mt-6 w-fit overflow-hidden rounded-2xl border-2 border-border bg-institutional">
                <VideoPlayer
                  video={profile.video}
                  label={`Vidéo de présentation de ${profile.name}`}
                  className="aspect-[9/16] h-auto w-48 object-cover sm:w-56"
                />
              </div>

              <dl className="mt-8 space-y-4 text-sm text-institutional">
                <div className="rounded-xl border-2 border-border bg-content-bg p-4">
                  <dt className="font-title text-xs font-bold uppercase tracking-wide text-institutional/60">
                    Secteur
                  </dt>
                  <dd className="mt-1 text-base">{profile.sector}</dd>
                </div>
                <div className="rounded-xl border-2 border-border bg-content-bg p-4">
                  <dt className="font-title text-xs font-bold uppercase tracking-wide text-institutional/60">
                    Localisation
                  </dt>
                  <dd className="mt-1 text-base">{profile.location}</dd>
                </div>
                <div className="rounded-xl border-2 border-border bg-content-bg p-4">
                  <dt className="font-title text-xs font-bold uppercase tracking-wide text-institutional/60">
                    Compétences
                  </dt>
                  <dd className="mt-1 text-base">{profile.skills.join(", ")}</dd>
                </div>
              </dl>
            </ContentCard>
          </div>
        </BlockRole>
      </PageLayout>
      <MobileBottomNav />
    </>
  );
}
