import { z } from "zod";

export const notificationTypeSchema = z.enum(["FAVORITE_ADDED", "PROFILE_VIEWED"]);

const notificationActorSchema = z.object({
  id: z.uuid(),
  firstname: z.string(),
  lastname: z.string(),
  name: z.string(),
  image: z.string().nullable(),
  role: z.enum(["jobseeker", "recruiter", "admin"]),
});

export const notificationSchema = z.object({
  id: z.uuid(),
  type: notificationTypeSchema,
  actor: notificationActorSchema.nullable(),
  payload: z.record(z.string(), z.unknown()),
  createdAt: z.iso.datetime(),
});

export const notificationStreamQuerySchema = z.object({
  since: z.iso.datetime().optional(),
});

export const notificationErrorSchema = z.object({ error: z.string() });
