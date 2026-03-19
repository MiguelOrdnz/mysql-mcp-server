#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { pool } from "./db.js";
import { enforceReadOnly } from "./guards.js";
import { describeTable } from "./tools/describeTable.js";
import { sampleData } from "./tools/sampleData.js";
import { explainQuery } from "./tools/explainQuery.js";
import { rowCount } from "./tools/rowCount.js";
import { listTables } from "./tools/listTables.js";
import { listDatabases } from "./tools/listDatabases.js";

const server = new McpServer(
  { name: "mysql-mcp-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

function ok(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

function err(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return {
    content: [{ type: "text" as const, text: `Error: ${message}` }],
    isError: true as const,
  };
}

// --- Tool: query ---
server.tool(
  "query",
  "Execute a read-only SQL query against the connected MySQL database",
  { sql: z.string().describe("The SQL query to execute") },
  async ({ sql }) => {
    try {
      enforceReadOnly(sql);
      const [rows] = await pool.query(sql);
      return ok(rows);
    } catch (error) {
      return err(error);
    }
  }
);

// --- Tool: describe_table ---
server.tool(
  "describe_table",
  "Show the schema/structure of a MySQL table (columns, types, keys)",
  { table: z.string().describe("The table name to describe") },
  async ({ table }) => {
    try {
      return ok(await describeTable(table));
    } catch (error) {
      return err(error);
    }
  }
);

// --- Tool: sample_data ---
server.tool(
  "sample_data",
  "Retrieve sample rows from a MySQL table",
  {
    table: z.string().describe("The table name to sample from"),
    limit: z
      .number()
      .int()
      .min(1)
      .max(100)
      .default(10)
      .describe("Number of rows to return (1-100, default 10)"),
  },
  async ({ table, limit }) => {
    try {
      return ok(await sampleData(table, limit));
    } catch (error) {
      return err(error);
    }
  }
);

// --- Tool: explain_query ---
server.tool(
  "explain_query",
  "Show the execution plan for a SQL query using EXPLAIN",
  { sql: z.string().describe("The SQL query to explain") },
  async ({ sql }) => {
    try {
      return ok(await explainQuery(sql));
    } catch (error) {
      return err(error);
    }
  }
);

// --- Tool: row_count ---
server.tool(
  "row_count",
  "Count the total number of rows in a MySQL table",
  { table: z.string().describe("The table name to count rows in") },
  async ({ table }) => {
    try {
      return ok(await rowCount(table));
    } catch (error) {
      return err(error);
    }
  }
);

// --- Tool: list_tables ---
server.tool(
  "list_tables",
  "List all tables in the connected MySQL database",
  {},
  async () => {
    try {
      return ok(await listTables());
    } catch (error) {
      return err(error);
    }
  }
);

// --- Tool: list_databases ---
server.tool(
  "list_databases",
  "List all databases accessible on the MySQL server",
  {},
  async () => {
    try {
      return ok(await listDatabases());
    } catch (error) {
      return err(error);
    }
  }
);

// --- Start server ---
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("mysql-mcp-server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
