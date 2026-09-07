import { randomUUID } from "node:crypto";
import { videoConfig } from "../../../config/video";
import { UnsupportedVideoTypeError, VideoNotFoundError, VideoTooLargeError } from "../errors";
import {
  openVideoStream,
  readVideoMeta,
  removeVideoFiles,
  videoFileSize,
  videoFileState,
  writeVideoFile,
} from "../storage";
import type {
  ByteRange,
  StreamingVideoProvider,
  VideoPayloadHead,
  VideoPlayback,
  VideoStatus,
  VideoUpload,
} from "./types";

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

  async head(id: string): Promise<VideoPayloadHead> {
    const [meta, size] = await Promise.all([readVideoMeta(id), videoFileSize(id)]);

    if (!meta || size === null) {
      throw new VideoNotFoundError(id);
    }

    return { mimeType: meta.mimeType, size };
  },

  async openStream(id: string, range?: ByteRange): Promise<VideoPlayback> {
    const { mimeType, size } = await this.head(id);
    return { stream: openVideoStream(id, range), mimeType, size };
  },
};
