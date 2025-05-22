-- 0003_update_memories_unique_index.sql

-- 1) Drop the old unique-on-key_text constraint (or index)
ALTER TABLE memories
  DROP CONSTRAINT IF EXISTS memories_key_text_unique;

-- 2) Add a composite unique constraint on (user_id, key_text)
ALTER TABLE memories
  ADD CONSTRAINT memories_userid_key_text_unique
    UNIQUE (user_id, key_text);
