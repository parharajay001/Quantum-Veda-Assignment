import bcrypt from "bcryptjs";
import { prisma, type User } from "@repo/database";
import { conflict, unauthorized } from "../../lib/app-error.js";
import { env } from "../../config/env.js";
import type { LoginInput, RegisterInput } from "./auth.validation.js";

// Public-facing user shape — never includes passwordHash.
export type PublicUser = Omit<User, "passwordHash">;

function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

// Business logic and data access for authentication. No Express req/res here.
export const authService = {
  async register(input: RegisterInput): Promise<PublicUser> {
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (existing) throw conflict("Email already registered");

    const passwordHash = await bcrypt.hash(input.password, env.bcryptRounds);
    const user = await prisma.user.create({
      data: { name: input.name, email: input.email, passwordHash },
    });

    return toPublicUser(user);
  },

  async login(input: LoginInput): Promise<PublicUser> {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });
    // Same error whether the email is unknown or the password is wrong, so the
    // response doesn't reveal which emails are registered.
    if (!user) throw unauthorized("Invalid credentials");

    const passwordMatches = await bcrypt.compare(
      input.password,
      user.passwordHash,
    );
    if (!passwordMatches) throw unauthorized("Invalid credentials");

    return toPublicUser(user);
  },

  // Full profile for the authenticated user — the JWT only carries id/email/role,
  // so fetch the rest (name, avatarUrl) from the database.
  async me(id: string): Promise<PublicUser> {
    const user = await prisma.user.findUniqueOrThrow({ where: { id } });
    return toPublicUser(user);
  },
};
