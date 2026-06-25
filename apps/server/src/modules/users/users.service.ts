import { prisma } from "@repo/database";

// Business logic and data access for users. No Express req/res here.
export const userService = {
  // Assignable users for the board's assignee picker — never exposes secrets.
  list() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        role: true,
      },
      orderBy: { name: "asc" },
    });
  },
};
