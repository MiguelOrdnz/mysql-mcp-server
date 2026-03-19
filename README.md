# mysql-mcp-server

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that connects AI tools and agents to MySQL databases. It enables LLMs to safely query, explore, and understand your MySQL data through a standardized protocol.

## Features

- **Read-only by default** — all write operations are blocked unless explicitly enabled
- **7 built-in tools** — `query`, `describe_table`, `sample_data`, `explain_query`, `row_count`, `list_tables`, `list_databases`
- **SQL injection protection** — table name validation and parameterized queries
- **MCP standard compliant** — uses `StdioServerTransport`, zod schemas, and proper content array responses
- **Works with any MCP client** — Claude Desktop, Cursor, Continue, and other MCP-compatible tools

## Prerequisites

- **Node.js** >= 18
- **MySQL** 5.7+ or 8.0+
- An MCP-compatible client (e.g., Claude Desktop)

## Installation

```bash
git clone https://github.com/your-username/mysql-mcp-server.git
cd mysql-mcp-server
npm install
npm run build
```

## Configuration

The server is configured via environment variables:

| Variable      | Description                             | Default     |
|---------------|-----------------------------------------|-------------|
| `DB_HOST`     | MySQL host                              | `localhost` |
| `DB_PORT`     | MySQL port                              | `3306`      |
| `DB_USER`     | MySQL user                              | `root`      |
| `DB_PASSWORD` | MySQL password                          | _(empty)_   |
| `DB_NAME`     | Default database name                   | _(empty)_   |
| `READ_ONLY`   | Block write operations (`true`/`false`) | `true`      |

You can create a `.env` file for local development (it is git-ignored).

## Usage with Claude Desktop

Add the following to your Claude Desktop configuration file:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "mysql": {
      "command": "node",
      "args": ["/absolute/path/to/mysql-mcp-server/dist/index.js"],
      "env": {
        "DB_HOST": "localhost",
        "DB_PORT": "3306",
        "DB_USER": "your_user",
        "DB_PASSWORD": "your_password",
        "DB_NAME": "your_database",
        "READ_ONLY": "true"
      }
    }
  }
}
```

Restart Claude Desktop after saving the configuration.

## Available Tools

### `query`

Execute a read-only SQL query against the connected database.

| Parameter | Type   | Required | Description              |
|-----------|--------|----------|--------------------------|
| `sql`     | string | yes      | The SQL query to execute |

### `list_tables`

List all tables in the connected database. No parameters.

### `list_databases`

List all accessible databases on the MySQL server. No parameters.

### `describe_table`

Show the schema/structure of a table (columns, types, keys).

| Parameter | Type   | Required | Description    |
|-----------|--------|----------|----------------|
| `table`   | string | yes      | The table name |

### `sample_data`

Retrieve sample rows from a table.

| Parameter | Type   | Required | Description                          |
|-----------|--------|----------|--------------------------------------|
| `table`   | string | yes      | The table name                       |
| `limit`   | number | no       | Number of rows, 1-100 (default: 10)  |

### `explain_query`

Show the execution plan for a SQL query using `EXPLAIN`.

| Parameter | Type   | Required | Description              |
|-----------|--------|----------|--------------------------|
| `sql`     | string | yes      | The SQL query to explain |

### `row_count`

Count the total number of rows in a table.

| Parameter | Type   | Required | Description    |
|-----------|--------|----------|----------------|
| `table`   | string | yes      | The table name |

## Testing

### Run unit tests

```bash
npm test
```

### Run tests in watch mode

```bash
npm run test:watch
```

### Test with MCP Inspector

The [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector) provides an interactive UI to test your server:

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

This opens a web UI at `http://localhost:6274` where you can:
- Browse all registered tools
- Fill in parameters and execute tools interactively
- View raw JSON-RPC request/response messages
- Debug errors in real time

### Test structure

```
tests/
└── unit/
    ├── guards.test.ts          # Read-only enforcement & bypass prevention
    ├── validation.test.ts      # Table name validation & SQL injection prevention
    ├── config.test.ts          # Environment variable parsing & defaults
    └── tools/
        ├── describeTable.test.ts
        ├── sampleData.test.ts
        ├── explainQuery.test.ts
        ├── rowCount.test.ts
        ├── listTables.test.ts
        └── listDatabases.test.ts
```

## Development

```bash
# Run in development mode
npm run dev

# Build TypeScript to JavaScript
npm run build

# Run compiled server
npm start

# Run tests
npm test
```

## Security

- **Read-only mode** (enabled by default): Blocks `INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `CREATE`, `TRUNCATE`, `REPLACE`, `RENAME`, `GRANT`, `REVOKE`, `LOAD`, and other write operations. SQL comments are stripped before keyword detection to prevent bypass attempts.
- **Table name validation**: All table and database name parameters are validated against a strict character allowlist (`a-z`, `A-Z`, `0-9`, `_`, `-`, `.`) with a maximum length of 64 characters.
- **Parameterized queries**: Numeric parameters (like `limit`) use parameterized queries to prevent injection.

## License

MIT
