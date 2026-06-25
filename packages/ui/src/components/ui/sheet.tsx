"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@repo/ui/lib/utils";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: "left" | "right";
  className?: string;
  children: React.ReactNode;
}

// Off-canvas panel that slides in from a side. Used for the mobile sidebar.
// Closes on Escape and overlay click; locks body scroll while open.
function Sheet({
  open,
  onOpenChange,
  side = "left",
  className,
  children,
}: SheetProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onOpenChange]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div
        aria-hidden
        onClick={() => onOpenChange(false)}
        className="absolute inset-0 bg-black/50 motion-safe:animate-in motion-safe:fade-in"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "absolute inset-y-0 flex w-72 max-w-[85%] flex-col bg-sidebar text-sidebar-foreground shadow-lg",
          side === "left"
            ? "left-0 motion-safe:animate-in motion-safe:slide-in-from-left"
            : "right-0 motion-safe:animate-in motion-safe:slide-in-from-right",
          className,
        )}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

export { Sheet };
