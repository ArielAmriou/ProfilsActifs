import { z } from "zod";

export const profileVideoSchema = z.object({
  status: z.enum(["PROCESSING", "READY", "ERROR"]),
  providerName: z.string(),
  playbackUrl: z.string().nullable(),
  size: z.number().nullable(),
});

export const profileSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  firstname: z.string(),
  lastname: z.string(),
  title: z.string().nullable(),
  sector: z.string().nullable(),
  location: z.string().nullable(),
  skills: z.array(z.string()),
  certified: z.boolean(),
  favorites: z.number(),
  video: profileVideoSchema,
});

export const profileListSchema = z.object({
  profiles: z.array(profileSchema),
});

export const profileIdParamSchema = z.object({ id: z.uuid() });

export const profileErrorSchema = z.object({ error: z.string() });
