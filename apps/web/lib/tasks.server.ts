import "server-only";
import { cookies } from "next/headers";
import type { BoardTask, TaskAssignee } from "./tasks";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const COOKIE_NAME = "access_token";

// Forward the httpOnly auth cookie to an API GET endpoint (mirrors lib/session.ts).
async function authedGet<T>(path: string): Promise<T | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: { Cookie: `${COOKIE_NAME}=${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function getTasks(): Promise<BoardTask[]> {
  return (await authedGet<BoardTask[]>("/api/tasks")) ?? [];
}

export async function getUsers(): Promise<TaskAssignee[]> {
  return (await authedGet<TaskAssignee[]>("/api/users")) ?? [];
}
