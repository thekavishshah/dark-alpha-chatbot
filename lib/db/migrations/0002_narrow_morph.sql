ALTER TABLE "memories" DROP CONSTRAINT "memories_key_text_unique";--> statement-breakpoint
ALTER TABLE "chats" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "memories" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "memories_userid_key_text" ON "memories" USING btree ("user_id","key_text");