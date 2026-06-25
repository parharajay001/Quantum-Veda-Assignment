import type { NextFunction, Request, Response } from "express";
import type { Role } from "@repo/database";
import { unauthorized } from "../lib/app-error.js";
import { verifyToken } from "../lib/jwt.js";
import { env } from "../config/env.js";

// Extracts the token from the auth cookie, falling back to an
// `Authorization: Bearer <token>` header (useful for API clients / tests).
function extractToken(req: Request): string | undefined {
  const cookieToken = req.cookies?.[env.cookieName] as string | undefined;
  if (cookieToken) return cookieToken;

  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice("Bearer ".length);

  return undefined;
}

// Verifies the auth token and attaches `req.user`. Throws a 401 AppError when the
// token is missing, malformed, or expired — handled centrally by errorHandler.
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) throw unauthorized("Authentication required");

  try {
    const payload = verifyToken(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role as Role,
    };
  } catch {
    throw unauthorized("Invalid or expired token");
  }

  next();
}
