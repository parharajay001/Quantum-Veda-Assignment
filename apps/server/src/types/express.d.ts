import type { Role } from "@repo/database";

// Augment Express's Request with the authenticated user attached by requireAuth.
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string; role: Role };
    }
  }
}

export {};
