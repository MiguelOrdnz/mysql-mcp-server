import { pool } from "../db.js";
import { validateIdentifier } from "../validation.js";

export async function rowCount(table: string) {
  const safeName = validateIdentifier(table, "table");
  const [rows] = await pool.query(
    `SELECT COUNT(*) as count FROM \`${safeName}\``
  ) as [Array<{ count: number }>, unknown];
  return rows[0];
}
