"use client";

import * as React from "react";
import { PanelLeft } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { useIsMobile } from "@repo/ui/hooks/use-mobile";
import { Sheet } from "@repo/ui/components/ui/sheet";

const STORAGE_KEY = "sidebar:collapsed";

interface SidebarContextValue {
  isMobile: boolean;
  /** Desktop: expanded vs icon-rail. */
  open: boolean;
  collapsed: boolean;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  toggle: () => void;
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useSidebar(): SidebarContextValue {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within <SidebarProvider>");
  return ctx;
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(true);
  const [openMobile, setOpenMobile] = React.useState(false);

  // Restore the desktop collapsed preference after mount (avoids hydration drift).
  React.useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored != null) setOpen(stored !== "true");
  }, []);

  const toggle = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile((v) => !v);
      return;
    }
    setOpen((v) => {
      const next = !v;
      window.localStorage.setItem(STORAGE_KEY, String(!next));
      return next;
    });
  }, [isMobile]);

  const value = React.useMemo<SidebarContextValue>(
    () => ({
      isMobile,
      open,
      collapsed: !isMobile && !open,
      openMobile,
      setOpenMobile,
      toggle,
    }),
    [isMobile, open, openMobile, toggle],
  );

  return (
    <SidebarContext.Provider value={value}>
      <div className="flex h-svh w-full overflow-hidden">{children}</div>
    </SidebarContext.Provider>
  );
}

// The sidebar shell. On mobile it renders inside an off-canvas Sheet; on desktop
// it's a fixed rail that animates between expanded and icon-only widths.
export function Sidebar({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const { isMobile, collapsed, openMobile, setOpenMobile } = useSidebar();

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} side="left">
        <div className={cn("flex h-full flex-col p-3", className)}>
          {children}
        </div>
      </Sheet>
    );
  }

  return (
    <aside
      data-collapsed={collapsed}
      className={cn(
        "flex h-full shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-3 text-sidebar-foreground transition-[width] duration-200 ease-in-out",
        collapsed ? "w-[4.25rem] items-center" : "w-60",
        className,
      )}
    >
      {children}
    </aside>
  );
}

// Toggle button — hamburger / collapse control.
export function SidebarTrigger({ className }: { className?: string }) {
  const { toggle } = useSidebar();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle sidebar"
      className={cn(
        "flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <PanelLeft className="size-4.5" />
    </button>
  );
}

// Main content region beside the sidebar.
export function SidebarInset({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn("flex min-w-0 flex-1 flex-col overflow-hidden", className)}
    >
      {children}
    </div>
  );
}
