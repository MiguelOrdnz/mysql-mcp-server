import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../src/db.js", () => ({
  pool: { query: vi.fn() },
}));

vi.mock("../../../src/config.js", () => ({
  config: { readOnly: true },
}));

import { explainQuery } from "../../../src/tools/explainQuery.js";
import { pool } from "../../../src/db.js";

describe("explainQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("prepends EXPLAIN to the query", async () => {
    const mockPlan = [
      { id: 1, select_type: "SIMPLE", table: "users", type: "ALL" },
    ];
    (pool.query as ReturnType<typeof vi.fn>).mockResolvedValue([mockPlan]);

    const result = await explainQuery("SELECT * FROM users");

    expect(pool.query).toHaveBeenCalledWith("EXPLAIN SELECT * FROM users");
    expect(result).toEqual(mockPlan);
  });

  it("blocks write queries even through EXPLAIN", async () => {
    await expect(
      explainQuery("INSERT INTO users VALUES (1)")
    ).rejects.toThrow(/INSERT/);
    expect(pool.query).not.toHaveBeenCalled();
  });

  it("propagates database errors", async () => {
    (pool.query as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Syntax error")
    );

    await expect(explainQuery("SELECT * FROM")).rejects.toThrow("Syntax error");
  });
});
