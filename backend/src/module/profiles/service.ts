import { prisma } from "../../lib/prisma";
import { CGU_VERSION } from "../../config/cgu";
import { isOfLegalWorkAge, UNDERAGE_MESSAGE } from "../../lib/age";
import { describeVideo, type VideoDescriptor } from "../video/service";

const NO_VIDEO: VideoDescriptor = {
  status: "ERROR",
  providerName: "none",
  playbackUrl: null,
  size: null,
};

const SELECTION = {
  id: true,
  name: true,
  firstname: true,
  lastname: true,
  title: true,
  sector: true,
  location: true,
  availability: true,
  skills: true,
  certified: true,
  updatedAt: true,
  videos: {
    select: {
      id: true,
      providerName: true,
      providerId: true,
      status: true,
      size: true,
    },
  },
  _count: { select: { favoritesReceived: true } },
} as const;

type JobseekerRow = Awaited<ReturnType<typeof findJobseekers>>[number];

export interface PublicProfile {
  id: string;
  name: string;
  firstname: string;
  lastname: string;
  title: string | null;
  sector: string | null;
  location: string | null;
  availability: string | null;
  skills: string[];
  certified: boolean;
  favorites: number;
  updatedAt: string;
  videoId: string | null;
  video: VideoDescriptor;
}

function findJobseekers() {
  return prisma.users.findMany({
    where: {
      role: "jobseeker",
      cguAcceptedAt: { not: null },
      profileHidden: false,
      // Catalogue public : uniquement les profils dont la vidéo a été validée.
      videos: { is: { status: "READY" } },
    },
    select: SELECTION,
    orderBy: [
      { updatedAt: "desc" },
      { favoritesReceived: { _count: "desc" } },
    ],
  });
}

async function toPublicProfile(row: JobseekerRow): Promise<PublicProfile> {
  const { videos, _count, updatedAt, ...user } = row;

  return {
    ...user,
    favorites: _count.favoritesReceived,
    updatedAt: updatedAt.toISOString(),
    videoId: videos?.id ?? null,
    video: videos ? await describeVideo(videos) : NO_VIDEO,
  };
}

const CATALOGUE_TTL_MS = Number(process.env.PROFILES_CACHE_TTL_MS ?? 5000);

let catalogue: { expiresAt: number; profiles: PublicProfile[] } | null = null;
let inFlight: Promise<PublicProfile[]> | null = null;

async function buildCatalogue(): Promise<PublicProfile[]> {
  return Promise.all((await findJobseekers()).map(toPublicProfile));
}

export function invalidateCatalogue(): void {
  catalogue = null;
}

export async function listJobseekerProfiles(): Promise<PublicProfile[]> {
  if (catalogue && catalogue.expiresAt > Date.now()) {
    return catalogue.profiles;
  }

  if (inFlight) {
    return inFlight;
  }

  inFlight = buildCatalogue();

  try {
    const profiles = await inFlight;
    catalogue = { expiresAt: Date.now() + CATALOGUE_TTL_MS, profiles };
    return profiles;
  } finally {
    inFlight = null;
  }
}

export type ProfileAccess =
  | { status: "ok"; profile: PublicProfile }
  | { status: "hidden" }
  | { status: "missing" };

export async function getJobseekerProfileAccess(id: string): Promise<ProfileAccess> {
  const row = await prisma.users.findFirst({
    where: {
      id,
      role: "jobseeker",
      cguAcceptedAt: { not: null },
    },
    select: { ...SELECTION, profileHidden: true },
  });

  if (!row) {
    return { status: "missing" };
  }

  if (row.profileHidden) {
    return { status: "hidden" };
  }

  if (!row.videos || row.videos.status !== "READY") {
    return { status: "missing" };
  }

  const { profileHidden: _hidden, ...publicRow } = row;
  return { status: "ok", profile: await toPublicProfile(publicRow) };
}

export async function getJobseekerProfile(id: string): Promise<PublicProfile | null> {
  const access = await getJobseekerProfileAccess(id);
  return access.status === "ok" ? access.profile : null;
}

