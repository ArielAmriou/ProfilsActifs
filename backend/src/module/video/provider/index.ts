import { videoConfig } from "../../../config/video";
import { UnknownVideoProviderError } from "../errors";
import { fakeVideoProvider } from "./fake";
import { localVideoProvider } from "./local";
import type { VideoProvider } from "./types";

const REGISTRY: Record<string, VideoProvider> = {
  [localVideoProvider.name]: localVideoProvider,
  [fakeVideoProvider.name]: fakeVideoProvider,
};

export function findVideoProvider(name: string): VideoProvider | null {
  return REGISTRY[name] ?? null;
}

export function getVideoProvider(name: string = videoConfig.providerName): VideoProvider {
  const provider = findVideoProvider(name);

  if (!provider) {
    throw new UnknownVideoProviderError(name);
  }

  return provider;
}

export { fakeVideoProvider, localVideoProvider };
export * from "./types";
