import Fastify from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { healthRoutes } from "./module/health/health";

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

  fastify.get("/", async () => ({ hello: "world", runtime: "bun" }));

  fastify.register(healthRoutes);

  return fastify;
}

export const app = createApp();