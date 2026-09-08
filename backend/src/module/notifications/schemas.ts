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
  readAt: z.iso.datetime().nullable(),
  read: z.boolean(),
});

export const notificationStreamQuerySchema = z.object({
  since: z.iso.datetime().optional(),
});

export const notificationListSchema = z.object({
  notifications: z.array(notificationSchema),
});

export const notificationUnreadCountSchema = z.object({
  count: z.number().int().nonnegative(),
});

export const notificationIdParamSchema = z.object({
  id: z.uuid(),
});

export const notificationMutationSchema = z.object({
  ok: z.boolean(),
  count: z.number().int().nonnegative().optional(),
});

export const notificationErrorSchema = z.object({ error: z.string() });
