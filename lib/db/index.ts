import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
export * from "lib/db/schema/memories";
export * from "lib/db/schema/embeddings";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);
