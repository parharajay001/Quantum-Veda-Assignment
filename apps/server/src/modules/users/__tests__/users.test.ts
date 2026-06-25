import request from "supertest";
import { createApp } from "../../../app.js";
import { signToken } from "../../../lib/jwt.js";
import { prisma } from "@repo/database";

// Mock the shared database package so no real Postgres connection is needed.
jest.mock("@repo/database", () => ({
  prisma: {
    user: { findMany: jest.fn() },
  },
  Prisma: {
    PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {
      code: string;
      constructor(message: string, code: string) {
        super(message);
        this.code = code;
      }
    },
  },
}));

const findMany = jest.mocked(prisma.user.findMany);

const token = signToken({
  sub: "u1",
  email: "ada@example.com",
  role: "MEMBER",
});
const authHeader = `Bearer ${token}`;

describe("/api/users", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET / returns 401 without a token", async () => {
    const res = await request(createApp()).get("/api/users");

    expect(res.status).toBe(401);
    expect(findMany).not.toHaveBeenCalled();
  });

  it("GET / returns the assignable users", async () => {
    const users = [
      {
        id: "u1",
        name: "Ada",
        email: "ada@example.com",
        avatarUrl: null,
        role: "MEMBER",
      },
    ];
    findMany.mockResolvedValue(users as never);

    const res = await request(createApp())
      .get("/api/users")
      .set("Authorization", authHeader);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(users);
    expect(findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        role: true,
      },
      orderBy: { name: "asc" },
    });
  });
});
