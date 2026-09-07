import { createReadStream } from "node:fs";
import { mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { videoConfig } from "../../config/video";
import { InvalidVideoIdError } from "./errors";

const STORAGE_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type StorageState = "READY" | "PROCESSING" | "MISSING";

export interface VideoFileMeta {
  mimeType: string;
}

export function isStorageId(value: string): boolean {
  return STORAGE_ID_PATTERN.test(value);
}

function assertStorageId(id: string): void {
  if (!isStorageId(id)) {
    throw new InvalidVideoIdError(id);
  }
}

function bytesPath(id: string): string {
  return join(videoConfig.storagePath, id);
}

function metaPath(id: string): string {
  return join(videoConfig.storagePath, `${id}.json`);
}

function pendingPath(id: string): string {
  return join(videoConfig.storagePath, `${id}.part`);
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

export async function writeVideoFile(
  id: string,
  data: Buffer,
  mimeType: string,
): Promise<VideoFileMeta> {
  assertStorageId(id);
  await mkdir(videoConfig.storagePath, { recursive: true });

  const meta: VideoFileMeta = { mimeType };

  await writeFile(pendingPath(id), data);
  await writeFile(metaPath(id), JSON.stringify(meta));
  await rename(pendingPath(id), bytesPath(id));

  return meta;
}

export async function readVideoMeta(id: string): Promise<VideoFileMeta | null> {
  assertStorageId(id);
  try {
    return JSON.parse(await readFile(metaPath(id), "utf-8")) as VideoFileMeta;
  } catch {
    return null;
  }
}

export async function videoFileSize(id: string): Promise<number | null> {
  assertStorageId(id);
  try {
    const info = await stat(bytesPath(id));
    return info.isFile() ? info.size : null;
  } catch {
    return null;
  }
}

export async function videoFileState(id: string): Promise<StorageState> {
  assertStorageId(id);
  if (await exists(bytesPath(id))) {
    return "READY";
  }
  if (await exists(pendingPath(id))) {
    return "PROCESSING";
  }
  return "MISSING";
}

export function openVideoStream(id: string, range?: { start: number; end: number }) {
  assertStorageId(id);
  return createReadStream(bytesPath(id), range);
}

export async function removeVideoFiles(id: string): Promise<void> {
  assertStorageId(id);
  await Promise.all([
    rm(bytesPath(id), { force: true }),
    rm(metaPath(id), { force: true }),
    rm(pendingPath(id), { force: true }),
  ]);
}
