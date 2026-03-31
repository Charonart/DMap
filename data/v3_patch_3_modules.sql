-- v3_patch_3_modules.sql
-- Module 2: Review Reactions (Helpful Votes)
CREATE TABLE IF NOT EXISTS review_reactions (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    review_id INTEGER REFERENCES user_reviews(id) ON DELETE CASCADE,
    reaction_type VARCHAR(20) DEFAULT 'helpful',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, review_id)
);
ALTER TABLE user_reviews ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0;

-- Module 3: POI Claims (Business Verification)
CREATE TABLE IF NOT EXISTS poi_claims (
    id SERIAL PRIMARY KEY,
    poi_id INTEGER REFERENCES pois(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    document_url TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE pois ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Module 5: Review Reports
CREATE TABLE IF NOT EXISTS review_reports (
    id SERIAL PRIMARY KEY,
    review_id INTEGER REFERENCES user_reviews(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_review_report UNIQUE (user_id, review_id)
);
