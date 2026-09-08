import { prisma } from "../../lib/prisma";
import { CGU_VERSION } from "../../config/cgu";
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
  skills: true,
  certified: true,
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
  skills: string[];
  certified: boolean;
  favorites: number;
  videoId: string | null;
  video: VideoDescriptor;
}

function findJobseekers() {
  return prisma.users.findMany({
    where: { role: "jobseeker", cguAcceptedAt: { not: null } },
    select: SELECTION,
    orderBy: { createdAt: "asc" },
  });
}

async function toPublicProfile(row: JobseekerRow): Promise<PublicProfile> {
  const { videos, _count, ...user } = row;

  return {
    ...user,
    favorites: _count.favoritesReceived,
    videoId: videos?.id ?? null,
    video: videos ? await describeVideo(videos) : NO_VIDEO,
  };
}

export async function listJobseekerProfiles(): Promise<PublicProfile[]> {
  return Promise.all((await findJobseekers()).map(toPublicProfile));
}

export async function getJobseekerProfile(id: string): Promise<PublicProfile | null> {
  const row = await prisma.users.findFirst({
    where: { id, role: "jobseeker", cguAcceptedAt: { not: null } },
    select: SELECTION,
  });

  return row ? toPublicProfile(row) : null;
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
  skills: string[];
  certified: boolean;
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
  skills?: string[];
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
  skills: true,
  certified: true,
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

  const row = await prisma.users.update({
    where: { id },
    data: {
      ...rest,
      ...(birthdate ? { birthdate: new Date(birthdate) } : {}),
      updatedAt: new Date(),
    },
    select: OWN_SELECTION,
  });

  return toOwnProfile(row);
}
