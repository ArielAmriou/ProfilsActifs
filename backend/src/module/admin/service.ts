import { prisma } from "../../lib/prisma";
import { describeVideo, purgeUserVideo } from "../video/service";

export async function getAllUsers() {
  const users = await prisma.users.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
  return users.map((u: { id: string; email: string; name: string; role: string; createdAt: Date }) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
  }));
}

export async function deleteUserById(id: string) {
  const video = await prisma.videos.findUnique({ where: { userId: id } });
  if (video) {
    await purgeUserVideo(id);
  }
  await prisma.users.delete({ where: { id } });
}

export async function getPendingVideos() {
  const records = await prisma.videos.findMany({
    where: { status: "PROCESSING" },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return Promise.all(
    records.map(async (record) => ({
      id: record.id,
      userId: record.userId,
      userName: record.user.name,
      video: await describeVideo(record),
      createdAt: record.createdAt.toISOString(),
    }))
  );
}

export async function validateVideoById(id: string) {
  await prisma.videos.update({
    where: { id },
    data: { status: "READY" },
  });
}

export async function rejectVideoById(id: string) {
  const video = await prisma.videos.findUnique({ where: { id } });
  if (video) {
    await purgeUserVideo(video.userId);
  }
}