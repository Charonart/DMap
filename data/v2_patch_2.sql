-- ==========================================
-- DMap V2 Patch 2: Edit History / Audit Log
-- ==========================================

-- 1. Create edit_history table
CREATE TABLE IF NOT EXISTS edit_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    poi_id INTEGER REFERENCES pois(id) ON DELETE CASCADE,
    previous_data JSONB NOT NULL,
    action_type VARCHAR(50) DEFAULT 'update' CHECK (action_type IN ('update', 'delete')),
    edited_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
