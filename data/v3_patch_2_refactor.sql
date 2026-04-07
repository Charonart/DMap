-- v3_patch_2_refactor.sql

-- 1. Thêm liên kết Ảnh vào Review để giải quyết mồ côi ảnh
ALTER TABLE poi_photos ADD COLUMN review_id INTEGER REFERENCES user_reviews(id) ON DELETE CASCADE;

-- 2. Thêm Soft-Delete cho POI và User
ALTER TABLE pois ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 3. Cài đặt Index Tìm Kiếm Full Text (pg_trgm) cho tên địa điểm và địa chỉ
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_pois_name_trgm ON pois USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_pois_address_trgm ON pois USING gin (address gin_trgm_ops);
