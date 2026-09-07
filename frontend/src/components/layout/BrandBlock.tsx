import Link from "next/link";

interface BrandBlockProps {
  className?: string;
}

function RobotIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
    >
      <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h2a3 3 0 0 1 3 3v1h1a1 1 0 1 1 0 2h-1v1a3 3 0 0 1-3 3h-1.17l-.83 2.5A1 1 0 0 1 12 22a1 1 0 0 1-.95-.68L10.17 18H9a3 3 0 0 1-3-3v-1H5a1 1 0 1 1 0-2h1v-1a3 3 0 0 1 3-3h2V5.73A2 2 0 0 1 10 4a2 2 0 0 1 2-2zm-3 9a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm6 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
    </svg>
  );
}

export function BrandBlock({ className = "" }: BrandBlockProps) {
  return (
    <Link
      href="/"
      className={`block no-underline ${className}`}
      aria-label="ProfilsActifs — Accueil"
    >
      {/*
        Ancien bloc-marque Ministère (conservé pour rollback) :
        <div className="rounded-lg border-2 border-border bg-surface px-4 py-3" aria-hidden="true">
          <p className="font-title text-xs font-bold uppercase tracking-wide text-institutional">
            Ministère du Job et Bonheur
          </p>
          <p className="font-title mt-1 text-xl font-bold text-institutional">ProfilsActifs</p>
        </div>
      */}
      <div className="flex items-center gap-3 rounded-lg border-2 border-border bg-surface px-4 py-3">
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-institutional text-white"
          aria-hidden="true"
        >
          <RobotIcon className="size-6" />
        </span>
        <p className="font-title text-xl font-bold text-institutional">ProfilsActifs</p>
      </div>
    </Link>
  );
}
