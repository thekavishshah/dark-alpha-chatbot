import {
  pgTable,
  serial,
  uuid,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { chats } from "./chats";

export const messagesTbl = pgTable("messages", {
  id:        serial("id").primaryKey(),
  chatId:    uuid("chat_id").references(() => chats.id).notNull(),
  userId:    text("user_id").notNull(),
  role:      text("role").notNull(),
  content:   text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
