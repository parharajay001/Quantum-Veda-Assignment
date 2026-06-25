/**
 * @jest-environment node
 */
import { POST } from "../route";
import { logger } from "@repo/logger";

jest.mock("@repo/logger", () => ({
  logger: { log: jest.fn() },
}));

const log = jest.mocked(logger.log);

describe("POST /api/log", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("forwards client logs to the server logger and returns 204", async () => {
    const req = new Request("http://localhost/api/log", {
      method: "POST",
      body: JSON.stringify({ level: "error", message: "boom", meta: { a: 1 } }),
    });

    const res = await POST(req);

    expect(res.status).toBe(204);
    expect(log).toHaveBeenCalledWith(
      "error",
      expect.stringContaining("boom"),
      expect.objectContaining({ a: 1, source: "web-client" }),
    );
  });

  it("defaults to error level for malformed bodies", async () => {
    const req = new Request("http://localhost/api/log", {
      method: "POST",
      body: "not json",
    });

    const res = await POST(req);

    expect(res.status).toBe(204);
    expect(log).toHaveBeenCalledWith(
      "error",
      expect.any(String),
      expect.any(Object),
    );
  });
});
