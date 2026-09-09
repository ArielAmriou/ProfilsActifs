import type { UserRole } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { publishNotificationOncePerActor } from "../notifications/service";
import { FavoriteProfileNotFoundError } from "./errors";

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

export async function setFavorite(
  recruiterId: string,
  profileId: string,
): Promise<FavoriteUser> {
  const jobseeker = await prisma.users.findFirst({
    where: { id: profileId, role: "jobseeker" },
    select: FAVORITE_USER_SELECT,
  });

  if (!jobseeker) {
    throw new FavoriteProfileNotFoundError(profileId);
  }

  const alreadyFavorited = await prisma.favorites.findUnique({
    where: {
      favoritedUserId_userId: { favoritedUserId: profileId, userId: recruiterId },
    },
  });

  await prisma.favorites.upsert({
    where: {
      favoritedUserId_userId: { favoritedUserId: profileId, userId: recruiterId },
    },
    create: { favoritedUserId: profileId, userId: recruiterId },
    update: {},
  });

  if (!alreadyFavorited) {
    await publishNotificationOncePerActor({
      recipientId: profileId,
      actorId: recruiterId,
      type: "FAVORITE_ADDED",
      payload: { profileId },
    });
  }

  return jobseeker;
}

export async function getFavorites(recruiterId: string): Promise<FavoriteUser[]> {
  const favorites = await prisma.favorites.findMany({
    where: { userId: recruiterId },
    select: { favoritedUser: { select: FAVORITE_USER_SELECT } },
    orderBy: { createdAt: "desc" },
  });

  return favorites.map((favorite) => favorite.favoritedUser);
}

export async function deleteFavorite(
  recruiterId: string,
  profileId: string,
): Promise<boolean> {
  const { count } = await prisma.favorites.deleteMany({
    where: { favoritedUserId: profileId, userId: recruiterId },
  });

  return count > 0;
}
