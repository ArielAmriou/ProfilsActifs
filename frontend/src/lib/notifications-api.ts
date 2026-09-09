import { apiFetch } from "@/lib/api";

export type NotificationType = "FAVORITE_ADDED" | "PROFILE_VIEWED";

export interface NotificationActor {
  id: string;
  firstname: string;
  lastname: string;
  name: string;
  image: string | null;
  role: string;
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  actor: NotificationActor | null;
  payload: Record<string, unknown>;
  createdAt: string;
  readAt: string | null;
  read: boolean;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8081";

export async function fetchNotifications(): Promise<AppNotification[]> {
  const data = await apiFetch<{ notifications: AppNotification[] }>("/api/notifications");
  return data.notifications;
}

export async function fetchUnreadNotificationCount(): Promise<number> {
  const data = await apiFetch<{ count: number }>("/api/notifications/unread-count");
  return data.count;
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiFetch("/api/notifications/read", { method: "POST", body: JSON.stringify({}) });
}

export async function deleteNotification(id: string): Promise<void> {
  await apiFetch(`/api/notifications/${id}`, { method: "DELETE" });
}

function parseNotification(raw: unknown): AppNotification | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  if (typeof record.id !== "string" || typeof record.type !== "string") return null;
  if (record.type !== "FAVORITE_ADDED" && record.type !== "PROFILE_VIEWED") return null;

  const readAt = typeof record.readAt === "string" ? record.readAt : null;
  const read = typeof record.read === "boolean" ? record.read : Boolean(readAt);

  return {
    id: record.id,
    type: record.type,
    actor: (record.actor as NotificationActor | null) ?? null,
    payload:
      record.payload && typeof record.payload === "object"
        ? (record.payload as Record<string, unknown>)
        : {},
    createdAt:
      typeof record.createdAt === "string"
        ? record.createdAt
        : new Date().toISOString(),
    readAt,
    read,
  };
}

/** SSE live : ne rejoue que les notifs strictement après `since` (ISO). */
export function subscribeNotifications(
  since: string | undefined,
  onNotification: (notification: AppNotification) => void,
): () => void {
  const url = new URL(`${API_BASE_URL}/api/notifications/stream`);
  if (since) {
    url.searchParams.set("since", since);
  }

  const source = new EventSource(url.toString(), { withCredentials: true });

  const handle = (event: MessageEvent) => {
    try {
      const parsed = parseNotification(JSON.parse(event.data));
      if (parsed) onNotification(parsed);
    } catch {
      // ignore malformed payloads
    }
  };

  source.addEventListener("FAVORITE_ADDED", handle);
  source.addEventListener("PROFILE_VIEWED", handle);

  return () => {
    source.removeEventListener("FAVORITE_ADDED", handle);
    source.removeEventListener("PROFILE_VIEWED", handle);
    source.close();
  };
}

export function actorDisplayName(actor: NotificationActor | null): string {
  if (!actor) return "Un recruteur";
  const full = `${actor.firstname} ${actor.lastname}`.trim();
  return full || actor.name || "Un recruteur";
}

export function notificationMessage(notification: AppNotification): string {
  const who = actorDisplayName(notification.actor);
  if (notification.type === "FAVORITE_ADDED") {
    return `${who} a ajouté votre profil à ses favoris.`;
  }
  return `${who} a consulté votre profil.`;
}

export function formatNotificationDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
