interface CertifiedBadgeProps {
  className?: string;
}

/** Badge orange « Certifié » — même rendu que sur la fiche / carte profil. */
export function CertifiedBadge({ className = "" }: CertifiedBadgeProps) {
  return (
    <span
      title="Profil certifié (questionnaire complété)"
      className={`font-title inline-flex rounded-full bg-action px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white ${className}`}
    >
      Certifié
    </span>
  );
}
