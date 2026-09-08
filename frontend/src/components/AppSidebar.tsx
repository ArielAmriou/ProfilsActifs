"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandBlock } from "@/components/layout/BrandBlock";
import { SidebarQuote } from "@/components/layout/SidebarQuote";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/types/auth";

interface NavItem {
  label: string;
  href: string;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Profils mis en avant", href: "/", roles: ["recruiter"] },
  { label: "Mes favoris", href: "/favoris", roles: ["recruiter"] },
  { label: "Profil", href: "/profil", roles: ["jobseeker"] },
  { label: "Ma vidéo", href: "/ma-video", roles: ["jobseeker"] },
  { label: "Questionnaire", href: "/questionnaire", roles: ["jobseeker"] },
  { label: "Profil Admin", href: "/admin", roles: ["admin"] },
];

function SidebarBrandAndQuote() {
  return (
    <>
      <BrandBlock />
      <SidebarQuote />
    </>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const { role, isAuthenticated } = useAuth();

  const items = NAV_ITEMS.filter(
    (item) => isAuthenticated && role && item.roles.includes(role),
  );

  return (
    <>
      {items.length > 0 ? (
        <>
          <BrandBlock className="mb-8" />
          <nav aria-label="Sections">
            <ul className="space-y-1">
              {items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={`font-title block rounded-lg px-3 py-2.5 text-sm no-underline transition-colors ${
                        isActive
                          ? "bg-action font-bold text-white"
                          : "text-institutional hover:bg-institutional/5"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </>
      ) : (
        !isAuthenticated && <SidebarBrandAndQuote />
      )}

      {isAuthenticated && (
        <p className="mt-auto pt-8 text-sm leading-relaxed text-institutional/70">
          {role === "admin"
            ? "Gérez la plateforme depuis votre espace administrateur."
            : role === "jobseeker"
            ? "Gérez votre profil vidéo et complétez votre questionnaire."
            : "Valorisez vos compétences professionnelles par la vidéo."}
        </p>
      )}
    </>
  );
}

export function ConnexionSidebar() {
  return (
    <>
      <SidebarBrandAndQuote />

      <p className="mt-auto pt-8 text-sm text-institutional/60">
        Démo : saisissez n&apos;importe quelle adresse e-mail et mot de passe pour
        vous connecter ou créer un compte.
      </p>
    </>
  );
}
