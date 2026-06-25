const nodeEnv = process.env.NODE_ENV ?? "development";

export const env = {
  port: Number(process.env.PORT ?? 3001),
  nodeEnv,
  logLevel:
    process.env.LOG_LEVEL ?? (nodeEnv === "production" ? "info" : "debug"),
  // Secret used to sign/verify JWTs. The fallback is for local dev only —
  // production MUST set JWT_SECRET to a strong, random value.
  jwtSecret: process.env.JWT_SECRET ?? "dev-only-insecure-jwt-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  // Origin allowed by CORS and credentialed (cookie) requests — the web app.
  webOrigin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
  // Name of the httpOnly cookie holding the auth token.
  cookieName: "access_token",
  // bcrypt cost factor for password hashing.
  bcryptRounds: 10,
};
