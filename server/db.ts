import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

if (!hasDatabaseUrl) {
  // Don't throw on import; only fail when a DB operation is actually attempted
  console.warn("DATABASE_URL not set. Postgres features will be disabled.");
}

export const pool = hasDatabaseUrl ? new Pool({ connectionString: process.env.DATABASE_URL }) : undefined as unknown as Pool;
export const db = hasDatabaseUrl
  ? drizzle(pool as Pool, { schema })
  : (new Proxy({}, {
      get() {
        throw new Error("DATABASE_URL not configured. This operation requires a Postgres database.");
      }
    }) as any);