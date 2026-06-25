// Browser-safe logger for web client components. This module must NOT import
// winston (it is Node-only). It logs to the console with level filtering and
// ships errors to the server's `/api/log` sink so they land in the winston
// logs alongside server-side events.

export type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const CONSOLE: Record<LogLevel, (...args: unknown[]) => void> = {
  debug: (...args) => console.debug(...args),
  info: (...args) => console.info(...args),
  warn: (...args) => console.warn(...args),
  error: (...args) => console.error(...args),
};

type Meta = Record<string, unknown>;

// Best-effort POST to the server log sink; logging must never throw or reject.
function ship(level: LogLevel, message: string, meta?: Meta): void {
  if (typeof fetch === "undefined") return;
  try {
    void fetch("/api/log", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        level,
        message,
        meta,
        url: globalThis.location?.href,
      }),
      keepalive: true,
    }).catch(() => {
      // swallow network errors
    });
  } catch {
    // swallow synchronous errors (e.g. serialization)
  }
}

export interface ClientLogger {
  debug(message: string, meta?: Meta): void;
  info(message: string, meta?: Meta): void;
  warn(message: string, meta?: Meta): void;
  error(message: string, meta?: Meta): void;
}

export function createClientLogger(level: LogLevel = "info"): ClientLogger {
  const threshold = LEVEL_ORDER[level];

  const log = (l: LogLevel, message: string, meta?: Meta) => {
    if (LEVEL_ORDER[l] < threshold) return;
    CONSOLE[l](message, meta ?? "");
    if (l === "error") ship(l, message, meta);
  };

  return {
    debug: (message, meta) => log("debug", message, meta),
    info: (message, meta) => log("info", message, meta),
    warn: (message, meta) => log("warn", message, meta),
    error: (message, meta) => log("error", message, meta),
  };
}

function resolveLevel(): LogLevel {
  // Next inlines NEXT_PUBLIC_* at build time, so this reaches the browser.
  const fromEnv = process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel | undefined;
  return fromEnv && fromEnv in LEVEL_ORDER ? fromEnv : "info";
}

/** Default client logger, configured from `NEXT_PUBLIC_LOG_LEVEL`. */
export const clientLogger = createClientLogger(resolveLevel());
