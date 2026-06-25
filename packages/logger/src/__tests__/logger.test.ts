describe("server logger", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it("is silent when NODE_ENV is test", async () => {
    process.env.NODE_ENV = "test";
    const { logger } = await import("../index.js");
    expect(logger.silent).toBe(true);
  });

  it("uses LOG_LEVEL when it is set", async () => {
    process.env.NODE_ENV = "development";
    process.env.LOG_LEVEL = "warn";
    const { logger } = await import("../index.js");
    expect(logger.level).toBe("warn");
  });

  it("defaults to info in production and debug otherwise", async () => {
    process.env.NODE_ENV = "production";
    delete process.env.LOG_LEVEL;
    const prod = await import("../index.js");
    expect(prod.logger.level).toBe("info");

    jest.resetModules();
    process.env.NODE_ENV = "development";
    const dev = await import("../index.js");
    expect(dev.logger.level).toBe("debug");
  });
});
