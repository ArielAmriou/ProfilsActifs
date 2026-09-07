import { readFile, rm, stat } from "node:fs/promises";
import { extname, isAbsolute, join, relative, resolve } from "node:path";
import { videoConfig } from "../../config/video";

const MIME_BY_EXTENSION: Record<string, string> = {
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".m4v": "video/x-m4v",
  ".ogv": "video/ogg",
};

const DEFAULT_MIME_TYPE = "video/mp4";
const EXTERNAL_URL_PATTERN = /^[a-z][a-z0-9+.-]*:\/\//i;

export function legacyMimeType(link: string): string {
  return MIME_BY_EXTENSION[extname(link).toLowerCase()] ?? DEFAULT_MIME_TYPE;
}

export function resolveLegacyPath(link: string): string | null {
  if (EXTERNAL_URL_PATTERN.test(link)) {
    return null;
  }

  const candidate = resolve(join(videoConfig.legacyRoot, link));
  const inside = relative(videoConfig.legacyRoot, candidate);

  if (inside.startsWith("..") || isAbsolute(inside)) {
    return null;
  }

  return candidate;
}

export async function readLegacyFile(path: string): Promise<Buffer | null> {
  try {
    const info = await stat(path);
    if (!info.isFile()) {
      return null;
    }
    return await readFile(path);
  } catch {
    return null;
  }
}

export async function removeLegacyFile(path: string): Promise<void> {
  await rm(path, { force: true });
}
