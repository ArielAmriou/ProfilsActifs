"use client";

import { useEffect, useRef, useState } from "react";
import type { Profile } from "@/data/profiles";
import { ActionBar } from "./ActionBar";
import { ProfileOverlay } from "./ProfileOverlay";

interface VideoSlideProps {
  profile: Profile;
  isActive: boolean;
}

export function VideoSlide({ profile, isActive }: VideoSlideProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    if (isActive) {
      video.play().catch(() => undefined);
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [isActive]);

  return (
    <article
      className="feed-slide relative flex h-[100dvh] w-full items-start justify-center px-2 pt-1 pb-14 lg:pb-1"
      aria-label={`Profil de ${profile.name}`}
    >
      <div className="flex shrink-0 items-center gap-3 sm:gap-4">
        <div className="relative aspect-[9/16] h-[calc(100dvh-3.25rem)] w-auto max-w-[calc(100vw-4.5rem)] shrink-0 overflow-hidden rounded-2xl border-2 border-border bg-black shadow-lg lg:h-[calc(100dvh-0.5rem)] lg:max-w-none">
          <video
            ref={videoRef}
            src={profile.videoLink}
            muted={muted}
            loop
            playsInline
            preload="auto"
            className="absolute inset-0 z-0 size-full object-cover"
            aria-label={`Vidéo de présentation de ${profile.name}`}
          >
            {profile.subtitlesUrl && (
              <track
                kind="subtitles"
                src={profile.subtitlesUrl}
                srcLang="fr"
                label="Français"
                default
              />
            )}
          </video>

          <ProfileOverlay profile={profile} />

          <div className="absolute right-3 top-3 z-20 flex items-center gap-2">
            {profile.certified && (
              <span
                className="font-title shrink-0 rounded-full bg-action px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white"
                aria-label="Profil certifié"
              >
                Certifié
              </span>
            )}
            <button
              type="button"
              onClick={() => setMuted((value) => !value)}
              aria-pressed={!muted}
              aria-label={muted ? "Activer le son" : "Couper le son"}
              tabIndex={isActive ? 0 : -1}
              className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-white/30 bg-institutional/80 text-white transition hover:bg-institutional"
            >
            {muted ? (
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="currentColor">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
              </svg>
            ) : (
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.06c1.48-.73 2.5-2.25 2.5-4.03zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
            )}
            </button>
          </div>
        </div>

        <ActionBar profileId={profile.id} initialLikes={profile.likes} profileName={profile.name} isActive={isActive} />
      </div>
    </article>
  );
}
