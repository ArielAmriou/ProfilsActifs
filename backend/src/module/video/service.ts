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
}

interface VideoRecord {
  providerName: string;
  providerId: string;
  status: VideoStatus;
}

function degraded(record: VideoRecord, status: VideoStatus): VideoDescriptor {
  return { status, providerName: record.providerName, playbackUrl: null };
}

export async function describeVideo(record: VideoRecord): Promise<VideoDescriptor> {
  const provider = findVideoProvider(record.providerName);

  if (!provider) {
    return degraded(record, "PROCESSING");
  }

  try {
    const status = await provider.status(record.providerId);

    if (status !== "READY") {
      return degraded(record, status);
    }

    return {
      status,
      providerName: record.providerName,
      playbackUrl: await provider.playbackUrl(record.providerId),
    };
  } catch {
    return degraded(record, "ERROR");
  }
}

export async function getUserVideo(userId: string): Promise<VideoDescriptor | null> {
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

  const record = await prisma.videos.upsert({
    where: { userId },
    create: { userId, providerName: provider.name, providerId, status: "READY" },
    update: { providerName: provider.name, providerId, status: "READY" },
  });

  if (previous) {
    await discardPayload(previous.providerName, previous.providerId);
  }

  return describeVideo(record);
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
