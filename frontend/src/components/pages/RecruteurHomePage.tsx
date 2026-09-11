"use client";

import { HeaderBar } from "@/components/HeaderBar";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { BlockRole } from "@/components/RequireRole";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProfileCatalog } from "@/components/ProfileCatalog";

export function RecruteurHomePage() {
  return (
    <>
      <PageLayout
        hideSidebarOnMobile
        sidebar={<AppSidebar />}
        mainClassName="relative min-h-[100dvh]"
      >
        <BlockRole blocked="jobseeker">
          <h1 className="sr-only">Catalogue de profils — Compétences+</h1>
          <HeaderBar />
          <ProfileCatalog />
        </BlockRole>
      </PageLayout>
      <MobileBottomNav />
    </>
  );
}
