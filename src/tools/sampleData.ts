import { pool } from "../db.js";
import { validateIdentifier } from "../validation.js";

export async function sampleData(table: string, limit = 10) {
  const safeName = validateIdentifier(table, "table");
  const safeLimit = Math.max(1, Math.min(100, Math.floor(limit)));
  const [rows] = await pool.query(
    `SELECT * FROM \`${safeName}\` LIMIT ?`,
    [safeLimit]
  );
  return rows;
}
