import { logger } from "@repo/logger";

type LogLevel = "debug" | "info" | "warn" | "error";

interface ClientLogPayload {
  level?: LogLevel;
  message?: string;
  meta?: Record<string, unknown>;
  url?: string;
}

const LEVELS: readonly LogLevel[] = ["debug", "info", "warn", "error"];

// Sink for browser-reported logs (see `@repo/logger/client`). Forwards them to
// the shared winston logger so client errors land alongside server logs.
export async function POST(request: Request): Promise<Response> {
  let payload: ClientLogPayload = {};
  try {
    payload = (await request.json()) as ClientLogPayload;
  } catch {
    // ignore malformed bodies
  }

  const level: LogLevel =
    payload.level && LEVELS.includes(payload.level) ? payload.level : "error";
  const message = payload.message ?? "client log";

  logger.log(level, `[client] ${message}`, {
    ...payload.meta,
    url: payload.url,
    source: "web-client",
  });

  return new Response(null, { status: 204 });
}
