import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getSessionUser } from "../../middleware/session";
import {
  getAllUsers,
  deleteUserById,
  getPendingVideos,
  validateVideoById,
  rejectVideoById,
} from "./service";
import {
  adminUsersResponseSchema,
  adminPendingVideosResponseSchema,
  adminSuccessSchema,
  adminErrorSchema,
  adminIdParamSchema,
} from "./schema";

export async function adminRoutes(fastify: FastifyInstance) {
  const typed = fastify.withTypeProvider<ZodTypeProvider>();
  const requireAdmin = async (request: FastifyRequest, reply: FastifyReply) => {
    const user = await getSessionUser(request);
    if (!user || user.role !== "admin") {
      return reply.status(403).send({ error: "Accès refusé. Rôle administrateur requis." });
    }
  };

  // --- ROUTES UTILISATEURS ---

  typed.get(
    "/api/admin/users",
    {
      preHandler: requireAdmin,
      schema: {
        tags: ["admin"],
        summary: "Liste tous les utilisateurs",
        response: { 200: adminUsersResponseSchema, 403: adminErrorSchema },
      },
    },
    async (_request, reply) => {
      const users = await getAllUsers();
      return reply.send({ users });
    }
  );

  typed.delete(
    "/api/admin/users/:id",
    {
      preHandler: requireAdmin,
      schema: {
        tags: ["admin"],
        summary: "Supprime un utilisateur et ses vidéos",
        params: adminIdParamSchema,
        response: { 200: adminSuccessSchema, 403: adminErrorSchema },
      },
    },
    async (request, reply) => {
      await deleteUserById(request.params.id);
      return reply.send({ success: true });
    }
  );

  // --- ROUTES MODÉRATION VIDÉOS ---

  typed.get(
    "/api/admin/videos/pending",
    {
      preHandler: requireAdmin,
      schema: {
        tags: ["admin"],
        summary: "Liste les vidéos en attente de modération (PROCESSING)",
        response: { 200: adminPendingVideosResponseSchema, 403: adminErrorSchema },
      },
    },
    async (_request, reply) => {
      const videos = await getPendingVideos();
      return reply.send({ videos });
    }
  );

  typed.post(
    "/api/admin/videos/:id/validate",
    {
      preHandler: requireAdmin,
      schema: {
        tags: ["admin"],
        summary: "Valide une vidéo (Passe en READY)",
        params: adminIdParamSchema,
        response: { 200: adminSuccessSchema, 403: adminErrorSchema },
      },
    },
    async (request, reply) => {
      await validateVideoById(request.params.id);
      return reply.send({ success: true });
    }
  );

  typed.post(
    "/api/admin/videos/:id/reject",
    {
      preHandler: requireAdmin,
      schema: {
        tags: ["admin"],
        summary: "Refuse et supprime une vidéo",
        params: adminIdParamSchema,
        response: { 200: adminSuccessSchema, 403: adminErrorSchema },
      },
    },
    async (request, reply) => {
      await rejectVideoById(request.params.id);
      return reply.send({ success: true });
    }
  );
}