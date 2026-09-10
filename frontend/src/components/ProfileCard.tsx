"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { Profile } from "@/lib/profiles-api";
import { useAuth } from "@/context/AuthContext";
import { useProfileInteractions } from "@/hooks/useProfileInteractions";
import { isPlayable } from "@/lib/videos";
import { notifyVideoPlaying, clearVideoPlaying } from "@/lib/video-playback";
import { VideoUnavailable } from "@/components/video/VideoUnavailable";
import type { LoginPromptAction } from "@/components/LoginPromptModal";
import { CertifiedBadge } from "@/components/Certif";

interface ProfileCardProps {
  profile: Profile;
  onRequireLogin: (actionLabel: LoginPromptAction) => void;
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5"
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
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="currentColor">
      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
    </svg>
  );
}

export function ProfileCard({ profile, onRequireLogin }: ProfileCardProps) {
  const { isAuthenticated, role } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const video = profile.video;
  const playable = isPlayable(video);
  const interactionId = profile.id;
  const { favorited, toggleFavorite } = useProfileInteractions(interactionId, profile.likes);

  const canInteract = isAuthenticated && role === "recruiter";

  const handleVideoClick = async () => {
    if (!isAuthenticated) {
      onRequireLogin("visionner cette vidéo");
      return;
    }
    if (!playable || !videoRef.current) return;

    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
      return;
    }
    try {
      await videoRef.current.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  };

  const handleFavorite = () => {
    if (!canInteract) {
      onRequireLogin("ajouter ce profil à vos favoris");
      return;
    }
    void toggleFavorite();
  };

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border-2 border-border bg-surface shadow-sm">
      <div className="relative aspect-[9/16] bg-institutional">
        {playable ? (
          <video
            ref={videoRef}
            src={video.playbackUrl ?? undefined}
            playsInline
            preload="metadata"
            className="absolute inset-0 size-full object-cover"
            aria-label={`Vidéo de présentation de ${profile.name}`}
            onPlay={(e) => notifyVideoPlaying(e.currentTarget)}
            onPause={(e) => {
              setPlaying(false);
              clearVideoPlaying(e.currentTarget);
            }}
            onEnded={(e) => {
              setPlaying(false);
              clearVideoPlaying(e.currentTarget);
            }}
          >
            {profile.subtitlesUrl && (
              <track
                kind="subtitles"
                src={profile.subtitlesUrl}
                srcLang="fr"
                label="Français"
              />
            )}
          </video>
        ) : (
          <VideoUnavailable video={video} className="absolute inset-0" />
        )}

        <button
          type="button"
          onClick={() => void handleVideoClick()}
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 transition hover:bg-black/30"
          aria-label={
            playing
              ? `Mettre en pause la vidéo de ${profile.name}`
              : `Lire la vidéo de ${profile.name}`
          }
        >
          {!playing && (
            <span className="flex size-14 items-center justify-center rounded-full bg-action text-white shadow-lg">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-7" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          )}
        </button>

        {profile.certified && <CertifiedBadge className="absolute left-3 top-3 z-20" />}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs text-institutional/70">
          {profile.sector} · {profile.location}
        </p>

        <div className="mt-auto flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-title truncate text-base font-bold text-institutional">
              {profile.name}
            </h2>
            <p className="font-title mt-0.5 truncate text-sm font-semibold text-institutional/80">
              {profile.title}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleFavorite}
              aria-pressed={favorited}
              aria-label={favorited ? "Retirer des favoris" : "Ajouter aux favoris"}
              className={`flex size-9 items-center justify-center rounded-full border-2 transition ${
                favorited
                  ? "border-action bg-action text-white"
                  : "border-border bg-surface text-institutional hover:border-action hover:text-action"
              }`}
            >
              <BookmarkIcon filled={favorited} />
            </button>
            <Link
              href={`/profils/${profile.id}`}
              aria-label={`Voir le profil de ${profile.name}`}
              className="flex size-9 items-center justify-center rounded-full border-2 border-border bg-surface text-institutional no-underline transition hover:border-action hover:text-action"
            >
              <PersonIcon />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
