import { z } from "zod";
import { videoDescriptorSchema } from "../video/schemas";

export const adminUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string(),
  name: z.string(),
  role: z.string(),
  createdAt: z.string(),
});

export const adminVideoRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  userName: z.string(),
  video: videoDescriptorSchema,
  createdAt: z.string(),
});

export const adminUsersResponseSchema = z.object({
  users: z.array(adminUserSchema),
});

export const adminPendingVideosResponseSchema = z.object({
  videos: z.array(adminVideoRecordSchema),
});

export const adminSuccessSchema = z.object({ success: z.boolean() });
export const adminErrorSchema = z.object({ error: z.string() });
export const adminIdParamSchema = z.object({ id: z.string().uuid() });