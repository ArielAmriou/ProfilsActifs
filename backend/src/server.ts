import { app } from "./app";

const DEFAULT_PORT = 8081;
const HOST = "0.0.0.0";

export async function start() {
  try {
    const port = Number(process.env.PORT ?? DEFAULT_PORT);

    await app.ready();
    await app.listen({ port, host: HOST });
    app.log.info(`Server running at http://localhost:${port}`);
  } catch (error) {
    app.log.error(error, "Unable to start the server");
    process.exit(1);
  }
}