"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationsContext";
import type { UserRole } from "@/types/auth";

interface MobileNavItem {
  label: string;
  href: string;
  roles: UserRole[];
}

const MOBILE_ITEMS: MobileNavItem[] = [
  { label: "Profils", href: "/", roles: ["recruiter"] },
  { label: "Favoris", href: "/favoris", roles: ["recruiter"] },
  { label: "Profil", href: "/profil", roles: ["jobseeker"] },
  { label: "Vues", href: "/vue-profil", roles: ["jobseeker"] },
  { label: "Notifs", href: "/notifications", roles: ["jobseeker"] },
  { label: "Ma vidéo", href: "/ma-video", roles: ["jobseeker"] },
  { label: "Questionnaire", href: "/questionnaire", roles: ["jobseeker"] },
];

function MobileNotifsLabel({ active }: { active: boolean }) {
  const { unreadCount } = useNotifications();

  return (
    <span className="relative">
      Notifs
      {unreadCount > 0 && (
        <span
          className={`absolute -right-3 -top-1 size-2 rounded-full ${
            active ? "bg-white" : "bg-action"
          }`}
          aria-hidden="true"
        />
      )}
    </span>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const { role, isAuthenticated } = useAuth();

  if (!isAuthenticated || !role) {
    return (
      <nav
        className="fixed inset-x-0 bottom-10 z-40 flex border-t border-border bg-surface lg:bottom-0 lg:mb-10 lg:hidden"
        aria-label="Navigation mobile"
      >
        <Link
          href="/"
          aria-current={pathname === "/" ? "page" : undefined}
          className="font-title flex flex-1 flex-col items-center py-3 text-xs font-bold text-institutional no-underline"
        >
          Profils mis en avant
        </Link>
        <Link
          href="/connexion"
          className="font-title flex flex-1 flex-col items-center justify-center bg-action py-3 text-xs font-bold text-white no-underline"
        >
          Se connecter
        </Link>
      </nav>
    );
  }

  const items = MOBILE_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <nav
      className="fixed inset-x-0 bottom-10 z-40 flex border-t border-border bg-surface lg:bottom-0 lg:mb-10 lg:hidden"
      aria-label="Navigation mobile"
    >
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`font-title flex flex-1 flex-col items-center justify-center py-3 text-xs font-bold no-underline ${
              isActive ? "bg-action text-white" : "text-institutional"
            }`}
          >
            {item.href === "/notifications" ? (
              <MobileNotifsLabel active={isActive} />
            ) : (
              item.label
            )}
          </Link>
        );
      })}
    </nav>
  );
}
