import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getSessionUser } from "../../middleware/session";
import { publishNotification } from "../notifications/service";
import {
  getJobseekerProfile,
  getOwnProfile,
  listJobseekerProfiles,
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

  typed.patch(
    "/api/me/profile",
    {
      schema: {
        tags: ["profiles"],
        summary: "Update the profile of the current user",
        body: updateMyProfileSchema,
        response: { 200: myProfileSchema, 401: profileErrorSchema },
      },
    },
    async (request, reply) => {
      const user = await getSessionUser(request);

      if (!user) {
        return reply.status(401).send({ error: "Non authentifié" });
      }

      return reply.send(await updateOwnProfile(user.id, request.body));
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
      const profile = await getJobseekerProfile(request.params.id);

      if (!profile) {
        return reply.status(404).send({ error: "Profil introuvable" });
      }

      const viewer = await getSessionUser(request);

      if (viewer && viewer.role === "recruiter" && viewer.id !== profile.id) {
        await publishNotification({
          recipientId: profile.id,
          actorId: viewer.id,
          type: "PROFILE_VIEWED",
          payload: {},
        });
      }

      return reply.send(profile);
    },
  );
}
