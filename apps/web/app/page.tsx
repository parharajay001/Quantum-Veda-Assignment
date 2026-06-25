import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LogoutButton } from "./logout-button";

export default async function Home() {
  const user = await getSession();
  if (!user) redirect("/login");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-8">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome, {user.name}
        </h1>
        <p className="mt-2 text-muted-foreground">
          You are signed in as {user.email}.
        </p>
      </div>
      <LogoutButton />
    </main>
  );
}
