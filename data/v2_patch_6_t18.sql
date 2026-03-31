-- data/v2_patch_6_t18.sql

-- 1. Add username to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50);

-- Auto-fill existing users username with first part of email if null
UPDATE users SET username = split_part(email, '@', 1) WHERE username IS NULL;

-- Make it unique after populating (optional but good practice)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_username_key') THEN
        ALTER TABLE users ADD CONSTRAINT users_username_key UNIQUE (username);
    END IF;
END $$;

-- 2. Add status to pois
ALTER TABLE pois ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';

-- Auto-approve existing POIs since they were created before this feature
UPDATE pois SET status = 'approved' WHERE status IS NULL OR status = 'pending';

-- 3. Add review_id to poi_photos
ALTER TABLE poi_photos ADD COLUMN IF NOT EXISTS review_id INTEGER REFERENCES user_reviews(id) ON DELETE CASCADE;
