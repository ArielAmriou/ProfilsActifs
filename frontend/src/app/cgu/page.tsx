import Link from "next/link";
import { AppSidebar } from "@/components/AppSidebar";
import { ContentCard } from "@/components/layout/ContentCard";
import { PageLayout } from "@/components/layout/PageLayout";
import { CGU_VERSION_LABEL, CGU_ARTICLES } from "@/data/cgu";

export const metadata = {
  title: "Conditions Générales d'Utilisation — ProfilsActifs",
};

export default function CguPage() {
  return (
    <PageLayout hideSidebarOnMobile sidebar={<AppSidebar />}>
      <div className="flex flex-1 flex-col px-6 py-10 lg:px-10">
        <ContentCard className="w-full max-w-3xl">
          <h1 className="font-title text-2xl font-bold text-institutional">
            Conditions Générales d&apos;Utilisation
          </h1>
          <p className="mt-1 text-sm text-institutional/70">
            Plateforme ProfilsActifs · Dernière mise à jour : {CGU_VERSION_LABEL}
          </p>

          {CGU_ARTICLES.map((article) => (
            <section key={article.heading} className="mt-8">
              <h2 className="font-title text-lg font-bold text-institutional">
                {article.heading}
              </h2>
              {article.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mt-2 text-sm leading-relaxed text-institutional/85">
                  {paragraph}
                </p>
              ))}
              {article.items && (
                <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-institutional/85">
                  {article.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <p className="mt-10 text-sm">
            <Link href="/" className="font-title font-bold text-institutional underline">
              Retour à l&apos;accueil
            </Link>
          </p>
        </ContentCard>
      </div>
    </PageLayout>
  );
}
