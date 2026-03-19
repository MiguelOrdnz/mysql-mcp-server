import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("config", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("uses defaults when no env vars are set", async () => {
    delete process.env.DB_HOST;
    delete process.env.DB_PORT;
    delete process.env.DB_USER;
    delete process.env.DB_PASSWORD;
    delete process.env.DB_NAME;
    delete process.env.READ_ONLY;

    const { config } = await import("../../src/config.js");
    expect(config.host).toBe("localhost");
    expect(config.port).toBe(3306);
    expect(config.user).toBe("root");
    expect(config.password).toBe("");
    expect(config.database).toBe("");
    expect(config.readOnly).toBe(true);
  });

  it("reads from environment variables", async () => {
    process.env.DB_HOST = "myhost";
    process.env.DB_PORT = "3307";
    process.env.DB_USER = "myuser";
    process.env.DB_PASSWORD = "mypass";
    process.env.DB_NAME = "mydb";
    process.env.READ_ONLY = "false";

    const { config } = await import("../../src/config.js");
    expect(config.host).toBe("myhost");
    expect(config.port).toBe(3307);
    expect(config.user).toBe("myuser");
    expect(config.password).toBe("mypass");
    expect(config.database).toBe("mydb");
    expect(config.readOnly).toBe(false);
  });
});
