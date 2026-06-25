import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";

export interface AuthTokenPayload {
  sub: string;
  email: string;
  role: string;
}

// Sign a short-lived auth token. `expiresIn` is cast because @types/jsonwebtoken
// types it as a narrow string-literal union that a free-form env value can't satisfy.
export function signToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"],
  });
}

// Verify and decode a token. Throws (jwt.JsonWebTokenError/TokenExpiredError) on
// invalid/expired tokens — callers translate that into a 401.
export function verifyToken(token: string): AuthTokenPayload {
  return jwt.verify(token, env.jwtSecret) as AuthTokenPayload;
}
