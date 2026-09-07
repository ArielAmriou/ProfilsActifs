import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getSessionUser } from "../../middleware/session";
import { getUserFeed } from "./service";
import { feedQuerySchema, userErrorSchema, userFeedSchema } from "./schemas";

export async function userRoutes(fastify: FastifyInstance) {
  const typed = fastify.withTypeProvider<ZodTypeProvider>();

  typed.get(
    "/api/users",
    {
      schema: {
        tags: ["user"],
        summary: "Paginated feed of user profiles",
        description: "Returns user profiles ordered by most recent, 20 per page.",
        querystring: feedQuerySchema,
        response: { 200: userFeedSchema, 401: userErrorSchema },
      },
    },
    async (request, reply) => {
      const user = await getSessionUser(request);

      if (!user) {
        return reply.status(401).send({ error: "Non authentifié" });
      }

      return reply.send(await getUserFeed(request.query.page));
    },
  );
}
