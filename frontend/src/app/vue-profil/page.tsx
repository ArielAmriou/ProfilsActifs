"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { CandidateDisclaimerBanner } from "@/components/CandidateDisclaimerBanner";
import { HeaderBar } from "@/components/HeaderBar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { RequireRole } from "@/components/RequireRole";
import { ContentCard } from "@/components/layout/ContentCard";
import { PageLayout } from "@/components/layout/PageLayout";
import { fetchProfileViews, type ProfileView } from "@/lib/profiles-api";

function formatViewDate(iso: string): { date: string; time: string } {
  const value = new Date(iso);
  if (Number.isNaN(value.getTime())) {
    return { date: "—", time: "—" };
  }
  return {
    date: value.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
    time: value.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

export default function VueProfilPage() {
  const [views, setViews] = useState<ProfileView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchProfileViews().then((fetched) => {
      if (!active) return;
      setViews(fetched);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <PageLayout hideSidebarOnMobile sidebar={<AppSidebar />}>
        <RequireRole allowed={["jobseeker"]}>
          <CandidateDisclaimerBanner />
          <HeaderBar className="pointer-events-none relative z-30 flex items-center justify-end gap-3 px-4 py-3 lg:px-8" />
          <div className="flex flex-1 flex-col px-6 py-10 lg:px-10">
            <ContentCard className="w-full max-w-2xl">
              <h1 className="font-title text-2xl font-bold text-institutional">
                Vues du profil
              </h1>
              <p className="mt-2 text-sm text-institutional/80">
                Organisations ayant consulté votre fiche lorsqu&apos;elles étaient connectées
                avec un compte recruteur. Aucun nom de personne n&apos;est affiché. Les
                consultations anonymes, hors compte, ne sont pas enregistrées : ce journal
                n&apos;est donc pas un décompte exhaustif de toutes les vues possibles.
              </p>

              {loading ? (
                <p role="status" className="mt-8 text-sm text-institutional/70">
                  Chargement…
                </p>
              ) : views.length === 0 ? (
                <div className="mt-8 rounded-xl border-2 border-dashed border-border bg-content-bg px-6 py-10 text-center">
                  <p className="text-sm text-institutional/75">
                    Aucune consultation enregistrée pour le moment.
                  </p>
                </div>
              ) : (
                <ul className="mt-8 space-y-3">
                  {views.map((view, index) => {
                    const { date, time } = formatViewDate(view.viewedAt);
                    return (
                      <li
                        key={`${view.viewedAt}-${index}`}
                        className="rounded-xl border-2 border-border bg-content-bg p-4"
                      >
                        <p className="font-title text-sm font-bold text-institutional">
                          {view.organization}
                        </p>
                        <p className="mt-1 text-sm text-institutional/75">
                          {date} · {time}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </ContentCard>
          </div>
        </RequireRole>
      </PageLayout>
      <MobileBottomNav />
    </>
  );
}
