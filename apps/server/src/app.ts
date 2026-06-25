import express, { type Express } from "express";
import cors from "cors";
import { healthRouter } from "./modules/health/health.routes.js";
import { taskRouter } from "./modules/tasks/tasks.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";
import { requestLogger } from "./middleware/request-logger.js";

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);

  app.use("/health", healthRouter);
  app.use("/api/tasks", taskRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
