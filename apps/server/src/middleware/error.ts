import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@repo/database";
import { logger } from "@repo/logger";
import { ZodError } from "zod";
import { AppError } from "../lib/app-error.js";

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: "Not found" });
}

// Express 5 forwards rejected promises from async handlers here automatically.
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) {
  if (err instanceof ZodError) {
    return res
      .status(400)
      .json({ error: "Validation failed", details: err.flatten() });
  }

  // Application errors carry their own HTTP status (e.g. 401, 409).
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // P2025 = record required for the operation was not found.
  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2025"
  ) {
    return res.status(404).json({ error: "Resource not found" });
  }

  logger.error("unhandled error", {
    message: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
  });
  return res.status(500).json({ error: "Internal server error" });
}
