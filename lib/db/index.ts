// lib/db/index.ts
import { drizzle } from 'drizzle-orm/vercel-postgres';   // ← change if you use a different driver
import { sql } from '@vercel/postgres';

import * as schema from './schema';  // exports ticket, user, chat, …

/** The Drizzle client your app will import everywhere */
export const db = drizzle(sql, { schema });

/** Re-export every table so callers can `import { ticket } from '@/lib/db'` */
export * from './schema';
