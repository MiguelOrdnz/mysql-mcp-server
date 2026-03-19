import { pool } from "../db.js";

export async function listDatabases(): Promise<string[]> {
  const [rows] = await pool.query("SHOW DATABASES") as [Array<Record<string, string>>, unknown];
  return rows.map((row) => Object.values(row)[0]!);
}
