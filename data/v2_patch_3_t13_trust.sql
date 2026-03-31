-- data/v2_patch_3_t13_trust.sql

-- 1. Add trust_score column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS trust_score NUMERIC(3,2) DEFAULT 1.00;

-- 2. Function to recalculate POI's overall_score using Time-Decay and Trust Score
CREATE OR REPLACE FUNCTION recalculate_poi_score(target_poi_id INT)
RETURNS VOID AS $$
DECLARE
    v_total_weight NUMERIC := 0;
    v_total_weighted_score NUMERIC := 0;
    v_final_score SMALLINT;

    v_rv_weighted_score NUMERIC := 0;
    v_rv_weight NUMERIC := 0;
BEGIN
    -- A. Calculate from poi_accessibility
    -- Time decay: 0.5 if older than 1 year
    SELECT 
        COALESCE(SUM(
            pa.quality_rating * 
            COALESCE(u.trust_score, 1.0) * 
            (CASE WHEN pa.reported_at < NOW() - INTERVAL '12 months' THEN 0.5 ELSE 1.0 END)
        ), 0),
        COALESCE(SUM(
            COALESCE(u.trust_score, 1.0) * 
            (CASE WHEN pa.reported_at < NOW() - INTERVAL '12 months' THEN 0.5 ELSE 1.0 END)
        ), 0)
    INTO v_total_weighted_score, v_total_weight
    FROM poi_accessibility pa
    LEFT JOIN users u ON pa.user_id = u.id
    WHERE pa.poi_id = target_poi_id AND pa.quality_rating IS NOT NULL;

    -- B. Calculate from user_reviews
    SELECT 
        COALESCE(SUM(
            ur.rating * 
            COALESCE(u.trust_score, 1.0) * 
            (CASE WHEN ur.created_at < NOW() - INTERVAL '12 months' THEN 0.5 ELSE 1.0 END)
        ), 0),
        COALESCE(SUM(
            COALESCE(u.trust_score, 1.0) * 
            (CASE WHEN ur.created_at < NOW() - INTERVAL '12 months' THEN 0.5 ELSE 1.0 END)
        ), 0)
    INTO v_rv_weighted_score, v_rv_weight
    FROM user_reviews ur
    LEFT JOIN users u ON ur.user_id = u.id
    WHERE ur.poi_id = target_poi_id;

    -- Accumulate weights
    v_total_weighted_score := v_total_weighted_score + v_rv_weighted_score;
    v_total_weight := v_total_weight + v_rv_weight;

    -- C. Update POI score
    IF v_total_weight > 0 THEN
        v_final_score := ROUND(v_total_weighted_score / v_total_weight);
        IF v_final_score < 1 THEN v_final_score := 1; END IF;
        IF v_final_score > 10 THEN v_final_score := 10; END IF;
    ELSE
        -- 0 = unrated
        v_final_score := 0;
    END IF;

    UPDATE pois SET overall_score = v_final_score WHERE id = target_poi_id;
END;
$$ LANGUAGE plpgsql;
