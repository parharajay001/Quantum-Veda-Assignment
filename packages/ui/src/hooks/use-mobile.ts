"use client";

import * as React from "react";

// Below this width the sidebar becomes an off-canvas sheet and the board uses
// the full width. Set to Tailwind's `lg` so tablets (768–1023px) aren't cramped
// by the persistent rail.
const MOBILE_BREAKPOINT = 1024;

// Returns true when the viewport is below the mobile breakpoint. SSR-safe:
// starts false and syncs on mount via matchMedia.
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => setIsMobile(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}
