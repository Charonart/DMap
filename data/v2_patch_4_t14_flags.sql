-- data/v2_patch_4_t14_flags.sql

-- 1. Create table for POI flags/reports
CREATE TABLE IF NOT EXISTS poi_flags (
    id SERIAL PRIMARY KEY,
    poi_id INTEGER NOT NULL REFERENCES pois(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(poi_id, user_id)
);

-- 2. Add flag_count and is_hidden columns to pois
ALTER TABLE pois ADD COLUMN IF NOT EXISTS flag_count INTEGER DEFAULT 0;
ALTER TABLE pois ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE;
