import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../lib/prisma";
import { getSessionUser } from "../../middleware/session";
import { publishNotificationOncePerActor } from "../notifications/service";
import {
  getJobseekerProfileAccess,
  getOwnProfile,
  listJobseekerProfiles,
  listProfileViewsForUser,
  setCguConsent,
  updateOwnProfile,
} from "./service";
import {
  cguConsentSchema,
  myProfileSchema,
  profileErrorSchema,
  profileIdParamSchema,
  profileListSchema,
  profileSchema,
  profileViewsResponseSchema,
  updateMyProfileSchema,
} from "./schemas";

export async function profileRoutes(fastify: FastifyInstance) {
  const typed = fastify.withTypeProvider<ZodTypeProvider>();

  typed.get(
    "/api/profiles",
    {
      schema: {
        tags: ["profiles"],
        summary: "Public jobseeker profiles",
        response: { 200: profileListSchema },
      },
    },
    async (_request, reply) => {
      return reply.send({ profiles: await listJobseekerProfiles() });
    },
  );

  typed.get(
    "/api/me/profile",
    {
      schema: {
        tags: ["profiles"],
        summary: "Editable profile of the current user",
        response: { 200: myProfileSchema, 401: profileErrorSchema, 404: profileErrorSchema },
      },
    },
    async (request, reply) => {
      const user = await getSessionUser(request);

      if (!user) {
        return reply.status(401).send({ error: "Non authentifié" });
      }

      const profile = await getOwnProfile(user.id);

      if (!profile) {
        return reply.status(404).send({ error: "Profil introuvable" });
      }

      return reply.send(profile);
    },
  );

  typed.get(
    "/api/me/profile-views",
    {
      schema: {
        tags: ["profiles"],
        summary: "Recruiters who viewed the current jobseeker profile (org + datetime only)",
        response: {
          200: profileViewsResponseSchema,
          401: profileErrorSchema,
          403: profileErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const user = await getSessionUser(request);

      if (!user) {
        return reply.status(401).send({ error: "Non authentifié" });
      }

      if (user.role !== "jobseeker") {
        return reply.status(403).send({ error: "Réservé aux demandeurs d'emploi" });
      }

      return reply.send({ views: await listProfileViewsForUser(user.id) });
    },
  );

  typed.patch(
    "/api/me/profile",
    {
      schema: {
        tags: ["profiles"],
        summary: "Update the profile of the current user",
        body: updateMyProfileSchema,
        response: {
          200: myProfileSchema,
          400: profileErrorSchema,
          401: profileErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const user = await getSessionUser(request);

      if (!user) {
        return reply.status(401).send({ error: "Non authentifié" });
      }

      try {
        return reply.send(await updateOwnProfile(user.id, request.body));
      } catch (error) {
        const message = error instanceof Error ? error.message : "Mise à jour impossible";
        return reply.status(400).send({ error: message });
      }
    },
  );

  typed.put(
    "/api/me/cgu",
    {
      schema: {
        tags: ["profiles"],
        summary: "Accept or revoke the terms of use",
        body: cguConsentSchema,
        response: { 200: myProfileSchema, 401: profileErrorSchema },
      },
    },
    async (request, reply) => {
      const user = await getSessionUser(request);

      if (!user) {
        return reply.status(401).send({ error: "Non authentifié" });
      }

      return reply.send(await setCguConsent(user.id, request.body.accepted));
    },
  );

  typed.get(
    "/api/profiles/:id",
    {
      schema: {
        tags: ["profiles"],
        summary: "Public jobseeker profile detail",
        params: profileIdParamSchema,
        response: { 200: profileSchema, 404: profileErrorSchema },
      },
    },
    async (request, reply) => {
      const access = await getJobseekerProfileAccess(request.params.id);

      if (access.status === "hidden") {
        return reply.status(404).send({
          error: "Profil indisponible",
          code: "PROFILE_HIDDEN",
        });
      }

      if (access.status !== "ok") {
        return reply.status(404).send({ error: "Profil introuvable" });
      }

      const profile = access.profile;
      const viewer = await getSessionUser(request);

      if (viewer && viewer.role === "recruiter" && viewer.id !== profile.id) {
        const actor = await prisma.users.findUnique({
          where: { id: viewer.id },
          select: { organization: true },
        });

        await publishNotificationOncePerActor({
          recipientId: profile.id,
          actorId: viewer.id,
          type: "PROFILE_VIEWED",
          payload: { organization: actor?.organization ?? null },
        });
      }

      return reply.send(profile);
    },
  );
}
