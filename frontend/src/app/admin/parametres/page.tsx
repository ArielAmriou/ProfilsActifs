import { ContentCard } from "@/components/layout/ContentCard";

export default function AdminSettingsPage() {
  return (
    <ContentCard className="max-w-3xl">
      <h1 className="font-title text-2xl font-bold text-institutional">Paramètre du site</h1>
      <p className="mt-2 text-sm text-institutional/80">
        Espace de configuration de la plateforme ProfilsActifs.
      </p>

      <div className="mt-8 rounded-xl border-2 border-dashed border-border bg-content-bg p-8 text-center">
        <p className="text-sm text-institutional/70">
          Les réglages du site arriveront ici.
        </p>
      </div>
    </ContentCard>
  );
}