"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RequireRole } from "@/components/RequireRole";
import { HeaderBar } from "@/components/HeaderBar";
import { BrandBlock } from "@/components/layout/BrandBlock";

export function AdminClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

    const navItems = [
        { label: "Profil", href: "/admin" },
        { label: "Utilisateurs", href: "/admin/utilisateurs" },
        { label: "Modération Vidéos", href: "/admin/videos" },
        { label: "Paramètre du site", href: "/admin/parametres" },
     ];

  return (
    <RequireRole allowed={["admin"]}>
      <div className="font-title flex min-h-dvh bg-content-bg">
        
        <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-surface px-6 py-8">
          <div className="mb-10">
            <BrandBlock link={false} />
          </div>
          
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-lg px-4 py-3 text-sm font-bold transition-colors ${
                    isActive
                      ? "bg-action text-white"
                      : "text-institutional hover:bg-institutional/5"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex flex-1 flex-col">
          <div className="relative h-20">
            <HeaderBar /> 
          </div>
          
          <div className="p-8">
            {children}
          </div>
        </main>
        
      </div>
    </RequireRole>
  );
}