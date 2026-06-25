const nodeEnv = process.env.NODE_ENV ?? "development";

export const env = {
  port: Number(process.env.PORT ?? 3001),
  nodeEnv,
  logLevel:
    process.env.LOG_LEVEL ?? (nodeEnv === "production" ? "info" : "debug"),
};
