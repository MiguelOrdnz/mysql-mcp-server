import { config } from "./config.js";

// Strips SQL comments (block, line, and MySQL #) from a SQL string
// to prevent bypass attempts like comment-hidden write operations.
function stripComments(sql: string): string {
  let result = sql.replace(/\/\*[\s\S]*?\*\//g, " ");
  result = result.replace(/--[^\n]*/g, " ");
  result = result.replace(/#[^\n]*/g, " ");
  return result;
}

const WRITE_KEYWORDS = [
  "insert",
  "update",
  "delete",
  "drop",
  "alter",
  "create",
  "truncate",
  "replace",
  "rename",
  "grant",
  "revoke",
  "lock",
  "unlock",
  "call",
  "load",
];

export function enforceReadOnly(sql: string): void {
  if (!config.readOnly) return;

  const stripped = stripComments(sql);
  const normalized = stripped.trim().toLowerCase();

  const firstToken = normalized.match(/^([a-z]+)/)?.[1];

  if (firstToken && WRITE_KEYWORDS.includes(firstToken)) {
    throw new Error(
      `Write operation "${firstToken.toUpperCase()}" is not allowed (READ_ONLY=true)`
    );
  }

  // Full-query scan: catch write keywords anywhere (e.g. WITH ... INSERT)
  for (const keyword of WRITE_KEYWORDS) {
    // Skip keywords that commonly appear in read contexts
    if (keyword === "update" || keyword === "lock" || keyword === "unlock" || keyword === "call") {
      continue;
    }
    const regex = new RegExp(`\\b${keyword}\\b`, "i");
    if (regex.test(normalized)) {
      throw new Error(
        `Write operation "${keyword.toUpperCase()}" detected in query (READ_ONLY=true)`
      );
    }
  }
}
