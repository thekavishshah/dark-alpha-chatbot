import {
  pgTable,
  serial,
  text,
  vector,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/**
 * Global facts the bot “learns” (e.g. favourite colour = blue)
 */
export const memories = pgTable(
  "memories",
  {
    id:        serial("id").primaryKey(),
    userId:    text("user_id").notNull(),
    keyText:   text("key_text").notNull(),
    value:     text("value").notNull(),
    embedding: vector("embedding", { dimensions: 768 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    userKey: uniqueIndex("memories_userid_key_text").on(
      table.userId,
      table.keyText
    ),
  })
);
