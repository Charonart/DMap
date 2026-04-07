-- data/v3_patch_1_bookmarks.sql
CREATE TABLE IF NOT EXISTS user_bookmarks (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    poi_id INTEGER REFERENCES pois(id) ON DELETE CASCADE,
    collection_name VARCHAR(100) DEFAULT 'Yêu thích',
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_poi_collection UNIQUE (user_id, poi_id, collection_name)
);

CREATE INDEX IF NOT EXISTS idx_user_bookmarks_userid ON user_bookmarks(user_id);
