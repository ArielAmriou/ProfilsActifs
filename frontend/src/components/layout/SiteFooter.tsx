/**
 * Mention imposée (communication / juridique) — ne pas reformuler.
 * Texte exact requis sur toutes les pages publiques, y compris les erreurs.
 */
export const TECHNICAL_DEMO_DISCLAIMER =
  "Démonstrateur technique, ne constitue pas un service public en exploitation.";

interface SiteFooterProps {
  className?: string;
  /** fixed = toujours visible (y compris feed avec feed-lock) */
  fixed?: boolean;
}

export function SiteFooter({ className = "", fixed = true }: SiteFooterProps) {
  return (
    <footer
      className={`${
        fixed ? "fixed inset-x-0 bottom-0 z-30" : ""
      } border-t border-border bg-surface px-4 py-2 text-center ${className}`}
      role="contentinfo"
    >
      <p className="text-xs leading-relaxed text-institutional/75">
        {TECHNICAL_DEMO_DISCLAIMER}
      </p>
    </footer>
  );
}
