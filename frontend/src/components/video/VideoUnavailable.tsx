import type { VideoDescriptor } from "@/lib/videos";
import { hasNoVideo } from "@/lib/videos";

interface VideoUnavailableProps {
  video: VideoDescriptor;
  className?: string;
}

interface Notice {
  title: string;
  detail: string;
}

const PROCESSING: Notice = {
  title: "Vidéo en cours de validation",
  detail:
    "Un administrateur doit valider cette vidéo avant sa publication dans le catalogue. Le reste du profil est consultable.",
};

const UNAVAILABLE: Notice = {
  title: "Vidéo temporairement indisponible",
  detail: "L'hébergeur vidéo ne répond pas. Le reste du profil est consultable.",
};

const ABSENT: Notice = {
  title: "Aucune vidéo",
  detail: "Ce profil n'a pas encore déposé de vidéo de présentation.",
};

function noticeFor(video: VideoDescriptor): Notice {
  if (hasNoVideo(video)) {
    return ABSENT;
  }
  return video.status === "PROCESSING" ? PROCESSING : UNAVAILABLE;
}

export function VideoUnavailable({ video, className = "" }: VideoUnavailableProps) {
  const notice = noticeFor(video);

  return (
    <div
      role="status"
      className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-content-bg px-6 py-10 text-center ${className}`}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-8 text-institutional/50" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
      </svg>
      <p className="font-title text-sm font-bold text-institutional">{notice.title}</p>
      <p className="max-w-xs text-xs text-institutional/70">{notice.detail}</p>
    </div>
  );
}
