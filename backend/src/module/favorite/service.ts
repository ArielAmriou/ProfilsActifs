import type { UserRole } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { publishNotification } from "../notifications/service";
import { FavoriteVideoNotFoundError } from "./errors";

export interface FavoriteUser {
  id: string;
  firstname: string;
  lastname: string;
  name: string;
  image: string | null;
  role: UserRole;
}

const FAVORITE_USER_SELECT = {
  id: true,
  firstname: true,
  lastname: true,
  name: true,
  image: true,
  role: true,
} as const;

export async function setFavorite(recruiterId: string, videoId: string): Promise<FavoriteUser> {
  const video = await prisma.videos.findUnique({
    where: { id: videoId },
    select: { userId: true, user: { select: FAVORITE_USER_SELECT } },
  });

  if (!video) {
    throw new FavoriteVideoNotFoundError(videoId);
  }

  const alreadyFavorited = await prisma.favorites.findUnique({
    where: { videoId_userId: { videoId, userId: recruiterId } },
  });

  await prisma.favorites.upsert({
    where: { videoId_userId: { videoId, userId: recruiterId } },
    create: { videoId, userId: recruiterId },
    update: {},
  });

  if (!alreadyFavorited) {
    await publishNotification({
      recipientId: video.userId,
      actorId: recruiterId,
      type: "FAVORITE_ADDED",
      payload: { videoId },
    });
  }

  return video.user;
}

export async function getFavorites(recruiterId: string): Promise<FavoriteUser[]> {
  const favorites = await prisma.favorites.findMany({
    where: { userId: recruiterId },
    select: { video: { select: { user: { select: FAVORITE_USER_SELECT } } } },
    orderBy: { video: { createdAt: "desc" } },
  });

  return favorites.map((favorite) => favorite.video.user);
}

export async function deleteFavorite(recruiterId: string, videoId: string): Promise<boolean> {
  const { count } = await prisma.favorites.deleteMany({
    where: { videoId, userId: recruiterId },
  });

  return count > 0;
}
