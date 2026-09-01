import Fastify from "fastify";

const fastify = Fastify({ logger: true });

fastify.get("/", async (request, reply) => {
    return { hello: "world", runtime: "bun" };
});

fastify.get("/health", async (request, reply) => {
    return { status: "ok", uptime: process.uptime() };
});

const start = async () => {
    try {
        await fastify.listen({ port: 8081, host: "0.0.0.0" });
        console.log("Server running at http://localhost:8081");
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();