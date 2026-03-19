import { pool } from "../db.js";

export async function listTables(): Promise<string[]> {
  const [rows] = await pool.query("SHOW TABLES") as [Array<Record<string, string>>, unknown];
  return rows.map((row) => Object.values(row)[0]!);
}
