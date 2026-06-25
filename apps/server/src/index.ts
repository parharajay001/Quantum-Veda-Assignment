import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "@repo/logger";

const app = createApp();

app.listen(env.port, () => {
  logger.info("server listening", {
    port: env.port,
    url: `http://localhost:${env.port}`,
  });
});
