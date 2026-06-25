import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { healthRouter } from "./modules/health/health.routes.js";
import { taskRouter } from "./modules/tasks/tasks.routes.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { userRouter } from "./modules/users/users.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";
import { requestLogger } from "./middleware/request-logger.js";
import { env } from "./config/env.js";

export function createApp(): Express {
  const app = express();

  // Credentials must be enabled so the browser sends/receives the auth cookie;
  // that requires an explicit (non-wildcard) origin.
  app.use(cors({ origin: env.webOrigin, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(requestLogger);

  app.use("/health", healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/tasks", taskRouter);
  app.use("/api/users", userRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
