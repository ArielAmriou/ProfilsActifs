"use client";

import type { VideoDescriptor } from "@/lib/videos";
import { canPreviewPending, isPlayable } from "@/lib/videos";
import { VideoUnavailable } from "./VideoUnavailable";

interface VideoPlayerProps {
  video: VideoDescriptor;
  label: string;
  className?: string;
  subtitlesUrl?: string;
  /** Autorise la lecture d'une vidéo encore en PROCESSING (aperçu candidat / admin). */
  allowPendingPreview?: boolean;
}

export function VideoPlayer({
  video,
  label,
  className = "",
  subtitlesUrl,
  allowPendingPreview = false,
}: VideoPlayerProps) {
  const playable = allowPendingPreview ? canPreviewPending(video) : isPlayable(video);

  if (!playable) {
    return <VideoUnavailable video={video} className={className} />;
  }

  return (
    <video
      src={video.playbackUrl ?? undefined}
      controls
      playsInline
      preload="metadata"
      className={className}
      aria-label={label}
    >
      {subtitlesUrl && (
        <track kind="subtitles" src={subtitlesUrl} srcLang="fr" label="Français" default />
      )}
      Votre navigateur ne supporte pas la lecture vidéo.
    </video>
  );
}
