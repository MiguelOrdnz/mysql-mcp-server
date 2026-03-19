import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../src/db.js", () => ({
  pool: { query: vi.fn() },
}));

import { rowCount } from "../../../src/tools/rowCount.js";
import { pool } from "../../../src/db.js";

describe("rowCount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the count from the first row", async () => {
    (pool.query as ReturnType<typeof vi.fn>).mockResolvedValue([
      [{ count: 42 }],
    ]);

    const result = await rowCount("users");

    expect(pool.query).toHaveBeenCalledWith(
      "SELECT COUNT(*) as count FROM `users`"
    );
    expect(result).toEqual({ count: 42 });
  });

  it("rejects invalid table names", async () => {
    await expect(rowCount("'; DROP TABLE users; --")).rejects.toThrow(
      "invalid characters"
    );
    expect(pool.query).not.toHaveBeenCalled();
  });

  it("propagates database errors", async () => {
    (pool.query as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Access denied")
    );

    await expect(rowCount("secret_table")).rejects.toThrow("Access denied");
  });
});
