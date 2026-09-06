import type { FastifyInstance } from "fastify";

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
            //
        }
    });
}
