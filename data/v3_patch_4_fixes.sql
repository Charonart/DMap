-- v3_patch_4_fixes.sql
-- Fix runtime errors found during deployment testing
-- Run with: psql -U lequy -d disability_map -f data/v3_patch_4_fixes.sql

-- ═══════════════════════════════════════════
-- 1. Add helpful_count column to user_reviews
--    Error: "column ur.helpful_count does not exist"
-- ═══════════════════════════════════════════
ALTER TABLE user_reviews ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0;

-- ═══════════════════════════════════════════
-- 2. Create review_reactions table (Module 2)
--    Error: (no direct error yet, but needed for helpful votes)
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS review_reactions (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    review_id INTEGER REFERENCES user_reviews(id) ON DELETE CASCADE,
    reaction_type VARCHAR(20) DEFAULT 'helpful',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, review_id)
);

-- ═══════════════════════════════════════════
-- 3. Create poi_claims table (Module 3)
--    Error: "relation "poi_claims" does not exist"
-- ═══════════════════════════════════════════
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

-- ═══════════════════════════════════════════
-- 4. Create review_reports table (Module 5)
--    Error: "relation "review_reports" does not exist"
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS review_reports (
    id SERIAL PRIMARY KEY,
    review_id INTEGER REFERENCES user_reviews(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_review_report UNIQUE (user_id, review_id)
);

-- ═══════════════════════════════════════════
-- 5. Add note column to pois (for admin review feedback)
--    Error: "column "note" of relation "pois" does not exist"
-- ═══════════════════════════════════════════
ALTER TABLE pois ADD COLUMN IF NOT EXISTS note TEXT;

-- Done!
SELECT 'v3_patch_4_fixes.sql applied successfully' AS result;
