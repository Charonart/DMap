-- Fix remaining UUID dependencies
DO $$ 
DECLARE
    first_user UUID;
BEGIN
    SELECT id INTO first_user FROM users LIMIT 1;
    
    ALTER TABLE poi_accessibility DROP COLUMN IF EXISTS reported_by CASCADE;
    ALTER TABLE poi_accessibility ADD COLUMN reported_by UUID REFERENCES users(id) ON DELETE SET NULL;
    IF first_user IS NOT NULL THEN
        UPDATE poi_accessibility SET reported_by = first_user;
    END IF;
END $$;
