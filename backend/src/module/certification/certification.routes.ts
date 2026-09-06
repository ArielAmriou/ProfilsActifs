import type { FastifyInstance } from "fastify";
import { getCertificationData } from "../../services/certification.service";

export async function certificationRoutes(fastify: FastifyInstance)
{
    fastify.route({
        method: ["GET"],
        url: "/api/certification/questions",
        schema: {
            tags: ["certification"],
            summary: "Route to get certification questions",
            description: "Get the questions of the certification"
        },
        handler: async (request, reply) => {
            const certifData = getCertificationData();
            reply.send(certifData);
        }
    });
}
