import { describe, expect, test } from "bun:test";
import { stat } from "node:fs/promises";
import { join } from "node:path";
import { videoConfig } from "../src/config/video";
import { VideoProviderUnavailableError } from "../src/module/video/errors";
import { fakeVideoProvider, localVideoProvider } from "../src/module/video/provider";
import { isStreamingProvider, type VideoProvider, type VideoUpload } from "../src/module/video/provider/types";

const SAMPLE: VideoUpload = {
  filename: "presentation.mp4",
  mimeType: "video/mp4",
  data: Buffer.from("Competences+ sample video payload"),
};

interface ProviderContract {
  provider: VideoProvider;
  reachable: boolean;
}

async function bytesExist(id: string): Promise<boolean> {
  try {
    await stat(join(videoConfig.storagePath, id));
    return true;
  } catch {
    return false;
  }
}

async function expectUnavailable(action: () => Promise<unknown>, name: string): Promise<void> {
  await expect(action()).rejects.toBeInstanceOf(VideoProviderUnavailableError);
  await expect(action()).rejects.toThrow(name);
}

function runContract({ provider, reachable }: ProviderContract): void {
  describe(`VideoProvider contract: ${provider.name}`, () => {
    test("exposes the four operations of the interface", () => {
      expect(typeof provider.store).toBe("function");
      expect(typeof provider.status).toBe("function");
      expect(typeof provider.playbackUrl).toBe("function");
      expect(typeof provider.delete).toBe("function");
    });

    test("store returns an opaque identifier, or reports the provider unavailable", async () => {
      if (!reachable) {
        await expectUnavailable(() => provider.store(SAMPLE), provider.name);
        return;
      }

      const id = await provider.store(SAMPLE);

      expect(id).not.toContain(SAMPLE.filename);
      expect(id).not.toContain("/");
      expect(id).toMatch(/^[0-9a-f-]{36}$/i);
    });

    test("status answers without throwing, so a profile page never breaks", async () => {
      const id = reachable ? await provider.store(SAMPLE) : "9f1c4d2e-0000-4000-8000-000000000000";
      const status = await provider.status(id);

      expect(["PROCESSING", "READY", "ERROR"]).toContain(status);
      expect(status).toBe(reachable ? "READY" : "ERROR");
    });

    test("playbackUrl resolves an application URL, or reports the provider unavailable", async () => {
      if (!reachable) {
        await expectUnavailable(
          () => provider.playbackUrl("9f1c4d2e-0000-4000-8000-000000000000"),
          provider.name,
        );
        return;
      }

      const id = await provider.store(SAMPLE);
      const url = await provider.playbackUrl(id);

      expect(url).toContain(id);
      expect(url.startsWith("http")).toBe(true);
    });

    test("delete erases the payload, or reports the provider unavailable", async () => {
      if (!reachable) {
        await expectUnavailable(
          () => provider.delete("9f1c4d2e-0000-4000-8000-000000000000"),
          provider.name,
        );
        return;
      }

      const id = await provider.store(SAMPLE);
      expect(await bytesExist(id)).toBe(true);

      await provider.delete(id);

      expect(await bytesExist(id)).toBe(false);
      expect(await provider.status(id)).toBe("ERROR");
    });

    test("delete is replayable on an already removed identifier", async () => {
      if (!reachable) {
        await expectUnavailable(
          () => provider.delete("9f1c4d2e-0000-4000-8000-000000000000"),
          provider.name,
        );
        return;
      }

      const id = await provider.store(SAMPLE);
      await provider.delete(id);

      await expect(provider.delete(id)).resolves.toBeUndefined();
    });

    test("rejects identifiers that try to escape the storage directory", async () => {
      if (!isStreamingProvider(provider)) {
        return;
      }

      await expect(provider.status("../../etc/passwd")).rejects.toThrow("Invalid video identifier");
      await expect(provider.delete("../../etc/passwd")).rejects.toThrow("Invalid video identifier");
    });
  });
}

runContract({ provider: localVideoProvider, reachable: true });
runContract({ provider: fakeVideoProvider, reachable: false });
