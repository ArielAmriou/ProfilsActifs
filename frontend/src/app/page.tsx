import { Feed } from "@/components/Feed";
import { HeaderBar } from "@/components/HeaderBar";
import { PageLayout } from "@/components/layout/PageLayout";
import { Sidebar } from "@/components/Sidebar";

export default function HomePage() {
  return (
    <>
      <PageLayout
        hideSidebarOnMobile
        sidebar={<Sidebar />}
        mainClassName="relative min-h-[100dvh]"
      >
        <HeaderBar />
        <Feed />
      </PageLayout>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-surface lg:hidden"
        aria-label="Navigation mobile"
      >
        <a
          href="/"
          aria-current="page"
          className="font-title flex flex-1 flex-col items-center py-3 text-xs font-bold text-institutional no-underline"
        >
          Profils mis en avant
        </a>
        <a
          href="/connexion"
          className="font-title flex flex-1 flex-col items-center justify-center bg-action py-3 text-xs font-bold text-white no-underline"
        >
          Se connecter
        </a>
      </nav>
    </>
  );
}
