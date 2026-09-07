"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { HeaderBar } from "@/components/HeaderBar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { BlockRole } from "@/components/RequireRole";
import { ContentCard } from "@/components/layout/ContentCard";
import { PageLayout } from "@/components/layout/PageLayout";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { useProfileVideo } from "@/hooks/useProfileVideo";
import { getProfileById } from "@/data/profiles";

interface ProfileDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProfileDetailPage({ params }: ProfileDetailPageProps) {
  const { id } = use(params);
  const profile = getProfileById(id);
  const video = useProfileVideo(profile?.videoOwnerId);

  if (!profile) {
    notFound();
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
                {profile.certified && (
                  <span className="font-title shrink-0 rounded-full bg-action px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                    Certifié
                  </span>
                )}
              </div>

              <div className="mt-6 w-fit overflow-hidden rounded-2xl border-2 border-border bg-institutional">
                <VideoPlayer
                  video={video}
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
                <div className="rounded-xl border-2 border-border bg-content-bg p-4">
                  <dt className="font-title text-xs font-bold uppercase tracking-wide text-institutional/60">
                    Likes
                  </dt>
                  <dd className="font-title mt-1 text-2xl font-bold text-action">
                    {profile.likes}
                  </dd>
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
