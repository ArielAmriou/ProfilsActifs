import Fastify from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();
const fastify = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();

fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);

const start = async () => {
  try {
    await fastify.register(fastifySwagger, {
      openapi: {
        openapi: '3.0.0',
        info: {
          title: 'API JibJob',
          description: 'Spécification technique du démonstrateur',
          version: '1.0.0'
        }
      }
    });

    await fastify.register(fastifySwaggerUi, {
      routePrefix: '/docs'
    });

    fastify.get("/", async (request, reply) => {
      return { hello: "world", runtime: "bun" };
    });

    fastify.get("/health", async (request, reply) => {
      try {
        await prisma.$queryRaw`SELECT 1`;
        return reply.code(200).send({ status: "ok", uptime: process.uptime() });
      } catch (error) {
        return reply.code(503).send({ status: "error", message: "Database connection failed" });
      }
    });

    await fastify.listen({ port: 8081, host: "0.0.0.0" });
    console.log("Server running at http://localhost:8081");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();