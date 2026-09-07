import { apiFetch } from "@/lib/api";

export type VideoStatus = "PROCESSING" | "READY" | "ERROR";

export interface VideoDescriptor {
  status: VideoStatus;
  providerName: string;
  playbackUrl: string | null;
}

export const NO_VIDEO: VideoDescriptor = {
  status: "ERROR",
  providerName: "none",
  playbackUrl: null,
};

export const UNREACHABLE_VIDEO: VideoDescriptor = {
  status: "ERROR",
  providerName: "unreachable",
  playbackUrl: null,
};

export function isPlayable(video: VideoDescriptor): boolean {
  return video.status === "READY" && Boolean(video.playbackUrl);
}

export function hasNoVideo(video: VideoDescriptor): boolean {
  return video.providerName === "none";
}

async function readDescriptor(path: string): Promise<VideoDescriptor> {
  try {
    return await apiFetch<VideoDescriptor>(path);
  } catch {
    return UNREACHABLE_VIDEO;
  }
}

export function fetchMyVideo(): Promise<VideoDescriptor> {
  return readDescriptor("/api/videos/me");
}

export function fetchProfileVideo(userId: string): Promise<VideoDescriptor> {
  return readDescriptor(`/api/profiles/${userId}/video`);
}

export function uploadMyVideo(file: File): Promise<VideoDescriptor> {
  return apiFetch<VideoDescriptor>("/api/videos", {
    method: "POST",
    body: file,
    headers: {
      "Content-Type": file.type,
      "x-video-filename": encodeURIComponent(file.name),
    },
  });
}

export function deleteMyVideo(): Promise<{ deleted: boolean }> {
  return apiFetch<{ deleted: boolean }>("/api/videos/me", { method: "DELETE" });
}
