interface PendingValidationBadgeProps {
  className?: string;
}

/** Icône / pastille « en cours de validation » pour les vidéos PROCESSING. */
export function PendingValidationBadge({ className = "" }: PendingValidationBadgeProps) {
  return (
    <span
      title="Vidéo en cours de validation par un administrateur"
      className={`font-title inline-flex items-center gap-1.5 rounded-full border-2 border-amber-500 bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-800 ${className}`}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-3.5 shrink-0" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
      </svg>
      En cours de validation
    </span>
  );
}
