"use client";

import { useAuth } from "@/context/AuthContext";
import { ContentCard } from "@/components/layout/ContentCard";

export default function AdminProfilePage() {
  const { email, role } = useAuth();

  return (
    <ContentCard className="max-w-3xl">
      <h1 className="font-title text-2xl font-bold text-institutional">Profil Administrateur</h1>
      <p className="mt-2 text-sm text-institutional/80">
        Gérez vos informations de connexion.
      </p>

      <div className="mt-8 space-y-5">
        <div>
          <label className="font-title block text-sm font-bold">Adresse e-mail</label>
          <input
            type="email"
            value={email ?? ""}
            disabled
            className="mt-1.5 w-full cursor-not-allowed rounded-lg border-2 border-border bg-surface px-3 py-2.5 text-institutional opacity-70"
          />
        </div>
        <div>
          <label className="font-title block text-sm font-bold">Rôle</label>
          <input
            type="text"
            value={role ?? ""}
            disabled
            className="mt-1.5 w-full cursor-not-allowed rounded-lg border-2 border-border bg-surface px-3 py-2.5 text-institutional opacity-70 uppercase"
          />
        </div>
      </div>
    </ContentCard>
  );
}