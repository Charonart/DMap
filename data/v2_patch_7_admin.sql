-- data/v2_patch_7_admin.sql

-- 1. Add 'note' to pois
ALTER TABLE pois ADD COLUMN IF NOT EXISTS note TEXT;

-- 2. Modify status column to include 'rejected'
ALTER TABLE pois DROP CONSTRAINT IF EXISTS pois_status_check;
ALTER TABLE pois ADD CONSTRAINT pois_status_check CHECK (status IN ('pending', 'approved', 'rejected'));

-- 3. Fix user_id: migrate 'created_by' (VARCHAR) to 'user_id' (INTEGER)
ALTER TABLE pois RENAME COLUMN created_by TO temp_created_by;
ALTER TABLE pois ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
UPDATE pois SET user_id = CAST(temp_created_by AS INTEGER) WHERE temp_created_by ~ '^[0-9]+$';
ALTER TABLE pois DROP COLUMN temp_created_by;
