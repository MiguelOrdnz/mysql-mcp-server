import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../src/db.js", () => ({
  pool: { query: vi.fn() },
}));

import { listTables } from "../../../src/tools/listTables.js";
import { pool } from "../../../src/db.js";

describe("listTables", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns table names extracted from SHOW TABLES result", async () => {
    (pool.query as ReturnType<typeof vi.fn>).mockResolvedValue([
      [
        { Tables_in_mydb: "users" },
        { Tables_in_mydb: "orders" },
        { Tables_in_mydb: "products" },
      ],
    ]);

    const result = await listTables();

    expect(pool.query).toHaveBeenCalledWith("SHOW TABLES");
    expect(result).toEqual(["users", "orders", "products"]);
  });

  it("returns empty array when no tables exist", async () => {
    (pool.query as ReturnType<typeof vi.fn>).mockResolvedValue([[]]);

    const result = await listTables();

    expect(result).toEqual([]);
  });

  it("propagates database errors", async () => {
    (pool.query as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("No database selected")
    );

    await expect(listTables()).rejects.toThrow("No database selected");
  });
});
