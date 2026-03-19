import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../src/config.js", () => ({
  config: { readOnly: true },
}));

import { enforceReadOnly } from "../../src/guards.js";

describe("enforceReadOnly", () => {
  describe("when readOnly is true", () => {
    // --- Should ALLOW ---
    it("allows SELECT queries", () => {
      expect(() => enforceReadOnly("SELECT * FROM users")).not.toThrow();
    });

    it("allows SELECT with subquery", () => {
      expect(() =>
        enforceReadOnly(
          "SELECT * FROM users WHERE id IN (SELECT id FROM admins)"
        )
      ).not.toThrow();
    });

    it("allows SHOW queries", () => {
      expect(() => enforceReadOnly("SHOW TABLES")).not.toThrow();
    });

    it("allows DESCRIBE queries", () => {
      expect(() => enforceReadOnly("DESCRIBE users")).not.toThrow();
    });

    it("allows EXPLAIN queries", () => {
      expect(() =>
        enforceReadOnly("EXPLAIN SELECT * FROM users")
      ).not.toThrow();
    });

    it("allows WITH (CTE) + SELECT", () => {
      expect(() =>
        enforceReadOnly("WITH cte AS (SELECT 1) SELECT * FROM cte")
      ).not.toThrow();
    });

    // --- Should BLOCK ---
    it("blocks INSERT", () => {
      expect(() =>
        enforceReadOnly("INSERT INTO users (name) VALUES ('x')")
      ).toThrow(/INSERT/);
    });

    it("blocks UPDATE", () => {
      expect(() =>
        enforceReadOnly("UPDATE users SET name = 'x'")
      ).toThrow(/UPDATE/);
    });

    it("blocks DELETE", () => {
      expect(() => enforceReadOnly("DELETE FROM users")).toThrow(/DELETE/);
    });

    it("blocks DROP", () => {
      expect(() => enforceReadOnly("DROP TABLE users")).toThrow(/DROP/);
    });

    it("blocks ALTER", () => {
      expect(() =>
        enforceReadOnly("ALTER TABLE users ADD COLUMN age INT")
      ).toThrow(/ALTER/);
    });

    it("blocks CREATE", () => {
      expect(() =>
        enforceReadOnly("CREATE TABLE test (id INT)")
      ).toThrow(/CREATE/);
    });

    it("blocks TRUNCATE", () => {
      expect(() => enforceReadOnly("TRUNCATE TABLE users")).toThrow(/TRUNCATE/);
    });

    it("blocks REPLACE", () => {
      expect(() =>
        enforceReadOnly("REPLACE INTO users (id, name) VALUES (1, 'x')")
      ).toThrow(/REPLACE/);
    });

    it("blocks GRANT", () => {
      expect(() =>
        enforceReadOnly("GRANT ALL ON mydb.* TO 'user'@'localhost'")
      ).toThrow(/GRANT/);
    });

    it("blocks REVOKE", () => {
      expect(() =>
        enforceReadOnly("REVOKE ALL ON mydb.* FROM 'user'@'localhost'")
      ).toThrow(/REVOKE/);
    });

    // --- Bypass prevention ---
    it("blocks INSERT hidden behind block comment", () => {
      expect(() =>
        enforceReadOnly("/* comment */ INSERT INTO users VALUES (1)")
      ).toThrow(/INSERT/);
    });

    it("blocks INSERT hidden behind line comment", () => {
      expect(() =>
        enforceReadOnly("-- comment\nINSERT INTO users VALUES (1)")
      ).toThrow(/INSERT/);
    });

    it("blocks INSERT hidden behind MySQL # comment", () => {
      expect(() =>
        enforceReadOnly("# comment\nINSERT INTO users VALUES (1)")
      ).toThrow(/INSERT/);
    });

    it("blocks write in CTE (WITH ... INSERT)", () => {
      expect(() =>
        enforceReadOnly(
          "WITH cte AS (SELECT 1) INSERT INTO users SELECT * FROM cte"
        )
      ).toThrow(/INSERT/);
    });

    it("handles case-insensitive keywords", () => {
      expect(() =>
        enforceReadOnly("InSeRt INTO users VALUES (1)")
      ).toThrow(/INSERT/);
    });

    it("handles leading whitespace", () => {
      expect(() =>
        enforceReadOnly("   \n  INSERT INTO users VALUES (1)")
      ).toThrow(/INSERT/);
    });
  });
});
