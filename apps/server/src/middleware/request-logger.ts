import type { NextFunction, Request, Response } from "express";
import { logger } from "@repo/logger";

// Logs one structured line per request once the response is sent, capturing
// method, path, status code and duration.
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on("finish", () => {
    logger.info("request", {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - start,
    });
  });

  next();
}
