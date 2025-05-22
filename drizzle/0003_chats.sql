-- drizzle/0003_chats.sql  (corrected)
CREATE TABLE IF NOT EXISTS chats (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title      text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id         bigserial PRIMARY KEY,
  chat_id    uuid REFERENCES chats(id) ON DELETE CASCADE,
  role       text    NOT NULL,  -- 'user' | 'assistant'
  content    text    NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS messages_chat_idx ON messages(chat_id);
