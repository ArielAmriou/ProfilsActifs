import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getSessionUser } from "../../middleware/session";
import { FavoriteVideoNotFoundError } from "./errors";
import { deleteFavorite, getFavorites, setFavorite } from "./service";
import {
  favoriteDeletionSchema,
  favoriteErrorSchema,
  favoriteListSchema,
  favoriteParamsSchema,
  favoriteUserSchema,
} from "./schemas";

export async function favoriteRoutes(fastify: FastifyInstance) {
  const typed = fastify.withTypeProvider<ZodTypeProvider>();

  typed.post(
    "/api/favorites/:videoId",
    {
      schema: {
        tags: ["favorite"],
        summary: "Add a video's owner to the current recruiter's favorites",
        params: favoriteParamsSchema,
        response: {
          201: favoriteUserSchema,
          401: favoriteErrorSchema,
          403: favoriteErrorSchema,
          404: favoriteErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const user = await getSessionUser(request);

      if (!user) {
        return reply.status(401).send({ error: "Non authentifié" });
      }

      if (user.role !== "recruiter") {
        return reply.status(403).send({ error: "Réservé aux recruteurs" });
      }

      try {
        const favorite = await setFavorite(user.id, request.params.videoId);
        return reply.status(201).send(favorite);
      } catch (error) {
        if (error instanceof FavoriteVideoNotFoundError) {
          return reply.status(404).send({ error: "Vidéo introuvable" });
        }
        throw error;
      }
    },
  );

  typed.get(
    "/api/favorites",
    {
      schema: {
        tags: ["favorite"],
        summary: "List the current recruiter's favorited users",
        response: { 200: favoriteListSchema, 401: favoriteErrorSchema, 403: favoriteErrorSchema },
      },
    },
    async (request, reply) => {
      const user = await getSessionUser(request);

      if (!user) {
        return reply.status(401).send({ error: "Non authentifié" });
      }

      if (user.role !== "recruiter") {
        return reply.status(403).send({ error: "Réservé aux recruteurs" });
      }

      return reply.send({ items: await getFavorites(user.id) });
    },
  );

  typed.delete(
    "/api/favorites/:videoId",
    {
      schema: {
        tags: ["favorite"],
        summary: "Remove a video's owner from the current recruiter's favorites",
        params: favoriteParamsSchema,
        response: {
          200: favoriteDeletionSchema,
          401: favoriteErrorSchema,
          403: favoriteErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const user = await getSessionUser(request);

      if (!user) {
        return reply.status(401).send({ error: "Non authentifié" });
      }

      if (user.role !== "recruiter") {
        return reply.status(403).send({ error: "Réservé aux recruteurs" });
      }

      return reply.send({ deleted: await deleteFavorite(user.id, request.params.videoId) });
    },
  );
}
