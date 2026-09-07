import { VideoProviderUnavailableError } from "../errors";
import type { VideoProvider, VideoStatus } from "./types";

export const FAKE_PROVIDER_NAME = "fake";

function unavailable(): never {
  throw new VideoProviderUnavailableError(FAKE_PROVIDER_NAME);
}

export const fakeVideoProvider: VideoProvider = {
  name: FAKE_PROVIDER_NAME,

  async store(): Promise<string> {
    return unavailable();
  },

  async status(): Promise<VideoStatus> {
    return "ERROR";
  },

  async playbackUrl(): Promise<string> {
    return unavailable();
  },

  async delete(): Promise<void> {
    return unavailable();
  },
};
