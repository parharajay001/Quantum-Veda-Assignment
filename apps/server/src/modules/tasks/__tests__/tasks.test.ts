import request from "supertest";
import { createApp } from "../../../app.js";
import { signToken } from "../../../lib/jwt.js";
import { prisma } from "@repo/database";

// Mock the shared database package so no real Postgres connection is needed.
// `prisma` is used by the task service and `Prisma` (the error namespace) is
// imported by the central error middleware. (@swc/jest hoists this jest.mock
// call above the imports above.)
jest.mock("@repo/database", () => ({
  prisma: {
    task: { findMany: jest.fn(), create: jest.fn() },
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

const findMany = jest.mocked(prisma.task.findMany);
const create = jest.mocked(prisma.task.create);

// Task routes require auth; sign a token the real requireAuth/jwt will accept.
const token = signToken({
  sub: "u1",
  email: "ada@example.com",
  role: "MEMBER",
});
const authHeader = `Bearer ${token}`;

describe("/api/tasks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET / returns 401 without a token", async () => {
    const res = await request(createApp()).get("/api/tasks");

    expect(res.status).toBe(401);
    expect(findMany).not.toHaveBeenCalled();
  });

  it("GET / returns the tasks from the database", async () => {
    const tasks = [{ id: "1", title: "Test task", status: "DRAFT" }];
    findMany.mockResolvedValue(tasks as never);

    const res = await request(createApp())
      .get("/api/tasks")
      .set("Authorization", authHeader);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(tasks);
    expect(findMany).toHaveBeenCalledTimes(1);
  });

  it("POST / creates a task with createdById from the token", async () => {
    const created = { id: "1", title: "New task", createdById: "u1" };
    create.mockResolvedValue(created as never);

    const res = await request(createApp())
      .post("/api/tasks")
      .set("Authorization", authHeader)
      .send({ title: "New task" });

    expect(res.status).toBe(201);
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { title: "New task", createdById: "u1" },
      }),
    );
  });

  it("POST / with an invalid body returns 400 and does not touch the database", async () => {
    const res = await request(createApp())
      .post("/api/tasks")
      .set("Authorization", authHeader)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Validation failed");
    expect(create).not.toHaveBeenCalled();
  });

  it("POST / accepts priority, dueDate and assignedToId and coerces the date", async () => {
    create.mockResolvedValue({ id: "1" } as never);

    const res = await request(createApp())
      .post("/api/tasks")
      .set("Authorization", authHeader)
      .send({
        title: "Full task",
        priority: "HIGH",
        dueDate: "2026-07-01T00:00:00.000Z",
        assignedToId: "u2",
      });

    expect(res.status).toBe(201);
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          title: "Full task",
          priority: "HIGH",
          dueDate: new Date("2026-07-01T00:00:00.000Z"),
          assignedToId: "u2",
          createdById: "u1",
        },
      }),
    );
  });

  it("POST / rejects an unknown priority value", async () => {
    const res = await request(createApp())
      .post("/api/tasks")
      .set("Authorization", authHeader)
      .send({ title: "Bad", priority: "SOMETIME" });

    expect(res.status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });
});
