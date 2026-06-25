import request from "supertest";
import bcrypt from "bcryptjs";
import { createApp } from "../../../app.js";
import { prisma } from "@repo/database";

// Mock the shared database package so no real Postgres connection is needed.
// bcrypt and jsonwebtoken run for real (deterministic, no DB).
jest.mock("@repo/database", () => ({
  prisma: {
    user: { findUnique: jest.fn(), create: jest.fn() },
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

const findUnique = jest.mocked(prisma.user.findUnique);
const create = jest.mocked(prisma.user.create);

const buildUser = async (overrides: Record<string, unknown> = {}) => ({
  id: "u1",
  name: "Ada",
  email: "ada@example.com",
  passwordHash: await bcrypt.hash("password123", 4),
  role: "MEMBER",
  avatarUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe("/api/auth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /register", () => {
    it("creates a user, sets the auth cookie, and returns the public user", async () => {
      findUnique.mockResolvedValue(null);
      create.mockResolvedValue(
        (await buildUser({ name: "Ada", email: "ada@example.com" })) as never,
      );

      const res = await request(createApp()).post("/api/auth/register").send({
        name: "Ada",
        email: "ada@example.com",
        password: "password123",
      });

      expect(res.status).toBe(201);
      expect(res.body.user).toMatchObject({
        email: "ada@example.com",
        name: "Ada",
      });
      expect(res.body.user).not.toHaveProperty("passwordHash");
      expect(res.headers["set-cookie"]?.[0]).toMatch(
        /access_token=.*HttpOnly/i,
      );
    });

    it("rejects a duplicate email with 409", async () => {
      findUnique.mockResolvedValue((await buildUser()) as never);

      const res = await request(createApp()).post("/api/auth/register").send({
        name: "Ada",
        email: "ada@example.com",
        password: "password123",
      });

      expect(res.status).toBe(409);
      expect(create).not.toHaveBeenCalled();
    });

    it("rejects an invalid body with 400", async () => {
      const res = await request(createApp())
        .post("/api/auth/register")
        .send({ email: "not-an-email", password: "short" });

      expect(res.status).toBe(400);
      expect(findUnique).not.toHaveBeenCalled();
    });
  });

  describe("POST /login", () => {
    it("authenticates valid credentials and sets the auth cookie", async () => {
      findUnique.mockResolvedValue((await buildUser()) as never);

      const res = await request(createApp())
        .post("/api/auth/login")
        .send({ email: "ada@example.com", password: "password123" });

      expect(res.status).toBe(200);
      expect(res.body.user).toMatchObject({ email: "ada@example.com" });
      expect(res.headers["set-cookie"]?.[0]).toMatch(
        /access_token=.*HttpOnly/i,
      );
    });

    it("rejects a wrong password with 401", async () => {
      findUnique.mockResolvedValue((await buildUser()) as never);

      const res = await request(createApp())
        .post("/api/auth/login")
        .send({ email: "ada@example.com", password: "wrong-password" });

      expect(res.status).toBe(401);
    });

    it("rejects an unknown email with 401", async () => {
      findUnique.mockResolvedValue(null);

      const res = await request(createApp())
        .post("/api/auth/login")
        .send({ email: "ghost@example.com", password: "password123" });

      expect(res.status).toBe(401);
    });
  });

  describe("GET /me", () => {
    it("returns 401 without a token", async () => {
      const res = await request(createApp()).get("/api/auth/me");
      expect(res.status).toBe(401);
    });

    it("returns the user when a valid cookie is sent", async () => {
      findUnique.mockResolvedValue((await buildUser()) as never);

      const agent = request.agent(createApp());
      await agent
        .post("/api/auth/login")
        .send({ email: "ada@example.com", password: "password123" });

      const res = await agent.get("/api/auth/me");

      expect(res.status).toBe(200);
      expect(res.body.user).toMatchObject({ email: "ada@example.com" });
    });
  });
});
