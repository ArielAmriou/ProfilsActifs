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

export const myProfileSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  role: z.string(),
  firstname: z.string(),
  lastname: z.string(),
  name: z.string(),
  birthdate: z.iso.date(),
  title: z.string().nullable(),
  sector: z.string().nullable(),
  location: z.string().nullable(),
  skills: z.array(z.string()),
  certified: z.boolean(),
  favorites: z.number(),
  cguAcceptedAt: z.string().nullable(),
  cguVersion: z.string().nullable(),
});

export const cguConsentSchema = z.object({ accepted: z.boolean() });

const optionalText = z.string().trim().max(255).nullish();

export const updateMyProfileSchema = z.object({
  firstname: z.string().trim().min(1).max(255).optional(),
  lastname: z.string().trim().min(1).max(255).optional(),
  name: z.string().trim().min(1).max(255).optional(),
  birthdate: z.iso.date().optional(),
  title: optionalText,
  sector: optionalText,
  location: optionalText,
  skills: z.array(z.string().trim().min(1).max(255)).max(30).optional(),
});
