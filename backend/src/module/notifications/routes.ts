import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getSessionUser } from "../../middleware/session";
import { registerClient } from "./registry";
import { getNotificationsSince } from "./service";
import { notificationErrorSchema, notificationStreamQuerySchema } from "./schemas";

const HEARTBEAT_MS = 20_000;

export async function notificationRoutes(fastify: FastifyInstance) {
  const typed = fastify.withTypeProvider<ZodTypeProvider>();

  typed.get(
    "/api/notifications/stream",
    {
      schema: {
        tags: ["notifications"],
        summary: "Server-Sent Events stream of the current user's notifications",
        description:
          "Ouvre une connexion Server-Sent Events (text/event-stream) qui reste ouverte. " +
          "À la connexion, rejoue d'abord les notifications du destinataire créées après " +
          "`since` (lues en base, non destructif), puis pousse en direct toute nouvelle " +
          "notification tant que la connexion reste ouverte. Chaque message SSE porte un " +
          "champ `id` (uuid de la notification), un `event` (un des types de " +
          "`NotificationType`) et un `data` au format JSON du schéma de notification. " +
          "Un commentaire heartbeat (`: ping`) est envoyé toutes les 20s pour éviter la " +
          "coupure de connexions idle par un proxy. Authentification par cookie de session " +
          "uniquement (EventSource ne supporte pas les en-têtes personnalisés).",
        querystring: notificationStreamQuerySchema,
        response: { 401: notificationErrorSchema },
      },
    },
    async (request, reply) => {
      const user = await getSessionUser(request);

      if (!user) {
        return reply.status(401).send({ error: "Non authentifié" });
      }

      reply.raw.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });

      const since = request.query.since ? new Date(request.query.since) : undefined;
      const missed = await getNotificationsSince(user.id, since);

      for (const notification of missed) {
        reply.raw.write(
          `id: ${notification.id}\nevent: ${notification.type}\ndata: ${JSON.stringify(notification)}\n\n`,
        );
      }

      const unregister = registerClient(user.id, { write: (chunk) => reply.raw.write(chunk) });
      const heartbeat = setInterval(() => reply.raw.write(": ping\n\n"), HEARTBEAT_MS);

      request.raw.on("close", () => {
        clearInterval(heartbeat);
        unregister();
      });
    },
  );
}
