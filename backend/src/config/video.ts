import { resolve } from "node:path";

const DEFAULT_PROVIDER = "local";
const DEFAULT_STORAGE_PATH = "var/videos";
const DEFAULT_LEGACY_ROOT = "../frontend/public";
const DEFAULT_BASE_URL = "http://localhost:8081";
const DEFAULT_MAX_UPLOAD_BYTES = 100 * 1024 * 1024;

export const videoConfig = {
  providerName: process.env.VIDEO_PROVIDER ?? DEFAULT_PROVIDER,
  storagePath: resolve(process.env.VIDEO_STORAGE_PATH ?? DEFAULT_STORAGE_PATH),
  legacyRoot: resolve(process.env.VIDEO_LEGACY_ROOT ?? DEFAULT_LEGACY_ROOT),
  baseUrl: (process.env.BETTER_AUTH_URL ?? DEFAULT_BASE_URL).replace(/\/+$/, ""),
  maxUploadBytes: Number(process.env.VIDEO_MAX_UPLOAD_BYTES ?? DEFAULT_MAX_UPLOAD_BYTES),
};

export const LEGACY_PROVIDER_NAME = "legacy";
