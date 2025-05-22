import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const chats = pgTable("chats", {
  id:        uuid("id").primaryKey().defaultRandom(),
  userId:    text("user_id").notNull(),
  title:     text("title"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
