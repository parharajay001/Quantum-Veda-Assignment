import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { Avatar } from "@repo/ui/components/ui/avatar";
import { Separator } from "@repo/ui/components/ui/separator";
import { Badge } from "@repo/ui/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/app/logout-button";
import { initials } from "@/lib/format";

export default async function SettingsPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl space-y-6 p-4 sm:p-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your profile and appearance.
          </p>
        </div>

        <section className="rounded-lg border bg-card p-4 text-card-foreground sm:p-6">
          <h2 className="text-sm font-semibold">Profile</h2>
          <Separator className="my-4" />
          <div className="flex items-center gap-4">
            <Avatar
              src={user.avatarUrl}
              alt={user.name}
              fallback={initials(user.name)}
              className="size-12 bg-[#8B7CF6] text-base text-white"
            />
            <div className="min-w-0">
              <p className="flex items-center gap-2 font-medium">
                {user.name}
                <Badge variant="muted">{user.role}</Badge>
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-lg border bg-card p-4 text-card-foreground sm:p-6">
          <h2 className="text-sm font-semibold">Appearance</h2>
          <Separator className="my-4" />
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-sm text-muted-foreground">
                Switch between light and dark.
              </p>
            </div>
            <ThemeToggle className="border" />
          </div>
        </section>

        <section className="rounded-lg border bg-card p-4 text-card-foreground sm:p-6">
          <h2 className="text-sm font-semibold">Account</h2>
          <Separator className="my-4" />
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            <p className="text-sm text-muted-foreground">
              Sign out of your account on this device.
            </p>
            <LogoutButton />
          </div>
        </section>
      </div>
    </div>
  );
}
