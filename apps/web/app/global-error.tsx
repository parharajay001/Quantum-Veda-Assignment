"use client";

import { useEffect } from "react";
import { clientLogger } from "@repo/logger/client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    clientLogger.error(error.message, {
      digest: error.digest,
      stack: error.stack,
      fatal: true,
    });
  }, [error]);

  return (
    <html lang="en">
      <body>
        <h2>Something went wrong.</h2>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}
