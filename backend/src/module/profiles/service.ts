import { prisma } from "../../lib/prisma";
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
      providerName: true,
      providerId: true,
      status: true,
      size: true,
      _count: { select: { favorites: true } },
    },
  },
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
  video: VideoDescriptor;
}

function findJobseekers() {
  return prisma.users.findMany({
    where: { role: "jobseeker" },
    select: SELECTION,
    orderBy: { createdAt: "asc" },
  });
}

async function toPublicProfile(row: JobseekerRow): Promise<PublicProfile> {
  const { videos, ...user } = row;

  return {
    ...user,
    favorites: videos?._count.favorites ?? 0,
    video: videos ? await describeVideo(videos) : NO_VIDEO,
  };
}

export async function listJobseekerProfiles(): Promise<PublicProfile[]> {
  return Promise.all((await findJobseekers()).map(toPublicProfile));
}

export async function getJobseekerProfile(id: string): Promise<PublicProfile | null> {
  const row = await prisma.users.findFirst({
    where: { id, role: "jobseeker" },
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
  videos: { select: { _count: { select: { favorites: true } } } },
} as const;

type OwnRow = NonNullable<Awaited<ReturnType<typeof findOwnRow>>>;

function findOwnRow(id: string) {
  return prisma.users.findUnique({ where: { id }, select: OWN_SELECTION });
}

function toOwnProfile(row: OwnRow): OwnProfile {
  const { videos, birthdate, role, ...user } = row;

  return {
    ...user,
    role: String(role),
    birthdate: birthdate.toISOString().slice(0, 10),
    favorites: videos?._count.favorites ?? 0,
  };
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
