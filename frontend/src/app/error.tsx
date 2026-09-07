"use client";

import Link from "next/link";
import { BrandBlock } from "@/components/layout/BrandBlock";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-content-bg">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-12">
        <BrandBlock className="mb-8" />
        <h1 className="font-title text-2xl font-bold text-institutional">Une erreur est survenue</h1>
        <p className="mt-3 text-sm leading-relaxed text-institutional/80">
          Le service a rencontré un problème temporaire. Vous pouvez réessayer ou revenir à
          l&apos;accueil.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="font-title rounded-lg bg-action px-4 py-3 text-sm font-bold text-white transition hover:bg-action-hover"
          >
            Réessayer
          </button>
          <Link
            href="/"
            className="font-title inline-flex items-center justify-center rounded-lg border-2 border-border px-4 py-3 text-sm font-bold text-institutional no-underline transition hover:border-institutional"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
      {/* SiteFooter fourni par le layout racine */}
    </div>
  );
}
