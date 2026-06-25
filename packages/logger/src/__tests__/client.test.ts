import { createClientLogger } from "../client.js";

describe("createClientLogger", () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn(() => Promise.resolve({ ok: true } as Response));
    (globalThis as { fetch?: unknown }).fetch = fetchMock;
    jest.spyOn(console, "debug").mockImplementation(() => {});
    jest.spyOn(console, "info").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("suppresses messages below the configured level", () => {
    const logger = createClientLogger("warn");

    logger.debug("nope");
    logger.info("nope");
    expect(console.debug).not.toHaveBeenCalled();
    expect(console.info).not.toHaveBeenCalled();

    logger.warn("yes");
    expect(console.warn).toHaveBeenCalled();
  });

  it("ships errors to /api/log and swallows fetch failures", () => {
    fetchMock.mockReturnValue(Promise.reject(new Error("network")));
    const logger = createClientLogger("debug");

    expect(() => logger.error("boom", { a: 1 })).not.toThrow();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/log",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("does not ship non-error levels", () => {
    const logger = createClientLogger("debug");

    logger.warn("warn");
    logger.info("info");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
