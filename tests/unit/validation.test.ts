import { describe, it, expect } from "vitest";
import { validateIdentifier } from "../../src/validation.js";

describe("validateIdentifier", () => {
  it("accepts simple table names", () => {
    expect(validateIdentifier("users")).toBe("users");
    expect(validateIdentifier("order_items")).toBe("order_items");
  });

  it("accepts names starting with digits after first char", () => {
    expect(validateIdentifier("table2")).toBe("table2");
  });

  it("accepts schema.table notation", () => {
    expect(validateIdentifier("mydb.users")).toBe("mydb.users");
  });

  it("accepts names with hyphens", () => {
    expect(validateIdentifier("my-table")).toBe("my-table");
  });

  it("trims whitespace", () => {
    expect(validateIdentifier("  users  ")).toBe("users");
  });

  it("rejects empty string", () => {
    expect(() => validateIdentifier("")).toThrow("cannot be empty");
  });

  it("rejects whitespace-only string", () => {
    expect(() => validateIdentifier("   ")).toThrow("cannot be empty");
  });

  it("rejects names with backticks", () => {
    expect(() => validateIdentifier("`users`")).toThrow("invalid characters");
  });

  it("rejects names with semicolons", () => {
    expect(() => validateIdentifier("users; DROP TABLE users")).toThrow(
      "invalid characters"
    );
  });

  it("rejects names with quotes", () => {
    expect(() => validateIdentifier("users'--")).toThrow("invalid characters");
  });

  it("rejects names with spaces", () => {
    expect(() => validateIdentifier("user table")).toThrow(
      "invalid characters"
    );
  });

  it("rejects names exceeding 64 characters", () => {
    expect(() => validateIdentifier("a".repeat(65))).toThrow(
      "exceeds maximum length"
    );
  });

  it("accepts names at exactly 64 characters", () => {
    const name = "a".repeat(64);
    expect(validateIdentifier(name)).toBe(name);
  });

  it("rejects names starting with a dot", () => {
    expect(() => validateIdentifier(".hidden")).toThrow("invalid characters");
  });

  it("rejects names starting with a hyphen", () => {
    expect(() => validateIdentifier("-table")).toThrow("invalid characters");
  });

  it("uses custom label in error messages", () => {
    expect(() => validateIdentifier("", "table")).toThrow("table cannot be empty");
  });
});
