"use client";

import { AppSidebar } from "@/components/AppSidebar";
import { CandidateDisclaimerBanner } from "@/components/CandidateDisclaimerBanner";
import { HeaderBar } from "@/components/HeaderBar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { RequireRole } from "@/components/RequireRole";
import { Questionnaire } from "@/components/Survey/Survey";
import { PageLayout } from "@/components/layout/PageLayout";

export default function QuestionnairePage() {
  return (
    <>
      <PageLayout hideSidebarOnMobile sidebar={<AppSidebar />}>
        <RequireRole allowed={["jobseeker"]}>
          <HeaderBar />
          <CandidateDisclaimerBanner />
          <div className="flex flex-1 items-center justify-center px-6 py-10 lg:px-10">
            <Questionnaire />
          </div>
        </RequireRole>
      </PageLayout>
      <MobileBottomNav />
    </>
  );
}
