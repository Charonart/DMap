-- v2_patch_10_fix_poi_accessibility_uuid.sql
-- Fix: poi_accessibility.user_id was left as INTEGER after the UUID migration (patch 9).

ALTER TABLE poi_accessibility ADD COLUMN new_user_id UUID;
UPDATE poi_accessibility SET new_user_id = (SELECT id FROM users WHERE users.id::text = poi_accessibility.user_id::text) WHERE user_id IS NOT NULL;
ALTER TABLE poi_accessibility DROP COLUMN user_id;
ALTER TABLE poi_accessibility RENAME COLUMN new_user_id TO user_id;
ALTER TABLE poi_accessibility ADD CONSTRAINT poi_accessibility_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
