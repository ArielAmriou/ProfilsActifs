import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../lib/prisma";

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/health",
    {
      schema: {
        tags: ["health"],
        summary: "API health status",
        description: "Checks that the API is responding and the database is reachable.",
        response: {
          200: z.object({ status: z.literal("ok"), uptime: z.number(), version: z.literal("0.1.0") }),
          503: z.object({
            status: z.literal("error"),
            message: z.string(),
          }),
        },
      },
    },
    async (_request, reply) => {
      try {
        await prisma.users.findFirst();
        return reply.code(200).send({ status: "ok", uptime: process.uptime(), version: "0.1.0" });
      } catch (error) {
        fastify.log.error(error, "Database health check failed");
        return reply
          .code(503)
          .send({ status: "error", message: "Database connection failed" });
      }
    },
  );
}