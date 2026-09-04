"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getHomeForRole, type UserRole } from "@/types/auth";

interface RequireRoleProps {
  allowed: UserRole[];
  children: React.ReactNode;
}

export function RequireRole({ allowed, children }: RequireRoleProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, role } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/connexion");
      return;
    }

    if (role && !allowed.includes(role)) {
      router.replace(getHomeForRole(role));
    }
  }, [allowed, isAuthenticated, isLoading, role, router]);

  if (isLoading || !isAuthenticated || !role || !allowed.includes(role)) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <p className="text-institutional" role="status">
          Chargement…
        </p>
      </div>
    );
  }

  return children;
}

interface BlockRoleProps {
  blocked: UserRole;
  redirectTo?: string;
  children: React.ReactNode;
}

export function BlockRole({ blocked, redirectTo, children }: BlockRoleProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, role } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated && role === blocked) {
      router.replace(redirectTo ?? getHomeForRole(blocked));
    }
  }, [blocked, isAuthenticated, isLoading, redirectTo, role, router]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <p className="text-institutional" role="status">
          Chargement…
        </p>
      </div>
    );
  }

  if (isAuthenticated && role === blocked) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <p className="text-institutional" role="status">
          Redirection…
        </p>
      </div>
    );
  }

  return children;
}
