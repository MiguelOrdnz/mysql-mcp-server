import { pool } from "../db.js";
import { validateIdentifier } from "../validation.js";

export async function describeTable(table: string) {
  const safeName = validateIdentifier(table, "table");
  const [rows] = await pool.query(`DESCRIBE \`${safeName}\``);
  return rows;
}
