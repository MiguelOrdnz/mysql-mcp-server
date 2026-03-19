import { pool } from "../db.js";
import { enforceReadOnly } from "../guards.js";

export async function explainQuery(sql: string) {
  enforceReadOnly(sql);
  const [rows] = await pool.query(`EXPLAIN ${sql}`);
  return rows;
}
