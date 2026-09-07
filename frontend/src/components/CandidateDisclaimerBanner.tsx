/** Mention imposée — espace candidat (toutes pages). */
export const CANDIDATE_RIGHTS_DISCLAIMER =
  "Aucune donnée de ce service n'est utilisée pour déterminer vos droits ni le montant de vos allocations.";

export function CandidateDisclaimerBanner() {
  return (
    <aside
      role="note"
      aria-label="Information sur l'usage des données"
      className="sticky top-0 z-20 border-b-2 border-border bg-background-alt px-4 py-3 pr-36 text-center text-sm leading-snug text-institutional lg:px-8"
    >
      {CANDIDATE_RIGHTS_DISCLAIMER}
    </aside>
  );
}
