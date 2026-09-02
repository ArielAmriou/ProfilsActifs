interface ContentCardProps {
  children: React.ReactNode;
  className?: string;
}

export function ContentCard({ children, className = "" }: ContentCardProps) {
  return (
    <div className={`rounded-2xl border-2 border-border bg-surface p-8 ${className}`}>
      {children}
    </div>
  );
}
