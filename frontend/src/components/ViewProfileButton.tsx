import Link from "next/link";

interface ViewProfileButtonProps {
  profileId: string;
  className?: string;
}

export function ViewProfileButton({ profileId, className = "" }: ViewProfileButtonProps) {
  return (
    <Link
      href={`/profils/${profileId}`}
      className={`font-title inline-flex items-center justify-center rounded-lg border-2 border-border px-4 py-2 text-sm font-bold text-institutional no-underline transition hover:border-institutional ${className}`}
    >
      Voir le profil
    </Link>
  );
}
