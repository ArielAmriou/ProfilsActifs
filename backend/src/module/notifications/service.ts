import type { NotificationType, Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { pushToClient } from "./registry";

const NOTIFICATION_SELECT = {
  id: true,
  type: true,
  payload: true,
  createdAt: true,
  actor: {
    select: { id: true, firstname: true, lastname: true, name: true, image: true, role: true },
  },
} as const;

export interface CreateNotificationInput {
  recipientId: string;
  actorId?: string | null;
  type: NotificationType;
  payload: Record<string, unknown>;
}

/**
 * Ne jette jamais : une notification qui échoue ne doit pas casser l'action principale
 * (favori, mise à jour de profil, upload vidéo) qui l'a déclenchée.
 */
export async function publishNotification(input: CreateNotificationInput): Promise<void> {
  try {
    const row = await prisma.notifications.create({
      data: {
        recipientId: input.recipientId,
        actorId: input.actorId ?? null,
        type: input.type,
        payload: input.payload as Prisma.InputJsonValue,
      },
      select: NOTIFICATION_SELECT,
    });

    pushToClient(input.recipientId, row.type, row.id, row);
  } catch (error) {
    console.error("notification publish failed", error);
  }
}

export async function getNotificationsSince(userId: string, since?: Date) {
  return prisma.notifications.findMany({
    where: { recipientId: userId, ...(since ? { createdAt: { gt: since } } : {}) },
    select: NOTIFICATION_SELECT,
    orderBy: { createdAt: "asc" },
  });
}
