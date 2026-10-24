import path from "node:path";
import fs from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { drizzle as drizzleNode } from "drizzle-orm/node-postgres";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { config } from "../config.js";
import { DDL } from "./ddl.js";
import * as schema from "./schema.js";

type Database = NodePgDatabase<typeof schema>;

interface DatabaseHandle {
  db: Database;
  close: () => Promise<void>;
}

let handlePromise: Promise<DatabaseHandle> | null = null;

async function connect(): Promise<DatabaseHandle> {
  if (config.databaseUrl.startsWith("postgres")) {
    const pool = new Pool({
      connectionString: config.databaseUrl,
      max: 10,
      ssl: config.pgSsl ? { rejectUnauthorized: false } : false,
    });
    await pool.query(DDL);
    const db = drizzleNode(pool, { schema }) as unknown as Database;
    return {
      db,
      close: async () => {
        await pool.end();
      },
    };
  }

  // Embedded PostgreSQL for local development and demos.
  const dataDir =
    config.pgliteDataDir === "memory://"
      ? config.pgliteDataDir
      : path.resolve(process.cwd(), config.pgliteDataDir);

  if (dataDir !== "memory://") {
    await fs.mkdir(path.dirname(dataDir), { recursive: true });
  }

  const client = new PGlite(dataDir);
  await client.waitReady;
  await client.exec(DDL);
  const db = drizzlePglite(client, { schema }) as unknown as Database;
  return {
    db,
    close: async () => {
      await client.close();
    },
  };
}

export function getDb(): Promise<Database> {
  if (!handlePromise) {
    handlePromise = connect();
  }
  return handlePromise.then((handle) => handle.db);
}

export async function closeDb(): Promise<void> {
  if (!handlePromise) return;
  const handle = await handlePromise.catch(() => null);
  handlePromise = null;
  if (handle) await handle.close();
}
