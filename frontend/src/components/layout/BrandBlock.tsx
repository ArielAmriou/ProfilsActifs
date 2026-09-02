import Link from "next/link";

interface BrandBlockProps {
  className?: string;
}

export function BrandBlock({ className = "" }: BrandBlockProps) {
  return (
    <Link
      href="/"
      className={`block no-underline ${className}`}
      aria-label="ProfilsActifs — Accueil"
    >
      <div className="rounded-lg border-2 border-border bg-surface px-4 py-3">
        <p className="font-title text-xs font-bold uppercase tracking-wide text-institutional">
          Ministère du Job et Bonheur
        </p>
        <p className="font-title mt-1 text-xl font-bold text-institutional">ProfilsActifs</p>
      </div>
    </Link>
  );
}
