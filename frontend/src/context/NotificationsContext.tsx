"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/context/AuthContext";
import {
  deleteNotification as deleteNotificationApi,
  fetchNotifications,
  fetchUnreadNotificationCount,
  markAllNotificationsRead as markAllReadApi,
  subscribeNotifications,
  type AppNotification,
} from "@/lib/notifications-api";

interface NotificationsContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  markAllReadOnLeave: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, role, isLoading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idsRef = useRef(new Set<string>());
  const enabled = isAuthenticated && role === "jobseeker";

  const prepend = useCallback((notification: AppNotification) => {
    if (idsRef.current.has(notification.id)) return;
    idsRef.current.add(notification.id);
    setNotifications((current) => [notification, ...current]);
    if (!notification.read) {
      setUnreadCount((count) => count + 1);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setNotifications([]);
      setUnreadCount(0);
      idsRef.current = new Set();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [list, count] = await Promise.all([
        fetchNotifications(),
        fetchUnreadNotificationCount(),
      ]);
      idsRef.current = new Set(list.map((item) => item.id));
      setNotifications(list);
      setUnreadCount(count);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Impossible de charger les notifications.",
      );
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (authLoading) return;

    if (!enabled) {
      setNotifications([]);
      setUnreadCount(0);
      idsRef.current = new Set();
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [list, count] = await Promise.all([
          fetchNotifications(),
          fetchUnreadNotificationCount(),
        ]);
        if (cancelled) return;
        idsRef.current = new Set(list.map((item) => item.id));
        setNotifications(list);
        setUnreadCount(count);
        const since = new Date().toISOString();
        unsubscribe = subscribeNotifications(since, prepend);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Impossible de charger les notifications.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [authLoading, enabled, prepend]);

  const deleteNotification = useCallback(async (id: string) => {
    setNotifications((current) => {
      const target = current.find((item) => item.id === id);
      if (target && !target.read) {
        setUnreadCount((count) => Math.max(0, count - 1));
      }
      return current.filter((item) => item.id !== id);
    });
    idsRef.current.delete(id);

    try {
      await deleteNotificationApi(id);
    } catch {
      await refresh();
    }
  }, [refresh]);

  const markAllReadOnLeave = useCallback(async () => {
    if (!enabled) return;

    setUnreadCount(0);
    setNotifications((current) => {
      const now = new Date().toISOString();
      return current.map((item) =>
        item.read ? item : { ...item, read: true, readAt: now },
      );
    });

    try {
      await markAllReadApi();
    } catch {
      await refresh();
    }
  }, [enabled, refresh]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      error,
      refresh,
      deleteNotification,
      markAllReadOnLeave,
    }),
    [
      notifications,
      unreadCount,
      loading,
      error,
      refresh,
      deleteNotification,
      markAllReadOnLeave,
    ],
  );

  return (
    <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextValue {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationsProvider");
  }
  return context;
}
