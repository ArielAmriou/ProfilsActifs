import { z } from "zod";

export const favoriteParamsSchema = z.object({
  videoId: z.uuid(),
});

export const favoriteUserSchema = z.object({
  id: z.uuid(),
  firstname: z.string(),
  lastname: z.string(),
  name: z.string(),
  image: z.string().nullable(),
  role: z.enum(["jobseeker", "recruiter", "admin"]),
});

export const favoriteListSchema = z.object({
  items: z.array(favoriteUserSchema),
});

export const favoriteDeletionSchema = z.object({ deleted: z.boolean() });

export const favoriteErrorSchema = z.object({ error: z.string() });
