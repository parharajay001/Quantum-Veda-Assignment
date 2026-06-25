"use client";

import { useEffect } from "react";
import { clientLogger } from "@repo/logger/client";

export default function Error({
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
    });
  }, [error]);

  return (
    <div>
      <h2>Something went wrong.</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
