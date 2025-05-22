-- 0003_add_userid_to_chats_and_messages.sql

-- 1) add user_id to chats
ALTER TABLE chats
  ADD COLUMN user_id TEXT;

-- 2) add user_id to messages
ALTER TABLE messages
  ADD COLUMN user_id TEXT;
