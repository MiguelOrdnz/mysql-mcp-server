import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../src/db.js", () => ({
  pool: { query: vi.fn() },
}));

import { describeTable } from "../../../src/tools/describeTable.js";
import { pool } from "../../../src/db.js";

describe("describeTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls DESCRIBE with backtick-escaped table name", async () => {
    const mockRows = [
      { Field: "id", Type: "int", Null: "NO", Key: "PRI" },
      { Field: "name", Type: "varchar(255)", Null: "YES", Key: "" },
    ];
    (pool.query as ReturnType<typeof vi.fn>).mockResolvedValue([mockRows]);

    const result = await describeTable("users");

    expect(pool.query).toHaveBeenCalledWith("DESCRIBE `users`");
    expect(result).toEqual(mockRows);
  });

  it("propagates database errors", async () => {
    (pool.query as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Table doesn't exist")
    );

    await expect(describeTable("nonexistent")).rejects.toThrow(
      "Table doesn't exist"
    );
  });

  it("rejects invalid table names", async () => {
    await expect(describeTable("users; DROP TABLE users")).rejects.toThrow(
      "invalid characters"
    );
    expect(pool.query).not.toHaveBeenCalled();
  });
});
