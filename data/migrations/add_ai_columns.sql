-- ============================================
-- DMap AI Features — Database Migration
-- Run: psql -U lequy -d disability_map -f add_ai_columns.sql
-- ============================================

-- 1. AI Review Summary cache on pois
ALTER TABLE pois ADD COLUMN IF NOT EXISTS ai_summary TEXT;
ALTER TABLE pois ADD COLUMN IF NOT EXISTS ai_summary_updated_at TIMESTAMP;

-- 2. Anonymous AI usage tracking (3 messages per lifetime)
CREATE TABLE IF NOT EXISTS ai_anonymous_usage (
  id SERIAL PRIMARY KEY,
  anon_id VARCHAR(64) NOT NULL,
  ip_address INET,
  message_count SMALLINT DEFAULT 0,
  first_used_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(anon_id)
);

CREATE INDEX IF NOT EXISTS idx_anon_usage_id ON ai_anonymous_usage(anon_id);

-- 3. Full-text search index for semantic search fallback
CREATE INDEX IF NOT EXISTS idx_pois_fts
  ON pois USING gin(
    to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(name_vi,'') || ' ' || coalesce(address,''))
  );

-- Done
SELECT 'AI migration complete' AS status;
