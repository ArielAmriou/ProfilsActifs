import type { NotificationType, Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { pushToClient } from "./registry";

const NOTIFICATION_SELECT = {
  id: true,
  type: true,
  payload: true,
  createdAt: true,
  readAt: true,
  actor: {
    select: { id: true, firstname: true, lastname: true, name: true, image: true, role: true },
  },
} as const;

type NotificationRow = Prisma.NotificationsGetPayload<{ select: typeof NOTIFICATION_SELECT }>;

export type SerializedNotification = Omit<NotificationRow, "createdAt" | "readAt" | "payload"> & {
  payload: Record<string, unknown>;
  createdAt: string;
  readAt: string | null;
  read: boolean;
};

function serializeNotification(row: NotificationRow): SerializedNotification {
  return {
    id: row.id,
    type: row.type,
    actor: row.actor,
    payload:
      row.payload && typeof row.payload === "object" && !Array.isArray(row.payload)
        ? (row.payload as Record<string, unknown>)
        : {},
    createdAt: row.createdAt.toISOString(),
    readAt: row.readAt ? row.readAt.toISOString() : null,
    read: row.readAt !== null,
  };
}

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

    const serialized = serializeNotification(row);
    pushToClient(input.recipientId, serialized.type, serialized.id, serialized);
  } catch (error) {
    console.error("notification publish failed", error);
  }
}

/**
 * Une seule notification par couple (destinataire, acteur, type).
 * Utile pour PROFILE_VIEWED : évite le spam à chaque consultation de fiche.
 */
export async function publishNotificationOncePerActor(
  input: CreateNotificationInput,
): Promise<void> {
  if (!input.actorId) {
    await publishNotification(input);
    return;
  }

  try {
    const existing = await prisma.notifications.findFirst({
      where: {
        recipientId: input.recipientId,
        actorId: input.actorId,
        type: input.type,
      },
      select: { id: true },
    });

    if (existing) {
      return;
    }

    await publishNotification(input);
  } catch (error) {
    console.error("notification publish (once) failed", error);
  }
}

export async function getNotificationsSince(userId: string, since?: Date) {
  const rows = await prisma.notifications.findMany({
    where: { recipientId: userId, ...(since ? { createdAt: { gt: since } } : {}) },
    select: NOTIFICATION_SELECT,
    orderBy: { createdAt: "asc" },
  });
  return rows.map(serializeNotification);
}

/** Liste paginée pour l'espace candidat (plus récentes en premier). */
export async function listNotificationsForUser(userId: string, limit = 50) {
  const rows = await prisma.notifications.findMany({
    where: { recipientId: userId },
    select: NOTIFICATION_SELECT,
    orderBy: { createdAt: "desc" },
    take: Math.min(Math.max(limit, 1), 100),
  });
  return rows.map(serializeNotification);
}

export async function countUnreadNotifications(userId: string): Promise<number> {
  return prisma.notifications.count({
    where: { recipientId: userId, readAt: null },
  });
}

export async function markAllNotificationsRead(userId: string): Promise<number> {
  const result = await prisma.notifications.updateMany({
    where: { recipientId: userId, readAt: null },
    data: { readAt: new Date() },
  });
  return result.count;
}

export async function deleteNotificationForUser(
  userId: string,
  notificationId: string,
): Promise<boolean> {
  const { count } = await prisma.notifications.deleteMany({
    where: { id: notificationId, recipientId: userId },
  });
  return count > 0;
}