export interface OwnProfile {
  id: string;
  email: string;
  role: string;
  firstname: string;
  lastname: string;
  name: string;
  birthdate: string;
  title: string | null;
  sector: string | null;
  location: string | null;
  availability: string | null;
  skills: string[];
  certified: boolean;
  profileHidden: boolean;
  favorites: number;
  cguAcceptedAt: string | null;
  cguVersion: string | null;
}

export interface OwnProfilePatch {
  firstname?: string;
  lastname?: string;
  name?: string;
  birthdate?: string;
  title?: string | null;
  sector?: string | null;
  location?: string | null;
  availability?: string | null;
  skills?: string[];
  profileHidden?: boolean;
}

const OWN_SELECTION = {
  id: true,
  email: true,
  role: true,
  firstname: true,
  lastname: true,
  name: true,
  birthdate: true,
  title: true,
  sector: true,
  location: true,
  availability: true,
  skills: true,
  certified: true,
  profileHidden: true,
  cguAcceptedAt: true,
  cguVersion: true,
  _count: { select: { favoritesReceived: true } },
} as const;

type OwnRow = NonNullable<Awaited<ReturnType<typeof findOwnRow>>>;

function findOwnRow(id: string) {
  return prisma.users.findUnique({ where: { id }, select: OWN_SELECTION });
}

function toOwnProfile(row: OwnRow): OwnProfile {
  const { _count, birthdate, role, cguAcceptedAt, ...user } = row;

  return {
    ...user,
    role: String(role),
    birthdate: birthdate.toISOString().slice(0, 10),
    favorites: _count.favoritesReceived,
    cguAcceptedAt: cguAcceptedAt ? cguAcceptedAt.toISOString() : null,
  };
}

export async function setCguConsent(id: string, accepted: boolean): Promise<OwnProfile> {
  const row = await prisma.users.update({
    where: { id },
    data: {
      cguAcceptedAt: accepted ? new Date() : null,
      cguVersion: accepted ? CGU_VERSION : null,
      updatedAt: new Date(),
    },
    select: OWN_SELECTION,
  });

  invalidateCatalogue();
  return toOwnProfile(row);
}

export async function getOwnProfile(id: string): Promise<OwnProfile | null> {
  const row = await findOwnRow(id);
  return row ? toOwnProfile(row) : null;
}

export async function updateOwnProfile(
  id: string,
  patch: OwnProfilePatch,
): Promise<OwnProfile> {
  const { birthdate, ...rest } = patch;

  if (birthdate) {
    const parsed = new Date(`${birthdate}T12:00:00`);
    if (Number.isNaN(parsed.getTime()) || !isOfLegalWorkAge(parsed)) {
      throw new Error(UNDERAGE_MESSAGE);
    }
  }

  const row = await prisma.users.update({
    where: { id },
    data: {
      ...rest,
      ...(birthdate ? { birthdate: new Date(birthdate) } : {}),
      updatedAt: new Date(),
    },
    select: OWN_SELECTION,
  });

  invalidateCatalogue();
  return toOwnProfile(row);
}

export interface ProfileViewRow {
  organization: string;
  viewedAt: string;
}

/** Recruteurs ayant consulté le profil : organisation + date/heure uniquement. */
export async function listProfileViewsForUser(userId: string): Promise<ProfileViewRow[]> {
  const rows = await prisma.notifications.findMany({
    where: { recipientId: userId, type: "PROFILE_VIEWED" },
    select: {
      createdAt: true,
      payload: true,
      actor: { select: { organization: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return rows.map((row) => {
    const payload =
      row.payload && typeof row.payload === "object" && !Array.isArray(row.payload)
        ? (row.payload as Record<string, unknown>)
        : {};
    const fromPayload =
      typeof payload.organization === "string" ? payload.organization.trim() : "";
    const fromActor = row.actor?.organization?.trim() ?? "";
    const organization = fromPayload || fromActor || "Organisation non renseignée";

    return {
      organization,
      viewedAt: row.createdAt.toISOString(),
    };
  });
}
