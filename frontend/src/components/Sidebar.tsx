import Link from "next/link";
import { BrandBlock } from "@/components/layout/BrandBlock";

const NAV_ITEMS = [
  { label: "Profils mis en avant", href: "/", active: true },
  { label: "Explorer", href: "/", active: false },
  { label: "Mes favoris", href: "/", active: false },
];

export function Sidebar() {
  return (
    <>
      <BrandBlock className="mb-8" />

      <nav aria-label="Sections">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                aria-current={item.active ? "page" : undefined}
                className={`font-title block rounded-lg px-3 py-2.5 text-sm no-underline transition-colors ${
                  item.active
                    ? "bg-action font-bold text-white"
                    : "text-institutional hover:bg-institutional/5"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <p className="mt-auto pt-8 text-xs leading-relaxed text-institutional/70">
        Valorisez vos compétences professionnelles par la vidéo.
      </p>
    </>
  );
}
