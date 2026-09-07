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
