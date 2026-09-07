import { randomUUID } from "node:crypto";
import { videoConfig } from "../../../config/video";
import { UnsupportedVideoTypeError, VideoNotFoundError, VideoTooLargeError } from "../errors";
import {
  openVideoStream,
  readVideoMeta,
  removeVideoFiles,
  videoFileState,
  writeVideoFile,
} from "../storage";
import type { StreamingVideoProvider, VideoPlayback, VideoStatus, VideoUpload } from "./types";

export const LOCAL_PROVIDER_NAME = "local";

const SUPPORTED_MIME_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-m4v",
  "video/ogg",
]);

function assertAcceptable(file: VideoUpload): void {
  if (!SUPPORTED_MIME_TYPES.has(file.mimeType)) {
    throw new UnsupportedVideoTypeError(file.mimeType);
  }
  if (file.data.byteLength > videoConfig.maxUploadBytes) {
    throw new VideoTooLargeError(file.data.byteLength, videoConfig.maxUploadBytes);
  }
}

export const localVideoProvider: StreamingVideoProvider = {
  name: LOCAL_PROVIDER_NAME,

  async store(file: VideoUpload): Promise<string> {
    assertAcceptable(file);
    const id = randomUUID();
    await writeVideoFile(id, file.data, file.mimeType);
    return id;
  },

  async status(id: string): Promise<VideoStatus> {
    const state = await videoFileState(id);
    return state === "MISSING" ? "ERROR" : state;
  },

  async playbackUrl(id: string): Promise<string> {
    return `${videoConfig.baseUrl}/api/videos/${id}/stream`;
  },

  async delete(id: string): Promise<void> {
    await removeVideoFiles(id);
  },

  async openStream(id: string): Promise<VideoPlayback> {
    const meta = await readVideoMeta(id);

    if (!meta || (await videoFileState(id)) !== "READY") {
      throw new VideoNotFoundError(id);
    }

    return { stream: openVideoStream(id), mimeType: meta.mimeType, size: meta.size };
  },
};
