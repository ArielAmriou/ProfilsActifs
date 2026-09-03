"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export function HeaderBar() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-end gap-3 px-4 py-4 lg:px-8">
      <div className="pointer-events-auto flex items-center gap-3">
        {isAuthenticated ? (
          <button
            type="button"
            onClick={logout}
            className="font-title rounded-full border-2 border-border bg-surface px-5 py-2 text-sm font-bold text-institutional transition hover:border-institutional"
          >
            Se déconnecter
          </button>
        ) : (
          <Link
            href="/connexion"
            className="font-title rounded-full bg-action px-5 py-2 text-sm font-bold text-white no-underline transition hover:bg-action-hover"
          >
            Se connecter
          </Link>
        )}
      </div>
    </header>
  );
}
