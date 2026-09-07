import { z } from "zod";

export const feedQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
});

export const userSummarySchema = z.object({
  id: z.uuid(),
  firstname: z.string(),
  lastname: z.string(),
  name: z.string(),
  image: z.string().nullable(),
  role: z.enum(["jobseeker", "recruiter", "admin"]),
});

export const userFeedSchema = z.object({
  items: z.array(userSummarySchema),
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

export const userErrorSchema = z.object({ error: z.string() });
