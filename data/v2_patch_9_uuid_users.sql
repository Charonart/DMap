-- v2_patch_9_uuid_users.sql

-- 1. Add a new UUID column to users
ALTER TABLE users ADD COLUMN new_id UUID DEFAULT gen_random_uuid();

-- 2. Add new UUID columns to referencing tables
ALTER TABLE pois ADD COLUMN new_user_id UUID;
ALTER TABLE user_reviews ADD COLUMN new_user_id UUID;
ALTER TABLE poi_flags ADD COLUMN new_user_id UUID;
ALTER TABLE edit_history ADD COLUMN new_user_id UUID;
ALTER TABLE poi_photos ADD COLUMN new_user_id UUID;

-- 3. Update referencing tables to hold the new UUIDs mapped from old integer IDs
UPDATE pois SET new_user_id = (SELECT new_id FROM users WHERE users.id = pois.user_id);
UPDATE user_reviews SET new_user_id = (SELECT new_id FROM users WHERE users.id = user_reviews.user_id);
UPDATE poi_flags SET new_user_id = (SELECT new_id FROM users WHERE users.id = poi_flags.user_id);
UPDATE edit_history SET new_user_id = (SELECT new_id FROM users WHERE users.id = edit_history.user_id);
UPDATE poi_photos SET new_user_id = (SELECT new_id FROM users WHERE users.id = poi_photos.user_id);

-- 4. Drop old integer columns (this will drop FK constraints too via CASCADE)
ALTER TABLE users DROP COLUMN id CASCADE;
ALTER TABLE users RENAME COLUMN new_id TO id;
ALTER TABLE users ADD PRIMARY KEY (id);

ALTER TABLE pois DROP COLUMN user_id CASCADE;
ALTER TABLE pois RENAME COLUMN new_user_id TO user_id;
ALTER TABLE pois ADD CONSTRAINT pois_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE user_reviews DROP COLUMN user_id CASCADE;
ALTER TABLE user_reviews RENAME COLUMN new_user_id TO user_id;
ALTER TABLE user_reviews ADD CONSTRAINT user_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE poi_flags DROP COLUMN user_id CASCADE;
ALTER TABLE poi_flags RENAME COLUMN new_user_id TO user_id;
ALTER TABLE poi_flags ADD CONSTRAINT poi_flags_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE edit_history DROP COLUMN user_id CASCADE;
ALTER TABLE edit_history RENAME COLUMN new_user_id TO user_id;
ALTER TABLE edit_history ADD CONSTRAINT edit_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE poi_photos DROP COLUMN user_id CASCADE;
ALTER TABLE poi_photos RENAME COLUMN new_user_id TO user_id;
ALTER TABLE poi_photos ADD CONSTRAINT poi_photos_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
