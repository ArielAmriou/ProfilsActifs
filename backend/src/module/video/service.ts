import { prisma } from "../../lib/prisma";
import { videoConfig } from "../../config/video";
import { VideoNotFoundError } from "./errors";
import { findVideoProvider, getVideoProvider } from "./provider";
import { isStreamingProvider } from "./provider/types";
import type {
  ByteRange,
  StreamingVideoProvider,
  VideoPayloadHead,
  VideoPlayback,
  VideoStatus,
  VideoUpload,
} from "./provider/types";

export interface VideoDescriptor {
  status: VideoStatus;
  providerName: string;
  playbackUrl: string | null;
  size: number | null;
}

interface VideoRecord {
  providerName: string;
  providerId: string;
  status: VideoStatus;
  size: number | null;
}

function degraded(record: VideoRecord, status: VideoStatus): VideoDescriptor {
  return { status, providerName: record.providerName, playbackUrl: null, size: record.size };
}

export async function describeVideo(
  record: VideoRecord,
  options: { previewWhilePending?: boolean } = {},
): Promise<VideoDescriptor> {
  const provider = findVideoProvider(record.providerName);

  if (!provider) {
    return degraded(record, record.status === "ERROR" ? "ERROR" : "PROCESSING");
  }

  try {
    const providerStatus = await provider.status(record.providerId);

    if (providerStatus !== "READY") {
      return degraded(record, providerStatus);
    }

    const playbackUrl = await provider.playbackUrl(record.providerId);

    // Modération a priori : tant que l'admin n'a pas validé, le statut public reste
    // PROCESSING. L'URL n'est exposée qu'en aperçu (candidat / admin).
    if (record.status === "PROCESSING") {
      return {
        status: "PROCESSING",
        providerName: record.providerName,
        playbackUrl: options.previewWhilePending ? playbackUrl : null,
        size: record.size,
      };
    }

    if (record.status === "ERROR") {
      return degraded(record, "ERROR");
    }

    return {
      status: "READY",
      providerName: record.providerName,
      playbackUrl,
      size: record.size,
    };
  } catch {
    return degraded(record, "ERROR");
  }
}

export async function getUserVideo(userId: string): Promise<VideoDescriptor | null> {
  const record = await prisma.videos.findUnique({ where: { userId } });
  return record ? describeVideo(record, { previewWhilePending: true }) : null;
}

/** Descripteur public : pas d'URL de lecture tant que la vidéo n'est pas READY. */
export async function getPublicVideo(userId: string): Promise<VideoDescriptor | null> {
  const record = await prisma.videos.findUnique({ where: { userId } });
  return record ? describeVideo(record) : null;
}

export async function replaceUserVideo(
  userId: string,
  upload: VideoUpload,
): Promise<VideoDescriptor> {
  const provider = getVideoProvider();
  const providerId = await provider.store(upload);
  const previous = await prisma.videos.findUnique({ where: { userId } });
  const size = upload.data.byteLength;

  const record = await prisma.videos.upsert({
    where: { userId },
    create: { userId, providerName: provider.name, providerId, status: "PROCESSING", size },
    update: { providerName: provider.name, providerId, status: "PROCESSING", size },
  });

  if (previous) {
    await discardPayload(previous.providerName, previous.providerId);
  }

  return describeVideo(record, { previewWhilePending: true });
}

export async function purgeUserVideo(userId: string): Promise<boolean> {
  const record = await prisma.videos.findUnique({ where: { userId } });

  if (!record) {
    return false;
  }

  await prisma.videos.delete({ where: { userId } });
  await discardPayload(record.providerName, record.providerId);
  return true;
}

async function discardPayload(providerName: string, providerId: string): Promise<void> {
  const provider = findVideoProvider(providerName);

  if (!provider) {
    return;
  }

  try {
    await provider.delete(providerId);
  } catch {
    return;
  }
}

async function streamingProviderFor(providerId: string): Promise<StreamingVideoProvider> {
  const record = await prisma.videos.findFirst({ where: { providerId } });

  if (!record) {
    throw new VideoNotFoundError(providerId);
  }

  const provider = findVideoProvider(record.providerName);

  if (!provider || !isStreamingProvider(provider)) {
    throw new VideoNotFoundError(providerId);
  }

  return provider;
}

export async function describePlayback(providerId: string): Promise<VideoPayloadHead> {
  const provider = await streamingProviderFor(providerId);
  return provider.head(providerId);
}

export async function openPlayback(
  providerId: string,
  range?: ByteRange,
): Promise<VideoPlayback> {
  const provider = await streamingProviderFor(providerId);
  return provider.openStream(providerId, range);
}

export function activeProviderName(): string {
  return videoConfig.providerName;
}
