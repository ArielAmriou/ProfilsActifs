import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getCertificationData } from "../../services/certification.service";
import { certificationFileSchema } from "../../lib/certification-schema";

export async function certificationRoutes(fastify: FastifyInstance) {
    fastify.withTypeProvider<ZodTypeProvider>().route({
        method: ["GET"],
        url: "/api/certification/questions",
        schema: {
            tags: ["Certification"],
            summary: "Route to get certification questions",
            description: "Get the questions of the certification",
            response: {
                200: certificationFileSchema,
            },
        },
        handler: async (_request, reply) => {
            const certifData = await getCertificationData();
            return reply.send(certifData);
        },
    });
}