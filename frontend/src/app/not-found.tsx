import Link from "next/link";
import { BrandBlock } from "@/components/layout/BrandBlock";

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-content-bg">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-12">
        <BrandBlock className="mb-8" />
        <h1 className="font-title text-2xl font-bold text-institutional">Page introuvable</h1>
        <p className="mt-3 text-sm leading-relaxed text-institutional/80">
          La page demandée n&apos;existe pas ou a été déplacée.
        </p>
        <Link
          href="/"
          className="font-title mt-8 inline-flex w-fit rounded-lg bg-action px-4 py-3 text-sm font-bold text-white no-underline transition hover:bg-action-hover"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
      {/* SiteFooter fourni par le layout racine */}
    </div>
  );
}
