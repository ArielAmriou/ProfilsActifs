import { DEMO_VIDEO_OWNER_ID } from "@/data/media";

export interface Profile {
  id: string;
  name: string;
  title: string;
  sector: string;
  location: string;
  skills: string[];
  likes: number;
  videoOwnerId?: string;
  subtitlesUrl?: string;
  certified: boolean;
}

export const CATALOG_PAGE_SIZE = 20;

const BASE_PROFILES: Profile[] = [
  {
    id: "1",
    name: "Amine Benali",
    title: "Technicien de maintenance industrielle",
    sector: "Industrie",
    location: "Lyon (69)",
    skills: ["Maintenance préventive", "Automatisme", "Soudure TIG"],
    likes: 142,
    videoOwnerId: DEMO_VIDEO_OWNER_ID,
    subtitlesUrl: "/subtitles/amine-benali.vtt",
    certified: true,
  },
  {
    id: "2",
    name: "Sophie Martin",
    title: "Assistante administrative bilingue",
    sector: "Services",
    location: "Nantes (44)",
    skills: ["Accueil", "Anglais C1", "Suite Office"],
    likes: 89,
    videoOwnerId: DEMO_VIDEO_OWNER_ID,
    certified: false,
  },
  {
    id: "3",
    name: "Karim Diallo",
    title: "Électricien bâtiment",
    sector: "BTP",
    location: "Marseille (13)",
    skills: ["Câblage", "Normes NF C 15-100", "Lecture de plans"],
    likes: 203,
    videoOwnerId: DEMO_VIDEO_OWNER_ID,
    certified: true,
  },
  {
    id: "4",
    name: "Élodie Rousseau",
    title: "Aide-soignante",
    sector: "Santé",
    location: "Tours (37)",
    skills: ["Soins de base", "Relation patient", "Hygiène hospitalière"],
    likes: 167,
    videoOwnerId: DEMO_VIDEO_OWNER_ID,
    certified: true,
  },
  {
    id: "5",
    name: "Thomas Leroy",
    title: "Développeur web junior",
    sector: "Numérique",
    location: "Lille (59)",
    skills: ["JavaScript", "React", "Accessibilité web"],
    likes: 56,
    videoOwnerId: DEMO_VIDEO_OWNER_ID,
    certified: false,
  },
];

/** Catalogue démo : 40 profils (2 pages de 20) à partir des fiches de base. */
function buildCatalog(): Profile[] {
  const catalog: Profile[] = [];
  const total = CATALOG_PAGE_SIZE * 2;
  for (let i = 0; i < total; i += 1) {
    const base = BASE_PROFILES[i % BASE_PROFILES.length]!;
    const pageIndex = Math.floor(i / CATALOG_PAGE_SIZE) + 1;
    catalog.push({
      ...base,
      id: `${base.id}-c${i + 1}`,
      name: pageIndex > 1 ? `${base.name} (${i + 1})` : base.name,
    });
  }
  return catalog;
}

const CATALOG = buildCatalog();

export function getCatalogPageCount(pageSize = CATALOG_PAGE_SIZE): number {
  return Math.max(1, Math.ceil(CATALOG.length / pageSize));
}

export function getCatalogPage(page: number, pageSize = CATALOG_PAGE_SIZE): Profile[] {
  const totalPages = getCatalogPageCount(pageSize);
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return CATALOG.slice(start, start + pageSize);
}

export function getProfileById(profileId: string): Profile | null {
  const baseId = getProfileBaseId(profileId);
  return BASE_PROFILES.find((profile) => profile.id === baseId) ?? null;
}

export function getProfileBaseId(profileId: string): string {
  return profileId.split("-")[0] ?? profileId;
}
