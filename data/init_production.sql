-- ============================================
-- DMap - Community Map for Disabled People
-- Production Database Schema (PostGIS)
-- Consolidated from init.sql and patches v2-v3
-- ============================================

-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- For gen_random_uuid()

-- ============================================
-- 1. USERS
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'banned')),
    trust_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- ============================================
-- 2. CATEGORIES
-- ============================================
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    name_vi VARCHAR(100),
    icon VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. POIS — Points of Interest
-- ============================================
CREATE TABLE pois (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_vi VARCHAR(255),
    description TEXT,
    address VARCHAR(500),

    -- PostGIS geometry (SRID 4326 = WGS84)
    location GEOMETRY(Point, 4326) NOT NULL,

    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    phone VARCHAR(20),
    website VARCHAR(255),
    opening_hours VARCHAR(100),

    -- Overall accessibility score: 1-10 scale (0 = unrated)
    overall_score SMALLINT DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 10),

    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    is_verified BOOLEAN DEFAULT FALSE,
    is_hidden BOOLEAN DEFAULT FALSE,
    note TEXT, -- Admin review feedback
    owner_user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Verified business owner
    
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

CREATE INDEX idx_pois_location ON pois USING GIST (location);
CREATE INDEX idx_pois_category ON pois (category_id);
CREATE INDEX idx_pois_status ON pois (status);

-- ============================================
-- 4. ACCESSIBILITY_FEATURES
-- ============================================
CREATE TABLE accessibility_features (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    name_vi VARCHAR(100),
    icon VARCHAR(50),
    description TEXT,
    feature_group VARCHAR(50) -- mobility, visual, hearing, cognitive
);

-- ============================================
-- 5. POI_ACCESSIBILITY — N:N junction
-- ============================================
CREATE TABLE poi_accessibility (
    id SERIAL PRIMARY KEY,
    poi_id INTEGER NOT NULL REFERENCES pois(id) ON DELETE CASCADE,
    feature_id INTEGER NOT NULL REFERENCES accessibility_features(id) ON DELETE CASCADE,
    is_available BOOLEAN DEFAULT TRUE,
    -- Rating per feature: 1-10 scale
    quality_rating SMALLINT CHECK (quality_rating >= 1 AND quality_rating <= 10),
    note TEXT,
    reported_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(poi_id, feature_id)
);

