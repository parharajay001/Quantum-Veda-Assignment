"use client";

import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/components/ui/button";
import { authApi } from "@/lib/api";

export function LogoutButton() {
  const router = useRouter();

  async function onLogout() {
    await authApi.logout();
    router.push("/login");
    router.refresh();
  }

  return (
    <Button variant="outline" onClick={onLogout}>
      Log out
    </Button>
  );
}
