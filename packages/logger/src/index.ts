import winston from "winston";

const { combine, timestamp, json, colorize, printf } = winston.format;

const isProduction = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";

function resolveLevel(): string {
  return process.env.LOG_LEVEL ?? (isProduction ? "info" : "debug");
}

// Human-readable, colorized output for local development.
const developmentFormat = combine(
  colorize(),
  timestamp({ format: "HH:mm:ss" }),
  printf((info) => {
    const { level, message, timestamp: ts, ...meta } = info;
    const rest = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `${ts} ${level} ${String(message)}${rest}`;
  }),
);

// Structured JSON for production log aggregation.
const productionFormat = combine(timestamp(), json());

/**
 * Shared winston logger for Node runtimes (the Express server and Next.js
 * server-side code). Browser code must use `@repo/logger/client` instead —
 * winston depends on Node core modules and will not run in the browser.
 */
export const logger = winston.createLogger({
  level: resolveLevel(),
  silent: isTest,
  format: isProduction ? productionFormat : developmentFormat,
  transports: [new winston.transports.Console()],
});

/** Create a child logger that tags every line with the given metadata. */
export function createLogger(meta: Record<string, unknown>) {
  return logger.child(meta);
}

export type Logger = typeof logger;
