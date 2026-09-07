import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getJobseekerProfile, listJobseekerProfiles } from "./service";
import {
  profileErrorSchema,
  profileIdParamSchema,
  profileListSchema,
  profileSchema,
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

      return reply.send(profile);
    },
  );
}
