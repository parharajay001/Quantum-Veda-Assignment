"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Columns3,
  LayoutDashboard,
  Settings,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { Avatar } from "@repo/ui/components/ui/avatar";
import { useSidebar } from "@repo/ui/components/ui/sidebar";
import { authApi, type AuthUser } from "@/lib/api";
import { initials } from "@/lib/format";

const NAV: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar({ user }: { user: AuthUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const { collapsed, setOpenMobile, isMobile } = useSidebar();

  async function onLogout() {
    await authApi.logout();
    router.push("/login");
    router.refresh();
  }

  const closeOnNav = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <>
      <div
        className={cn(
          "flex items-center gap-2 px-1 py-1",
          collapsed && "justify-center",
        )}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#8B7CF6] text-white">
          <Columns3 className="size-4.5" strokeWidth={2.5} />
        </span>
        {!collapsed && (
          <span className="text-lg font-semibold tracking-tight">Taskly</span>
        )}
      </div>

      <nav className="mt-5 flex flex-1 flex-col gap-1">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              onClick={closeOnNav}
              aria-current={active ? "page" : undefined}
              title={collapsed ? label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors",
                collapsed && "justify-center px-0",
                active
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-4.5 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-2 border-t border-sidebar-border pt-3">
        <div
          className={cn(
            "flex items-center gap-2",
            collapsed ? "flex-col" : "px-1",
          )}
        >
          <Avatar
            src={user.avatarUrl}
            alt={user.name}
            fallback={initials(user.name)}
            className="size-8 bg-[#8B7CF6] text-white"
          />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-sidebar-foreground/60">
                {user.email}
              </p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onLogout}
          title="Log out"
          className={cn(
            "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            collapsed && "justify-center px-0",
          )}
        >
          <LogOut className="size-4" />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>
    </>
  );
}
