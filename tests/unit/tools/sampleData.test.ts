import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../src/db.js", () => ({
  pool: { query: vi.fn() },
}));

import { sampleData } from "../../../src/tools/sampleData.js";
import { pool } from "../../../src/db.js";

describe("sampleData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls SELECT with LIMIT and parameterized query", async () => {
    const mockRows = [{ id: 1, name: "Alice" }];
    (pool.query as ReturnType<typeof vi.fn>).mockResolvedValue([mockRows]);

    const result = await sampleData("users", 5);

    expect(pool.query).toHaveBeenCalledWith(
      "SELECT * FROM `users` LIMIT ?",
      [5]
    );
    expect(result).toEqual(mockRows);
  });

  it("defaults limit to 10", async () => {
    (pool.query as ReturnType<typeof vi.fn>).mockResolvedValue([[]]);

    await sampleData("users");

    expect(pool.query).toHaveBeenCalledWith(
      "SELECT * FROM `users` LIMIT ?",
      [10]
    );
  });

  it("clamps limit to min 1", async () => {
    (pool.query as ReturnType<typeof vi.fn>).mockResolvedValue([[]]);

    await sampleData("users", -5);

    expect(pool.query).toHaveBeenCalledWith(
      "SELECT * FROM `users` LIMIT ?",
      [1]
    );
  });

  it("clamps limit to max 100", async () => {
    (pool.query as ReturnType<typeof vi.fn>).mockResolvedValue([[]]);

    await sampleData("users", 500);

    expect(pool.query).toHaveBeenCalledWith(
      "SELECT * FROM `users` LIMIT ?",
      [100]
    );
  });

  it("floors fractional limits", async () => {
    (pool.query as ReturnType<typeof vi.fn>).mockResolvedValue([[]]);

    await sampleData("users", 5.7);

    expect(pool.query).toHaveBeenCalledWith(
      "SELECT * FROM `users` LIMIT ?",
      [5]
    );
  });

  it("rejects invalid table names", async () => {
    await expect(sampleData("`malicious`", 10)).rejects.toThrow(
      "invalid characters"
    );
    expect(pool.query).not.toHaveBeenCalled();
  });
});