-- ============================================
-- 6. USER_REVIEWS
-- ============================================
CREATE TABLE user_reviews (
    id SERIAL PRIMARY KEY,
    poi_id INTEGER NOT NULL REFERENCES pois(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    -- Review rating: 1-10 scale
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 10),
    comment TEXT,
    helpful_count INTEGER DEFAULT 0,
    disability_type VARCHAR(50),
    visited_at DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- ============================================
-- 7. POI_PHOTOS
-- ============================================
CREATE TABLE poi_photos (
    id SERIAL PRIMARY KEY,
    poi_id INTEGER NOT NULL REFERENCES pois(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    image_url TEXT NOT NULL,
    description TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 8. POI_BOOKMARKS (Saved Places)
-- ============================================
CREATE TABLE poi_bookmarks (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    poi_id INTEGER NOT NULL REFERENCES pois(id) ON DELETE CASCADE,
    collection_name VARCHAR(50) DEFAULT 'Yêu thích',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, poi_id)
);

-- ============================================
-- 9. REVIEW_REACTIONS (Helpful Votes)
-- ============================================
CREATE TABLE review_reactions (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    review_id INTEGER REFERENCES user_reviews(id) ON DELETE CASCADE,
    reaction_type VARCHAR(20) DEFAULT 'helpful',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, review_id)
);

-- ============================================
-- 10. POI_CLAIMS (Business Verification)
-- ============================================
CREATE TABLE poi_claims (
    id SERIAL PRIMARY KEY,
    poi_id INTEGER REFERENCES pois(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    document_url TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 11. REVIEW_REPORTS
-- ============================================
CREATE TABLE review_reports (
    id SERIAL PRIMARY KEY,
    review_id INTEGER REFERENCES user_reviews(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_review_report UNIQUE (user_id, review_id)
);

-- ============================================
-- TRIGGERS: Auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trigger_pois_updated BEFORE UPDATE ON pois FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ============================================
-- SEED DATA
-- ============================================

-- 1. Categories
INSERT INTO categories (name, name_vi, icon, description) VALUES
    ('restaurant',    'Nhà hàng',       'utensils',     'Nhà hàng, quán ăn'),
    ('hospital',      'Bệnh viện',      'hospital',     'Bệnh viện, phòng khám'),
    ('school',        'Trường học',      'school',       'Trường học, trung tâm đào tạo'),
    ('park',          'Công viên',       'tree',         'Công viên, khu vui chơi'),
    ('shopping',      'Mua sắm',        'shopping-bag', 'Trung tâm thương mại, siêu thị'),
    ('transport',     'Giao thông',      'bus',          'Trạm xe buýt, nhà ga'),
    ('government',    'Cơ quan công',    'building',     'Cơ quan nhà nước, UBND'),
    ('accommodation', 'Lưu trú',        'bed',          'Khách sạn, nhà nghỉ'),
    ('entertainment', 'Giải trí',       'film',         'Rạp phim, nhà hát, bảo tàng'),
    ('healthcare',    'Y tế',           'heart-pulse',  'Nhà thuốc, phòng khám chuyên khoa');

-- 2. Accessibility Features
INSERT INTO accessibility_features (name, name_vi, icon, feature_group, description) VALUES
    ('wheelchair_ramp',    'Lối đi xe lăn',           'wheelchair',    'mobility',  'Có đường dốc cho xe lăn'),
    ('elevator',           'Thang máy',               'arrow-up-down', 'mobility',  'Có thang máy cho người khuyết tật'),
    ('accessible_parking', 'Bãi đỗ xe hỗ trợ',       'car',           'mobility',  'Có chỗ đỗ xe dành riêng'),
    ('wide_doorway',       'Cửa rộng',                'door-open',     'mobility',  'Cửa đủ rộng cho xe lăn (≥90cm)'),
    ('accessible_toilet',  'Nhà vệ sinh hỗ trợ',     'bath',          'mobility',  'Nhà vệ sinh thiết kế cho NKT'),
    ('flat_surface',       'Mặt phẳng, không bậc',    'road',          'mobility',  'Đường đi bằng phẳng'),
    ('handrails',          'Tay vịn',                 'grip-lines',    'mobility',  'Có tay vịn hỗ trợ'),
    ('braille_sign',       'Bảng chữ nổi Braille',    'braille',       'visual',    'Có bảng chữ nổi'),
    ('audio_signal',       'Âm thanh hỗ trợ',         'volume-high',   'visual',    'Có tín hiệu âm thanh'),
    ('tactile_paving',     'Gạch dẫn đường',          'road',          'visual',    'Có gạch tactile dẫn đường'),
    ('high_contrast_sign', 'Biển báo tương phản cao', 'eye',           'visual',    'Biển báo dễ nhìn'),
    ('sign_language',      'Ngôn ngữ ký hiệu',       'hands',         'hearing',   'Nhân viên biết ký hiệu'),
    ('visual_alarm',       'Chuông báo hình ảnh',     'bell',          'hearing',   'Báo động bằng hình ảnh/đèn'),
    ('hearing_loop',       'Vòng cảm ứng thính giác', 'ear-listen',    'hearing',   'Có thiết bị hỗ trợ thính giác'),
    ('simple_signage',     'Biển báo đơn giản',       'signs-post',    'cognitive', 'Biển báo dễ hiểu'),
    ('quiet_space',        'Không gian yên tĩnh',     'volume-xmark',  'cognitive', 'Có khu vực yên tĩnh');

-- 3. (Optional) Initial Admin
-- Email: admin@dmap.com / Password: DMapAdmin2026! (hashed with bcrypt 10)
-- INSERT INTO users (id, username, email, password_hash, role) 
-- VALUES ('00000000-0000-0000-0000-000000000001', 'admin', 'admin@dmap.com', '$2b$10$7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7O7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7', 'admin');
