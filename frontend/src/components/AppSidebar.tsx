"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandBlock } from "@/components/layout/BrandBlock";
import { SidebarQuote } from "@/components/layout/SidebarQuote";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationsContext";
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
  { label: "Vues profil", href: "/vue-profil", roles: ["jobseeker"] },
  { label: "Notifications", href: "/notifications", roles: ["jobseeker"] },
  { label: "Ma vidéo", href: "/ma-video", roles: ["jobseeker"] },
  { label: "Questionnaire", href: "/questionnaire", roles: ["jobseeker"] },
];

function SidebarBrandAndQuote() {
  return (
    <>
      <BrandBlock />
      <SidebarQuote />
    </>
  );
}

function NotificationNavLabel({ active }: { active: boolean }) {
  const { unreadCount } = useNotifications();

  return (
    <span className="flex items-center justify-between gap-2">
      <span>Notifications</span>
      {unreadCount > 0 && (
        <span
          className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
            active ? "bg-white text-action" : "bg-action text-white"
          }`}
          aria-label={`${unreadCount} notification${unreadCount > 1 ? "s" : ""} non lue${unreadCount > 1 ? "s" : ""}`}
        >
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </span>
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
                      {item.href === "/notifications" ? (
                        <NotificationNavLabel active={isActive} />
                      ) : (
                        item.label
                      )}
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
          {role === "jobseeker"
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
