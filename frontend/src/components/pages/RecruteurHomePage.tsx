"use client";

import { Feed } from "@/components/Feed";
import { HeaderBar } from "@/components/HeaderBar";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { BlockRole } from "@/components/RequireRole";
import { PageLayout } from "@/components/layout/PageLayout";

export function RecruteurHomePage() {
  return (
    <>
      <PageLayout
        hideSidebarOnMobile
        sidebar={<AppSidebar />}
        mainClassName="relative min-h-[100dvh]"
      >
        <BlockRole blocked="demandeur">
          <h1 className="sr-only">Profils mis en avant — ProfilsActifs</h1>
          <HeaderBar />
          <Feed />
        </BlockRole>
      </PageLayout>
      <MobileBottomNav />
    </>
  );
}
