"use client";

import type { VideoDescriptor } from "@/lib/videos";
import { isPlayable } from "@/lib/videos";
import { notifyVideoPlaying } from "@/lib/video-playback";
import { VideoUnavailable } from "./VideoUnavailable";

interface VideoPlayerProps {
  video: VideoDescriptor;
  label: string;
  className?: string;
  subtitlesUrl?: string;
}

export function VideoPlayer({ video, label, className = "", subtitlesUrl }: VideoPlayerProps) {
  if (!isPlayable(video)) {
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
      onPlay={(e) => notifyVideoPlaying(e.currentTarget)}
    >
      {subtitlesUrl && (
        <track kind="subtitles" src={subtitlesUrl} srcLang="fr" label="Français" default />
      )}
      Votre navigateur ne supporte pas la lecture vidéo.
    </video>
  );
}
