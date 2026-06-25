"use client";

import * as React from "react";
import { cn } from "@repo/ui/lib/utils";

// Avatar with an image and an initials fallback. `fallback` shows when there is
// no `src`. Size/colour are controlled via className.
const Avatar = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    src?: string | null;
    alt?: string;
    fallback?: string;
  }
>(({ className, src, alt = "", fallback, ...props }, ref) => {
  // Fall back to initials if there's no src or the image fails to load.
  const [errored, setErrored] = React.useState(false);
  const showImage = Boolean(src) && !errored;

  React.useEffect(() => setErrored(false), [src]);

  return (
    <span
      ref={ref}
      title={alt || undefined}
      className={cn(
        "flex size-8 shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-medium text-muted-foreground",
        className,
      )}
      {...props}
    >
      {showImage ? (
        <img
          src={src as string}
          alt={alt}
          onError={() => setErrored(true)}
          className="size-full object-cover"
        />
      ) : (
        fallback
      )}
    </span>
  );
});
Avatar.displayName = "Avatar";

export { Avatar };
