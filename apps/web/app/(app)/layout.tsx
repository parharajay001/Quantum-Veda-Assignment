import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@repo/ui/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  if (!user) redirect("/login");

  return (
    <SidebarProvider>
      <Sidebar>
        <AppSidebar user={user} />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-3 sm:px-4">
          <SidebarTrigger />
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Taskly
          </span>
          <ThemeToggle className="ml-auto" />
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
