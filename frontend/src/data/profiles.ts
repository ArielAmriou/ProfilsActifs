import { EXAMPLE_VIDEO_URL } from "@/data/media";

export interface Profile {
  id: string;
  name: string;
  title: string;
  sector: string;
  location: string;
  skills: string[];
  likes: number;
  videoUrl: string;
  subtitlesUrl?: string;
  certified: boolean;
}

const BASE_PROFILES: Profile[] = [
  {
    id: "1",
    name: "Amine Benali",
    title: "Technicien de maintenance industrielle",
    sector: "Industrie",
    location: "Lyon (69)",
    skills: ["Maintenance préventive", "Automatisme", "Soudure TIG"],
    likes: 142,
    videoUrl: EXAMPLE_VIDEO_URL,
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
    videoUrl: EXAMPLE_VIDEO_URL,
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
    videoUrl: EXAMPLE_VIDEO_URL,
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
    videoUrl: EXAMPLE_VIDEO_URL,
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
    videoUrl: EXAMPLE_VIDEO_URL,
    certified: false,
  },
];

export function getProfileBatch(page: number, pageSize = 3): Profile[] {
  const start = (page % Math.ceil(BASE_PROFILES.length / pageSize)) * pageSize;
  return BASE_PROFILES.slice(start, start + pageSize).map((profile, index) => ({
    ...profile,
    id: `${profile.id}-p${page}-${index}`,
  }));
}

export function getInitialProfiles(): Profile[] {
  return BASE_PROFILES;
}

export function getProfileBaseId(profileId: string): string {
  return profileId.split("-")[0] ?? profileId;
}

export function getProfileById(profileId: string): Profile | null {
  const baseId = getProfileBaseId(profileId);
  return BASE_PROFILES.find((profile) => profile.id === baseId) ?? null;
}
