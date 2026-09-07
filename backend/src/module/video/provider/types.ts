export type VideoStatus = "PROCESSING" | "READY" | "ERROR";

export interface VideoUpload {
  filename: string;
  mimeType: string;
  data: Buffer;
}

export interface VideoPlayback {
  stream: NodeJS.ReadableStream;
  mimeType: string;
  size: number;
}

export interface VideoProvider {
  readonly name: string;
  store(file: VideoUpload): Promise<string>;
  status(id: string): Promise<VideoStatus>;
  playbackUrl(id: string): Promise<string>;
  delete(id: string): Promise<void>;
}

export interface StreamingVideoProvider extends VideoProvider {
  openStream(id: string): Promise<VideoPlayback>;
}

export function isStreamingProvider(
  provider: VideoProvider,
): provider is StreamingVideoProvider {
  return typeof (provider as StreamingVideoProvider).openStream === "function";
}
