"use client";

import { useEffect, useState } from "react";
import { fetchProfileVideo, NO_VIDEO, type VideoDescriptor } from "@/lib/videos";

const RESOLVING: VideoDescriptor = {
  status: "PROCESSING",
  providerName: "pending",
  playbackUrl: null,
  size: null,
};

export function useProfileVideo(ownerId?: string): VideoDescriptor {
  const [video, setVideo] = useState<VideoDescriptor>(ownerId ? RESOLVING : NO_VIDEO);

  useEffect(() => {
    if (!ownerId) {
      setVideo(NO_VIDEO);
      return;
    }

    let active = true;
    setVideo(RESOLVING);

    fetchProfileVideo(ownerId).then((descriptor) => {
      if (active) {
        setVideo(descriptor);
      }
    });

    return () => {
      active = false;
    };
  }, [ownerId]);

  return video;
}
