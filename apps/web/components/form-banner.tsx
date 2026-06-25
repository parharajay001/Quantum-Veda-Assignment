import type { ReactNode } from "react";

// Form-level error banner (e.g. wrong credentials, email already taken). Carries
// role="alert" so the message is announced when it appears.
export function FormBanner({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
    >
      {children}
    </div>
  );
}
