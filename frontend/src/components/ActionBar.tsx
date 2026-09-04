"use client";

import Link from "next/link";
import { useState } from "react";
import { getProfileBaseId } from "@/data/profiles";
import { useAuth } from "@/context/AuthContext";
import { useProfileInteractions } from "@/hooks/useProfileInteractions";
import { LoginPromptModal } from "./LoginPromptModal";

interface ActionBarProps {
  profileId: string;
  initialLikes: number;
  profileName?: string;
  isActive?: boolean;
}

type PendingAction = "like" | "favorite" | null;

function formatCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(".0", "")}K`;
  }
  return String(count);
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-7"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 2}
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-7"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 2}
    >
      <path d="M6 2h12a1 1 0 011 1v19l-7-4-7 4V3a1 1 0 011-1z" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-7"
      fill="currentColor"
    >
      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
    </svg>
  );
}

export function ActionBar({ profileId, initialLikes, profileName, isActive = false }: ActionBarProps) {
  const { isAuthenticated, role } = useAuth();
  const showProfileLink = !isAuthenticated || role === "recruteur";
  const { liked, favorited, likeCount, showLikeCount, toggleLike, toggleFavorite } =
    useProfileInteractions(profileId, initialLikes);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const requireAuth = (action: PendingAction, callback: () => void) => {
    if (!isAuthenticated) {
      setPendingAction(action);
      return;
    }
    callback();
  };

  const actionLabel =
    pendingAction === "like" ? "liker ce profil" : "ajouter ce profil à vos favoris";

  const iconButtonClass = (active: boolean) =>
    active
      ? "border-action bg-action text-white"
      : "border-border bg-surface text-institutional hover:border-action hover:text-action";

  return (
    <>
      <div
        className="flex w-16 shrink-0 flex-col items-center gap-5"
        role="group"
        aria-label="Actions sur le profil"
      >
        <button
          type="button"
          onClick={() => requireAuth("like", toggleLike)}
          aria-pressed={liked}
          tabIndex={isActive ? 0 : -1}
          aria-label={
            showLikeCount
              ? liked
                ? `Retirer le like (${likeCount} likes)`
                : `Ajouter un like (${likeCount} likes)`
              : liked
                ? "Retirer le like"
                : "Ajouter un like"
          }
          className="flex w-full flex-col items-center gap-1"
        >
          <span
            className={`flex size-12 items-center justify-center rounded-full border-2 transition ${iconButtonClass(liked)}`}
          >
            <HeartIcon filled={liked} />
          </span>
          {showLikeCount && (
            <span className="font-title w-full text-center text-sm font-bold tabular-nums text-institutional">
              {formatCount(likeCount)}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => requireAuth("favorite", toggleFavorite)}
          aria-pressed={favorited}
          tabIndex={isActive ? 0 : -1}
          aria-label={
            profileName
              ? favorited
                ? `Retirer ${profileName} des favoris`
                : `Ajouter ${profileName} aux favoris`
              : favorited
                ? "Retirer des favoris"
                : "Ajouter aux favoris"
          }
          className="flex w-full flex-col items-center gap-1"
        >
          <span
            className={`flex size-12 items-center justify-center rounded-full border-2 transition ${iconButtonClass(favorited)}`}
          >
            <BookmarkIcon filled={favorited} />
          </span>
          <span className="font-title w-full text-center text-sm font-bold text-institutional">
            {favorited ? "Enregistré" : "Favori"}
          </span>
        </button>

        {showProfileLink && (
          <Link
            href={`/profils/${getProfileBaseId(profileId)}`}
            aria-label={profileName ? `Voir le profil de ${profileName}` : "Voir le profil"}
            tabIndex={isActive ? 0 : -1}
            className="flex w-full flex-col items-center gap-1 no-underline"
          >
            <span className="flex size-12 items-center justify-center rounded-full border-2 border-border bg-surface text-institutional transition hover:border-action hover:text-action">
              <PersonIcon />
            </span>
          </Link>
        )}
      </div>

      {pendingAction && (
        <LoginPromptModal
          actionLabel={actionLabel}
          onClose={() => setPendingAction(null)}
        />
      )}
    </>
  );
}
