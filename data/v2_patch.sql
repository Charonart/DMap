-- ==========================================
-- DMap V2 Patch: Authentication & Users Table
-- ==========================================

-- 1. Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'banned')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Alter pois table to add user_id (optional for backward compatibility)
ALTER TABLE pois 
ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- 3. Alter user_reviews table to add user_id
ALTER TABLE user_reviews
ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;

-- 4. Alter poi_accessibility to add user_id
ALTER TABLE poi_accessibility
ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- 5. Add a default Admin account
-- Password is 'admin123' (bcrypted)
INSERT INTO users (email, password_hash, role)
VALUES ('admin@dmap.vn', '$2a$10$wO3ZJ.P0uVlJ0C9F1zKJeutE.J23FvB0b/P9.Z3eQY3jRyVQK.zRe', 'admin')
ON CONFLICT (email) DO NOTHING;
