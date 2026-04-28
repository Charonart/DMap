-- ============================================
-- DMap AI Features — Chat Memory Migration
-- ============================================

-- Session: 1 user/anon có nhiều sessions
CREATE TABLE IF NOT EXISTS ai_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  anon_id VARCHAR(64),                    -- for anonymous users
  title VARCHAR(255),                     -- auto-generated from first message
  summary TEXT,                           -- compressed summary of old messages
  poi_context_id INTEGER REFERENCES pois(id) ON DELETE SET NULL, -- last POI discussed
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CHECK (user_id IS NOT NULL OR anon_id IS NOT NULL)
);

-- Messages: each message in a session
CREATE TABLE IF NOT EXISTS ai_chat_messages (
  id SERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
  role VARCHAR(10) NOT NULL,              -- 'user' | 'assistant'
  content TEXT NOT NULL,
  metadata JSONB,                         -- suggested_questions, poi_id mentioned, etc.
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON ai_chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_anon ON ai_chat_sessions(anon_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON ai_chat_messages(session_id);

SELECT 'Chat Memory migration complete' AS status;
