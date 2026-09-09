import Fastify from "fastify";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { serializerCompiler, validatorCompiler, jsonSchemaTransform } from "fastify-type-provider-zod";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { healthRoutes } from "./module/health/health";
import { authRoutes } from "./module/auth/routes";
import { videoRoutes } from "./module/video/routes";
import { profileRoutes } from "./module/profiles/routes";
import { adminRoutes } from "./module/admin/routes";
import { userRoutes } from "./module/user/routes";
import { favoriteRoutes } from "./module/favorite/routes";
import { auth } from "./middleware/better-auth";
import { getCertificationData } from "./services/certification.service";
import { certificationRoutes } from "./module/certification/certification.routes";

async function createApp() {
  const fastify = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();

  try {
    const certification = await getCertificationData();
    fastify.log.info(`Questionnaire version '${certification.version}' chargé avec succès (${certification.questions.length} questions).`);
  } catch (error) {
    fastify.log.error(error, "Échec critique : impossible de démarrer sans un questionnaire valide.");
    process.exit(1);
  }

  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  const frontendOrigin = process.env.FRONTEND_URL ?? "http://localhost:3000";
  await fastify.register(cors, {
    origin: frontendOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-video-filename"],
  });

  const authOpenApi = await auth.api.generateOpenAPISchema();

  await fastify.register(swagger, {
    openapi: {
      openapi: "3.0.0",
      info: {
        title: "ProfilsActifs API",
        description: "ProfilsActifs backend API.",
        version: "0.1.0",
      },
      tags: [
        { name: "health", description: "API monitoring" },
        { name: "auth", description: "Authentication (better-auth)" },
        { name: "video", description: "Video storage behind the provider abstraction" },
        { name: "profiles", description: "Public jobseeker profiles" },
        { name: "user", description: "User profiles" },
      ],
    },
    transform: jsonSchemaTransform,
    transformObject: (documentObject) => {
      if (!("openapiObject" in documentObject)) return documentObject.swaggerObject;
      const { openapiObject } = documentObject;

      const authPaths = Object.fromEntries(
        Object.entries(authOpenApi.paths).map(([path, operations]) => [
          `/api/auth${path}`,
          Object.fromEntries(
            Object.entries(operations as Record<string, object>).map(([method, operation]) => [
              method,
              { ...operation, tags: ["auth"] },
            ]),
          ),
        ]),
      );

      return {
        ...openapiObject,
        paths: { ...openapiObject.paths, ...authPaths },
        components: {
          ...openapiObject.components,
          schemas: {
            ...openapiObject.components?.schemas,
            ...authOpenApi.components.schemas,
          },
        },
      };
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: "/docs",
  });

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

  await fastify.register(healthRoutes);
  await fastify.register(authRoutes);
  await fastify.register(videoRoutes);
  await fastify.register(profileRoutes);
  await fastify.register(userRoutes);
  await fastify.register(favoriteRoutes);
  await fastify.register(certificationRoutes);
  await fastify.register(adminRoutes);
  return fastify;
}

export const app = await createApp();