import Fastify from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { db } from "./prisma/db";

const DEFAULT_PORT = 8081;
const HOST = "0.0.0.0";
const ADMIN_TOKEN = "admin";

const errorSchema = z.object({
  statusCode: z.number(),
  error: z.string(),
  message: z.string(),
});

const candidateSchema = z.object({
  email: z.string().email(),
  age: z.number().min(16),
});

const candidateParamsSchema = z.object({
  id: z.string().uuid(),
});

const featuredProfileSchema = z.object({ id: z.string() });

function createApp() {
  const fastify = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();

  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);
  fastify.setErrorHandler((error, _request, reply) => {
    const validationError = error as {
      validation?: unknown;
      validationContext?: string;
      message?: string;
    };

    if (validationError.validation) {
      const statusCode = validationError.validationContext === "body" ? 422 : 400;

      return reply.code(statusCode).send({
        statusCode,
        error: statusCode === 422 ? "Unprocessable Entity" : "Bad Request",
        message: validationError.message ?? "Request validation failed",
      });
    }

    return reply.send(error);
  });

  fastify.register(fastifySwagger, {
    openapi: {
      openapi: "3.0.0",
      info: {
        title: "ProfilsActifs",
        description:
          "ProfilsActifs directly connects certified talent with recruiters through authentic video presentations.",
        version: "1.0.0",
      },
    },
  });

  fastify.register(fastifySwaggerUi, { routePrefix: "/docs" });

  fastify.get("/", async () => ({ hello: "world", runtime: "bun" }));

  fastify.get(
    "/health",
    {
      schema: {
        response: {
          200: z.object({ status: z.literal("ok"), uptime: z.number() }),
          503: z.object({
            status: z.literal("error"),
            message: z.string(),
          }),
        },
      },
    },
    async (_request, reply) => {
      try {
        await db.orm.public.Users.first();
        return reply.code(200).send({ status: "ok", uptime: process.uptime() });
      } catch (error) {
        fastify.log.error(error, "Database health check failed");
        return reply
          .code(503)
          .send({ status: "error", message: "Database connection failed" });
      }
    },
  );

  fastify.post(
    "/api/candidats",
    {
      schema: {
        description: "Create a candidate profile",
        body: candidateSchema,
        response: {
          201: z.object({ id: z.string().uuid() }),
          400: errorSchema.describe("Bad Request - Missing parameters"),
          422: errorSchema.describe(
            "Unprocessable Entity - Invalid format (e.g. invalid email)",
          ),
        },
      },
    },
    async (_request, reply) =>
      reply.code(201).send({ id: "123e4567-e89b-12d3-a456-426614174000" }),
  );

  fastify.get(
    "/api/profils-mis-en-avant",
    {
      schema: {
        description: "Retrieve featured profiles (authentication required)",
        headers: z.object({ authorization: z.string().optional() }),
        response: {
          200: z.array(featuredProfileSchema),
          401: errorSchema.describe("Unauthorized - Missing token"),
          403: errorSchema.describe("Forbidden - Access denied"),
        },
      },
    },
    async (request, reply) => {
      const authorization = request.headers.authorization;

      if (!authorization) {
        return reply.code(401).send({
          statusCode: 401,
          error: "Unauthorized",
          message: "Authentication token is missing",
        });
      }

      if (authorization !== `Bearer ${ADMIN_TOKEN}`) {
        return reply.code(403).send({
          statusCode: 403,
          error: "Forbidden",
          message: "Insufficient permissions to view this profile",
        });
      }

      return reply.code(200).send([{ id: "profil-1" }]);
    },
  );

  fastify.get(
    "/api/candidats/:id",
    {
      schema: {
        description: "Retrieve a specific candidate",
        params: candidateParamsSchema,
        response: {
          200: z.object({ email: z.string() }),
          400: errorSchema.describe("Bad Request - Malformed UUID"),
          404: errorSchema.describe("Not Found - Candidate does not exist"),
        },
      },
    },
    async (_request, reply) =>
      reply.code(404).send({
        statusCode: 404,
        error: "Not Found",
        message: "No candidate found with this identifier",
      }),
  );

  return fastify;
}

export const app = createApp();

export async function start() {
  try {
    const port = Number(process.env.PORT ?? 8081);

    await app.ready();
    await app.listen({ port, host: "0.0.0.0" });
    app.log.info(`Server running at http://localhost:${port}`);
  } catch (error) {
    app.log.error(error, "Unable to start the server");
    process.exit(1);
  }
}

if (import.meta.main) {
  await start();
}