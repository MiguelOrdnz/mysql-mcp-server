import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../src/db.js", () => ({
  pool: { query: vi.fn() },
}));

import { listDatabases } from "../../../src/tools/listDatabases.js";
import { pool } from "../../../src/db.js";

describe("listDatabases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns database names extracted from SHOW DATABASES result", async () => {
    (pool.query as ReturnType<typeof vi.fn>).mockResolvedValue([
      [
        { Database: "information_schema" },
        { Database: "mydb" },
        { Database: "mysql" },
      ],
    ]);

    const result = await listDatabases();

    expect(pool.query).toHaveBeenCalledWith("SHOW DATABASES");
    expect(result).toEqual(["information_schema", "mydb", "mysql"]);
  });

  it("returns empty array when no databases exist", async () => {
    (pool.query as ReturnType<typeof vi.fn>).mockResolvedValue([[]]);

    const result = await listDatabases();

    expect(result).toEqual([]);
  });

  it("propagates database errors", async () => {
    (pool.query as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Access denied")
    );

    await expect(listDatabases()).rejects.toThrow("Access denied");
  });
});
