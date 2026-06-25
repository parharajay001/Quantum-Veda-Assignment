import type { Request, Response } from "express";
import { authService, type PublicUser } from "./auth.service.js";
import { signToken } from "../../lib/jwt.js";
import { env } from "../../config/env.js";
import type { LoginInput, RegisterInput } from "./auth.validation.js";

// Cookie lifetime; keep roughly aligned with JWT_EXPIRES_IN (default 7d).
const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function setAuthCookie(res: Response, user: PublicUser) {
  const token = signToken({ sub: user.id, email: user.email, role: user.role });
  res.cookie(env.cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.nodeEnv === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE_MS,
  });
}

function clearAuthCookie(res: Response) {
  res.clearCookie(env.cookieName, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.nodeEnv === "production",
    path: "/",
  });
}

// Thin HTTP layer: bodies are already validated by validateBody middleware.
export const authController = {
  async register(req: Request, res: Response) {
    const user = await authService.register(req.body as RegisterInput);
    setAuthCookie(res, user);
    res.status(201).json({ user });
  },

  async login(req: Request, res: Response) {
    const user = await authService.login(req.body as LoginInput);
    setAuthCookie(res, user);
    res.json({ user });
  },

  // req.user (from the token) only has id/email/role; load the full profile.
  async me(req: Request, res: Response) {
    const user = await authService.me(req.user!.id);
    res.json({ user });
  },

  logout(_req: Request, res: Response) {
    clearAuthCookie(res);
    res.status(204).send();
  },
};
