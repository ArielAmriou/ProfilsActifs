// module/auth/routes.ts
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { fromNodeHeaders } from "better-auth/node";
import { z } from "zod";
import { auth } from "./../../middleware/better-auth";

const userSchema = z.object({
  id: z.string(),
  email: z.email(),
  name: z.string(),
  emailVerified: z.boolean(),
  image: z.string().nullable().optional(),
  firstname: z.string(),
  lastname: z.string(),
  role: z.string(),
  birthdate: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export async function authRoutes(fastify: FastifyInstance) {
  fastify.route({
    method: ["GET", "POST"],
    url: "/api/auth/*",
    schema: {
      tags: ["auth"],
      summary: "better-auth endpoints (sign-up, sign-in, sign-out, sessions, ...)",
      description:
        "All routes exposed by better-auth (email/password, session management, etc.). " +
        "The full, detailed OpenAPI schema for these endpoints is available at `/api/auth/reference`.",
      hide: true,
    },
    async handler(request, reply) {
      try {
        const url = new URL(request.url, `http://${request.headers.host}`);
        const headers = fromNodeHeaders(request.headers);

        const req = new Request(url.toString(), {
          method: request.method,
          headers,
          ...(request.body ? { body: JSON.stringify(request.body) } : {}),
        });

        const response = await auth.handler(req);

        reply.status(response.status);
        response.headers.forEach((value, key) => reply.header(key, value));
        reply.send(response.body ? await response.text() : null);
      } catch (error) {
        fastify.log.error(error, "Authentication error");
        reply.status(500).send({
          error: "Internal authentication error",
          code: "AUTH_FAILURE",
        });
      }
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/api/me",
    {
      schema: {
        tags: ["auth"],
        summary: "Current user",
        description: "Returns the authenticated user based on the better-auth session cookie.",
        response: {
          200: z.object({ user: userSchema }),
          401: z.object({ error: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(request.headers),
      });
      if (!session?.user) {
        return reply.status(401).send({ error: "Non authentifié" });
      }
      return reply.send({ user: session.user });
    },
  );
}