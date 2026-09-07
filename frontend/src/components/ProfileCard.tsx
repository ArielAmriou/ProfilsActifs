"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { Profile } from "@/data/profiles";
import { getProfileBaseId } from "@/data/profiles";
import { useAuth } from "@/context/AuthContext";
import { useProfileInteractions } from "@/hooks/useProfileInteractions";
import { useProfileVideo } from "@/hooks/useProfileVideo";
import { isPlayable } from "@/lib/videos";
import { VideoUnavailable } from "@/components/video/VideoUnavailable";
import type { LoginPromptAction } from "@/components/LoginPromptModal";

interface ProfileCardProps {
  profile: Profile;
  onRequireLogin: (actionLabel: LoginPromptAction) => void;
}

export function ProfileCard({ profile, onRequireLogin }: ProfileCardProps) {
  const { isAuthenticated, role } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const video = useProfileVideo(profile.videoOwnerId);
  const playable = isPlayable(video);
  const interactionId = getProfileBaseId(profile.id);
  const { liked, favorited, toggleLike, toggleFavorite } = useProfileInteractions(
    interactionId,
    profile.likes,
  );

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

  const handleLike = () => {
    if (!canInteract) {
      onRequireLogin("liker ce profil");
      return;
    }
    toggleLike();
  };

  const handleFavorite = () => {
    if (!canInteract) {
      onRequireLogin("ajouter ce profil à vos favoris");
      return;
    }
    toggleFavorite();
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
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
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

        {profile.certified && (
          <span className="font-title absolute left-3 top-3 z-20 rounded-full bg-action px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Certifié
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h2 className="font-title text-base font-bold text-institutional">{profile.name}</h2>
          <p className="font-title mt-0.5 text-sm font-semibold text-institutional/80">
            {profile.title}
          </p>
          <p className="mt-2 text-xs text-institutional/70">
            {profile.sector} · {profile.location}
          </p>
        </div>

        <div className="mt-auto flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleLike}
            aria-pressed={liked}
            className={`font-title rounded-lg border-2 px-3 py-2 text-xs font-bold transition ${
              liked
                ? "border-action bg-action text-white"
                : "border-border text-institutional hover:border-action"
            }`}
          >
            {liked ? "Aimé" : "J'aime"}
          </button>
          <button
            type="button"
            onClick={handleFavorite}
            aria-pressed={favorited}
            className={`font-title rounded-lg border-2 px-3 py-2 text-xs font-bold transition ${
              favorited
                ? "border-action bg-action text-white"
                : "border-border text-institutional hover:border-action"
            }`}
          >
            {favorited ? "Enregistré" : "Favori"}
          </button>
          <Link
            href={`/profils/${getProfileBaseId(profile.id)}`}
            className="font-title rounded-lg border-2 border-border px-3 py-2 text-xs font-bold text-institutional no-underline transition hover:border-institutional"
          >
            Voir le profil
          </Link>
        </div>
      </div>
    </article>
  );
}
