// Browser-side client for the auth API. All requests include credentials so the
// httpOnly auth cookie is sent/received across the 3000 -> 3001 origin.

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export type FieldErrors = Record<string, string[] | undefined>;

export class ApiError extends Error {
  readonly status: number;
  // Per-field messages from the server's Zod validation (when status is 400).
  readonly fieldErrors?: FieldErrors;
  constructor(status: number, message: string, fieldErrors?: FieldErrors) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (res.status === 204) return undefined as T;

  const body = (await res.json().catch(() => ({}))) as {
    error?: string;
    details?: { fieldErrors?: FieldErrors; formErrors?: string[] };
    user?: AuthUser;
  };

  if (!res.ok) {
    const message =
      body.details?.formErrors?.[0] ?? body.error ?? "Something went wrong.";
    throw new ApiError(res.status, message, body.details?.fieldErrors);
  }

  return body as T;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export const authApi = {
  register: (input: RegisterInput) =>
    request<{ user: AuthUser }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  login: (input: LoginInput) =>
    request<{ user: AuthUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  logout: () => request<void>("/api/auth/logout", { method: "POST" }),

  me: () => request<{ user: AuthUser }>("/api/auth/me"),
};
