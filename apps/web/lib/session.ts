import { cookies } from "next/headers";
import type { AuthUser } from "./api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const COOKIE_NAME = "access_token";

// Server-side session lookup: forwards the httpOnly auth cookie to the API's
// /api/auth/me and returns the user, or null when unauthenticated.
export async function getSession(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: { Cookie: `${COOKIE_NAME}=${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { user: AuthUser };
    return body.user;
  } catch {
    return null;
  }
}
