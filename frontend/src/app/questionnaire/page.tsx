import { Questionnaire } from "@/components/Questionnary";
import { PageLayout } from "@/components/layout/PageLayout";
import { BrandBlock } from "@/components/layout/BrandBlock";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Questionnaire — ProfilsActifs",
};

function QuestionnaireSidebar() {
  return (
    <>
      <BrandBlock />
      <div className="mt-10 lg:mt-8">
        <h2 className="font-title text-xl font-bold text-institutional">Votre profil</h2>
        <p className="mt-4 text-sm leading-relaxed text-institutional/80">
          Complétez ce questionnaire pour finaliser votre inscription et accéder aux profils mis en avant.
        </p>
      </div>
    </>
  );
}

export default function QuestionnairePage() {
  return (
    <PageLayout sidebar={<QuestionnaireSidebar />}>
      <div className="flex flex-1 items-center justify-center p-4 py-12 lg:p-12">
        <Questionnaire />
      </div>
    </PageLayout>
  );
}
