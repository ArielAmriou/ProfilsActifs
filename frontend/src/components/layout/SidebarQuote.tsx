interface SidebarQuoteProps {
  className?: string;
}

export function SidebarQuote({ className = "" }: SidebarQuoteProps) {
  return (
    <blockquote
      className={`mt-10 max-w-sm text-lg leading-relaxed text-institutional lg:mt-8 ${className}`}
    >
      « ProfilsActifs met en avant vos compétences professionnelles par la vidéo pour
      faciliter la mise en relation avec les{" "}
      <span className="whitespace-nowrap">recruteurs.&nbsp;»</span>
    </blockquote>
  );
}
