"use client";

import { useEffect } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { CandidateDisclaimerBanner } from "@/components/CandidateDisclaimerBanner";
import { HeaderBar } from "@/components/HeaderBar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { RequireRole } from "@/components/RequireRole";
import { ContentCard } from "@/components/layout/ContentCard";
import { PageLayout } from "@/components/layout/PageLayout";
import { useNotifications } from "@/context/NotificationsContext";
import {
  formatNotificationDate,
  notificationMessage,
  type AppNotification,
} from "@/lib/notifications-api";

function UnreadDot() {
  return (
    <span
      className="mt-0.5 flex size-5 shrink-0 items-center justify-center"
      title="Non lue"
      aria-label="Non lue"
    >
      <span className="size-2.5 rounded-full bg-action" />
    </span>
  );
}

function ReadCheck() {
  return (
    <span
      className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-institutional/10 text-institutional"
      title="Lue"
      aria-label="Lue"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-3.5" fill="currentColor">
        <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
      </svg>
    </span>
  );
}

function NotificationItem({
  notification,
  onDelete,
}: {
  notification: AppNotification;
  onDelete: (id: string) => void;
}) {
  const isFavorite = notification.type === "FAVORITE_ADDED";

  return (
    <li className="rounded-xl border-2 border-border bg-content-bg p-4">
      <div className="flex items-start gap-3">
        {notification.read ? <ReadCheck /> : <UnreadDot />}
        <span
          className={`font-title mt-0.5 shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white ${
            isFavorite ? "bg-action" : "bg-institutional"
          }`}
        >
          {isFavorite ? "Favori" : "Vue"}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-relaxed text-institutional">
            {notificationMessage(notification)}
          </p>
          <p className="mt-1.5 text-xs text-institutional/60">
            {formatNotificationDate(notification.createdAt)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onDelete(notification.id)}
          aria-label="Supprimer la notification"
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-institutional/60 transition hover:bg-institutional/10 hover:text-institutional"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="currentColor">
            <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
      </div>
    </li>
  );
}

export default function NotificationsPage() {
  const {
    notifications,
    loading,
    error,
    refresh,
    deleteNotification,
    markAllReadOnLeave,
  } = useNotifications();

  useEffect(() => {
    void refresh();
    return () => {
      void markAllReadOnLeave();
    };
  }, [markAllReadOnLeave, refresh]);

  return (
    <>
      <PageLayout hideSidebarOnMobile sidebar={<AppSidebar />}>
        <RequireRole allowed={["jobseeker"]}>
          <CandidateDisclaimerBanner />
          <HeaderBar className="pointer-events-none relative z-30 flex items-center justify-end gap-3 px-4 py-3 lg:px-8" />
          <div className="flex flex-1 flex-col px-6 py-10 lg:px-10">
            <ContentCard className="w-full max-w-2xl">
              <h1 className="font-title text-2xl font-bold text-institutional">
                Notifications
              </h1>
              <p className="mt-2 text-sm text-institutional/80">
                Suivez l&apos;intérêt des recruteurs pour votre profil et votre vidéo.
              </p>

              {loading && (
                <p className="mt-8 text-sm text-institutional" role="status">
                  Chargement des notifications…
                </p>
              )}

              {error && (
                <p role="alert" className="mt-8 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
                  {error}
                </p>
              )}

              {!loading && !error && notifications.length === 0 && (
                <p className="mt-8 rounded-xl border-2 border-dashed border-border px-4 py-8 text-center text-sm text-institutional/70">
                  Aucune notification pour le moment.
                </p>
              )}

              {!loading && notifications.length > 0 && (
                <ul className="mt-8 space-y-3" aria-live="polite">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onDelete={(id) => {
                        void deleteNotification(id);
                      }}
                    />
                  ))}
                </ul>
              )}
            </ContentCard>
          </div>
        </RequireRole>
      </PageLayout>
      <MobileBottomNav />
    </>
  );
}
