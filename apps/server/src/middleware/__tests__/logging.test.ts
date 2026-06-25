import request from "supertest";
import { createApp } from "../../app.js";
import { logger } from "@repo/logger";
import { prisma } from "@repo/database";

// Mock the shared logger so we can assert it is called without producing log
// output, and mock the database so no real Postgres connection is needed.
// (@swc/jest hoists these jest.mock calls above the imports.)
jest.mock("@repo/logger", () => {
  const logger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  };
  return { logger, createLogger: () => logger };
});

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

const info = jest.mocked(logger.info);
const error = jest.mocked(logger.error);
const findMany = jest.mocked(prisma.task.findMany);

describe("request logging", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("logs each request with method, url and status", async () => {
    findMany.mockResolvedValue([] as never);

    await request(createApp()).get("/api/tasks");

    expect(info).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: "GET",
        url: "/api/tasks",
        status: 200,
      }),
    );
  });

  it("logs unhandled errors and still responds 500", async () => {
    findMany.mockRejectedValue(new Error("boom") as never);

    const res = await request(createApp()).get("/api/tasks");

    expect(res.status).toBe(500);
    expect(error).toHaveBeenCalledTimes(1);
  });
});
