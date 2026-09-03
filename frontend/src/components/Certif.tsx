export function CertifiedBadge() {
  return (
    <span 
      title="Profil Certifié (Questionnaire complété)" 
      className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white shadow-sm"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3 w-3"
      >
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    </span>
  );
}
