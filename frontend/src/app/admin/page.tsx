"use client";

import { AppSidebar } from "@/components/AppSidebar";
import { HeaderBar } from "@/components/HeaderBar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { RequireRole } from "@/components/RequireRole";
import { ContentCard } from "@/components/layout/ContentCard";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/context/AuthContext";

export default function AdminPanel() {
  const { email, role } = useAuth();

  return (
    <>
      <PageLayout hideSidebarOnMobile sidebar={<AppSidebar />}>
        <RequireRole allowed={["admin"]}>
          <HeaderBar />
          <div className="flex flex-1 flex-col px-6 py-10 lg:px-10">
            <ContentCard className="w-full max-w-2xl">
              <h1 className="font-title text-2xl font-bold text-institutional">Profil Administrateur</h1>
              <p className="mt-2 text-sm text-institutional/80">
                Bienvenue sur votre espace d'administration.
              </p>
              <div className="mt-8 space-y-5">
                <div>
                  <label className="font-title block text-sm font-bold">Adresse e-mail</label>
                  <input
                    type="email"
                    value={email ?? ""}
                    disabled
                    className="mt-1.5 w-full rounded-lg border-2 border-border bg-surface px-3 py-2.5 text-institutional opacity-70 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="font-title block text-sm font-bold">Rôle actuel</label>
                  <input
                    type="text"
                    value={role ?? ""}
                    disabled
                    className="mt-1.5 w-full rounded-lg border-2 border-border bg-surface px-3 py-2.5 text-institutional opacity-70 cursor-not-allowed uppercase"
                  />
                </div>
              </div>
            </ContentCard>
          </div>
        </RequireRole>
      </PageLayout>
      <MobileBottomNav />
    </>
  );
}