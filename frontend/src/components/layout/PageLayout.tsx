interface PageLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  hideSidebarOnMobile?: boolean;
  sidebarClassName?: string;
  mainClassName?: string;
}

export function PageLayout({
  sidebar,
  children,
  hideSidebarOnMobile = false,
  sidebarClassName = "",
  mainClassName = "",
}: PageLayoutProps) {
  return (
    <div className="flex min-h-[100dvh] flex-col lg:flex-row">
      <aside
        className={`flex shrink-0 flex-col border-b border-border bg-surface px-6 py-8 lg:w-64 lg:border-b-0 lg:border-r ${hideSidebarOnMobile ? "hidden lg:flex" : ""} ${sidebarClassName}`}
        aria-label="Navigation Compétences+"
      >
        {sidebar}
      </aside>

      <main
        id="contenu-principal"
        className={`flex flex-1 flex-col bg-content-bg ${mainClassName}`}
      >
        {children}
      </main>
    </div>
  );
}
