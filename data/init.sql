-- ============================================
-- DMap - Community Map for Disabled People
-- Database Schema (PostGIS) — 1-10 Scoring
-- ============================================

-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================
-- 1. CATEGORIES
-- ============================================
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    name_vi VARCHAR(100),
    icon VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 2. POIS — Points of Interest
-- ============================================
CREATE TABLE pois (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_vi VARCHAR(255),
    description TEXT,
    address VARCHAR(500),

    -- PostGIS geometry (SRID 4326 = WGS84, compatible with MapLibre)
    location GEOMETRY(Point, 4326) NOT NULL,

    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    phone VARCHAR(20),
    website VARCHAR(255),
    opening_hours VARCHAR(100),

    -- Overall accessibility score: 1-10 scale (0 = unrated)
    overall_score SMALLINT DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 10),

    is_verified BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_pois_location ON pois USING GIST (location);
CREATE INDEX idx_pois_category ON pois (category_id);
CREATE INDEX idx_pois_score ON pois (overall_score);

-- ============================================
-- 3. ACCESSIBILITY_FEATURES
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
-- 4. POI_ACCESSIBILITY — N:N junction
-- ============================================
CREATE TABLE poi_accessibility (
    id SERIAL PRIMARY KEY,
    poi_id INTEGER NOT NULL REFERENCES pois(id) ON DELETE CASCADE,
    feature_id INTEGER NOT NULL REFERENCES accessibility_features(id) ON DELETE CASCADE,
    is_available BOOLEAN DEFAULT TRUE,
    -- Rating per feature: 1-10 scale
    quality_rating SMALLINT CHECK (quality_rating >= 1 AND quality_rating <= 10),
    note TEXT,
    reported_by VARCHAR(100),
    reported_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(poi_id, feature_id)
);

CREATE INDEX idx_poi_accessibility_poi ON poi_accessibility (poi_id);

-- ============================================
-- 5. USER_REVIEWS
-- ============================================
CREATE TABLE user_reviews (
    id SERIAL PRIMARY KEY,
    poi_id INTEGER NOT NULL REFERENCES pois(id) ON DELETE CASCADE,
    reviewer_name VARCHAR(100),
    -- Review rating: 1-10 scale
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 10),
    comment TEXT,
    disability_type VARCHAR(50),
    visited_at DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reviews_poi ON user_reviews (poi_id);

-- ============================================
-- TRIGGER: Auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_pois_updated
    BEFORE UPDATE ON pois
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ============================================
-- SEED: Categories
-- ============================================
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

-- ============================================
-- SEED: Accessibility Features
-- ============================================
INSERT INTO accessibility_features (name, name_vi, icon, feature_group, description) VALUES
    -- Mobility
    ('wheelchair_ramp',    'Lối đi xe lăn',           'wheelchair',    'mobility',  'Có đường dốc cho xe lăn'),
    ('elevator',           'Thang máy',               'arrow-up-down', 'mobility',  'Có thang máy cho người khuyết tật'),
    ('accessible_parking', 'Bãi đỗ xe hỗ trợ',       'car',           'mobility',  'Có chỗ đỗ xe dành riêng'),
    ('wide_doorway',       'Cửa rộng',                'door-open',     'mobility',  'Cửa đủ rộng cho xe lăn (≥90cm)'),
    ('accessible_toilet',  'Nhà vệ sinh hỗ trợ',     'bath',          'mobility',  'Nhà vệ sinh thiết kế cho NKT'),
    ('flat_surface',       'Mặt phẳng, không bậc',    'road',          'mobility',  'Đường đi bằng phẳng'),
    ('handrails',          'Tay vịn',                 'grip-lines',    'mobility',  'Có tay vịn hỗ trợ'),
    -- Visual
    ('braille_sign',       'Bảng chữ nổi Braille',    'braille',       'visual',    'Có bảng chữ nổi'),
    ('audio_signal',       'Âm thanh hỗ trợ',         'volume-high',   'visual',    'Có tín hiệu âm thanh'),
    ('tactile_paving',     'Gạch dẫn đường',          'road',          'visual',    'Có gạch tactile dẫn đường'),
    ('high_contrast_sign', 'Biển báo tương phản cao', 'eye',           'visual',    'Biển báo dễ nhìn'),
    -- Hearing
    ('sign_language',      'Ngôn ngữ ký hiệu',       'hands',         'hearing',   'Nhân viên biết ký hiệu'),
    ('visual_alarm',       'Chuông báo hình ảnh',     'bell',          'hearing',   'Báo động bằng hình ảnh/đèn'),
    ('hearing_loop',       'Vòng cảm ứng thính giác', 'ear-listen',    'hearing',   'Có thiết bị hỗ trợ thính giác'),
    -- Cognitive
    ('simple_signage',     'Biển báo đơn giản',       'signs-post',    'cognitive', 'Biển báo dễ hiểu'),
    ('quiet_space',        'Không gian yên tĩnh',     'volume-xmark',  'cognitive', 'Có khu vực yên tĩnh');

-- ============================================
-- SEED: Sample POIs near Quang Trung Software City, Q12
-- ============================================
INSERT INTO pois (name, name_vi, description, address, location, category_id, overall_score, is_verified) VALUES
    ('Quang Trung Software City',
     'Công Viên Phần Mềm Quang Trung',
     'Khu công nghệ phần mềm lớn nhất TP.HCM. Có thang máy, lối đi rộng.',
     'Tô Ký, Trung Mỹ Tây, Quận 12, TP.HCM',
     ST_SetSRID(ST_MakePoint(106.6280, 10.8540), 4326),
     7, 7, TRUE),

    ('Bệnh viện Quận 12',
     'Bệnh viện Quận 12',
     'Bệnh viện có lối đi xe lăn, thang máy ở tòa chính.',
     'Lê Thị Riêng, Thới An, Quận 12, TP.HCM',
     ST_SetSRID(ST_MakePoint(106.6350, 10.8580), 4326),
     2, 6, TRUE),

    ('Chợ Quang Trung',
     'Chợ Quang Trung',
     'Chợ truyền thống. Lối đi hẹp, khó khăn cho xe lăn.',
     'Quang Trung, Quận 12, TP.HCM',
     ST_SetSRID(ST_MakePoint(106.6260, 10.8510), 4326),
     5, 3, FALSE);

-- Link accessibility features to sample POIs
INSERT INTO poi_accessibility (poi_id, feature_id, is_available, quality_rating, note) VALUES
    -- QTSC: ramp + elevator + wide doors
    (1, 1, TRUE,  7, 'Đường dốc tốt ở các tòa nhà chính'),
    (1, 2, TRUE,  8, 'Thang máy hiện đại'),
    (1, 4, TRUE,  8, 'Cửa tự động rộng'),
    (1, 5, TRUE,  6, 'WC hỗ trợ ở tầng 1 một số tòa'),
    -- Hospital: ramp + elevator + toilet
    (2, 1, TRUE,  6, 'Đường dốc ở cổng chính'),
    (2, 2, TRUE,  7, 'Thang máy tòa chính'),
    (2, 5, TRUE,  5, 'Nhà vệ sinh tầng 1'),
    -- Market: no ramp, uneven surface
    (3, 1, FALSE, NULL, 'Không có lối đi xe lăn'),
    (3, 6, FALSE, NULL, 'Nhiều bậc thềm, đường gồ ghề');
