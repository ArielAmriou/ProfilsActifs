import { z } from "zod";

export const videoDescriptorSchema = z.object({
  status: z.enum(["PROCESSING", "READY", "ERROR"]),
  providerName: z.string(),
  playbackUrl: z.string().nullable(),
  size: z.number().nullable(),
});

export const videoErrorSchema = z.object({ error: z.string() });

export const providerIdParamSchema = z.object({ providerId: z.string() });

export const userIdParamSchema = z.object({ userId: z.uuid() });

export const videoDeletionSchema = z.object({ deleted: z.boolean() });
