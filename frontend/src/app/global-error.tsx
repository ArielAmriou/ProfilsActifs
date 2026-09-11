"use client";

import { TECHNICAL_DEMO_DISCLAIMER } from "@/components/layout/SiteFooter";

/**
 * Erreur racine (hors layout). Doit rester autonome.
 * Disclaimer repris tel quel pour les pages d'erreur.
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body className="m-0 flex min-h-[100dvh] flex-col bg-[#faf8f4] font-sans text-[#1a4540]">
        <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-12">
          <p className="text-xl font-bold">Compétences+</p>
          <h1 className="mt-6 text-2xl font-bold">Erreur serveur</h1>
          <p className="mt-3 text-sm leading-relaxed opacity-80">
            Une erreur inattendue est survenue. Vous pouvez réessayer.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-8 w-fit rounded-lg bg-[#c4521a] px-4 py-3 text-sm font-bold text-white"
          >
            Réessayer
          </button>
        </div>
        {/* Même mention que SiteFooter — reprise locale car global-error est hors providers */}
        <footer className="border-t border-[#e3e3fd] bg-white px-4 py-3 text-center">
          <p className="m-0 text-xs leading-relaxed opacity-75">{TECHNICAL_DEMO_DISCLAIMER}</p>
        </footer>
      </body>
    </html>
  );
}
