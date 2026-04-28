const pool = require('../config/db');

/**
 * Basic Rule-Based Intent Detection
 * Extracts potential POI names, features, categories, and location needs from a natural language query.
 */
function detectIntent(message) {
  const intent = {
    poiMentions: [],      // POI names mentioned
    features: [],         // a11y features asked about
    needsNearby: false,   // "gần đây", "xung quanh"
    needsCompare: false,  // "so sánh", "nào tốt hơn"
    needsCategory: null,  // "nhà hàng", "bệnh viện"
  };

  const lowerMsg = message.toLowerCase();

  // 1. Feature keywords -> DB feature names
  const featureMap = {
    'xe lăn': 'wheelchair_ramp',
    'dốc': 'wheelchair_ramp',
    'thang máy': 'elevator',
    'bãi đỗ xe': 'accessible_parking',
    'đỗ xe': 'accessible_parking',
    'cửa rộng': 'wide_doorway',
    'nhà vệ sinh': 'accessible_toilet',
    'toilet': 'accessible_toilet',
    'wc': 'accessible_toilet',
    'bằng phẳng': 'flat_surface',
    'bậc cấp': 'flat_surface', // usually asking if there's no step -> flat_surface
    'tay vịn': 'handrails',
    'braille': 'braille_sign',
    'chữ nổi': 'braille_sign',
    'âm thanh': 'audio_signal',
    'gạch xúc giác': 'tactile_paving',
    'ngôn ngữ ký hiệu': 'sign_language',
    'báo cháy hình ảnh': 'visual_alarm',
    'hỗ trợ thính giác': 'hearing_loop'
  };

  for (const [keyword, feature] of Object.entries(featureMap)) {
    if (lowerMsg.includes(keyword) && !intent.features.includes(feature)) {
      intent.features.push(feature);
    }
  }

  // 2. Category keywords
  const categoryMap = {
    'nhà hàng': 'Nhà hàng / Quán ăn',
    'quán ăn': 'Nhà hàng / Quán ăn',
    'café': 'Nhà hàng / Quán ăn',
    'coffee': 'Nhà hàng / Quán ăn',
    'bệnh viện': 'Y tế',
    'phòng khám': 'Y tế',
    'y tế': 'Y tế',
    'trường học': 'Giáo dục',
    'giáo dục': 'Giáo dục',
    'công viên': 'Công viên',
    'mua sắm': 'Mua sắm',
    'siêu thị': 'Mua sắm',
    'chợ': 'Mua sắm',
    'giao thông': 'Giao thông công cộng',
    'xe buýt': 'Giao thông công cộng',
    'hành chính': 'Cơ quan hành chính',
    'lưu trú': 'Cơ sở lưu trú',
    'khách sạn': 'Cơ sở lưu trú',
    'giải trí': 'Vui chơi giải trí'
  };

  for (const [keyword, category] of Object.entries(categoryMap)) {
    if (lowerMsg.includes(keyword)) {
      intent.needsCategory = category;
      break; // Just pick the first match for simplicity
    }
  }

  // 3. Nearby detection
  if (/(gần đây|xung quanh|quanh đây|khu vực|chỗ này)/.test(lowerMsg)) {
    intent.needsNearby = true;
  }

  // 4. Comparison detection
  if (/(so sánh|nào tốt hơn|hơn|vs)/.test(lowerMsg)) {
    intent.needsCompare = true;
  }

  // 5. POI Name Extraction (very basic heuristic: capitalize words)
  // This is a naive extraction. In a real system, you might use NER.
  const words = message.split(/\s+/);
  let currentName = [];
  for (const word of words) {
    if (word && word[0] === word[0].toUpperCase() && /[A-Za-zÀ-ỹ]/.test(word[0])) {
      currentName.push(word);
    } else {
      if (currentName.length > 1) {
         // Only consider multi-word capitalizations to avoid false positives at start of sentences
         intent.poiMentions.push(currentName.join(' ').replace(/[.,!?]$/, ''));
      }
      currentName = [];
    }
  }
  if (currentName.length > 1) {
      intent.poiMentions.push(currentName.join(' ').replace(/[.,!?]$/, ''));
  }

  return intent;
}

/**
 * Helper to build the context for a single POI (reused from controller)
 */
async function buildPOIContext(poiId) {
    try {
      const poiResult = await pool.query(
        `SELECT p.*, c.name_vi as category_name
         FROM pois p
         LEFT JOIN categories c ON p.category_id = c.id
         WHERE p.id = $1`,
        [poiId]
      );
  
      if (poiResult.rows.length === 0) return null;
      const poi = poiResult.rows[0];
  
      const featuresResult = await pool.query(
        `SELECT af.name, af.name_vi, af.feature_group, pa.is_available, pa.quality_rating, pa.note
         FROM poi_accessibility pa
         JOIN accessibility_features af ON pa.feature_id = af.id
         WHERE pa.poi_id = $1
         ORDER BY af.feature_group, af.name`,
        [poiId]
      );
  
      const reviewsResult = await pool.query(
        `SELECT rating, comment, disability_type, created_at
         FROM user_reviews
         WHERE poi_id = $1
         ORDER BY created_at DESC
         LIMIT 3`,
        [poiId]
      );
  
      let context = `\n## Địa điểm: ${poi.name}`;
      if (poi.name_vi) context += ` (${poi.name_vi})`;
      context += `\n- Loại: ${poi.category_name || 'Chưa phân loại'}`;
      context += `\n- Địa chỉ: ${poi.address || 'Chưa có'}`;
      context += `\n- Điểm tổng: ${poi.overall_score}/10`;
  
      if (featuresResult.rows.length > 0) {
        context += '\n### Tính năng tiếp cận:';
        for (const f of featuresResult.rows) {
            const available = f.is_available ? '✅' : '❌';
            const rating = f.quality_rating ? ` (${f.quality_rating}/10)` : '';
            context += `\n- ${available} ${f.name_vi || f.name}${rating}`;
            if (f.note) context += ` — ${f.note}`;
        }
      }
  
      if (reviewsResult.rows.length > 0) {
        context += `\n### Đánh giá gần đây:`;
        for (const r of reviewsResult.rows) {
          context += `\n- ${r.rating}/10: "${r.comment?.substring(0, 50)}..."`;
        }
      }
  
      return context;
    } catch (err) {
      console.error('Error building POI context:', err);
      return null;
    }
}

/**
 * Builds the RAG Context by querying DB based on detected intent.
 */
async function buildRAGContext(message, currentPoiId, userLocation) {
  const intent = detectIntent(message);
  let contextParts = [];

  // 1. Current POI
  if (currentPoiId) {
    const poiContext = await buildPOIContext(currentPoiId);
    if (poiContext) contextParts.push(`\n**ĐỊA ĐIỂM ĐANG CHỌN:**\n` + poiContext);
  }

  // 2. Mentioned POIs
  if (intent.poiMentions.length > 0) {
    // Escape single quotes for SQL ILIKE ANY array
    const searchTerms = intent.poiMentions.map(n => `%${n}%`);
    try {
      const pois = await pool.query(
        `SELECT id FROM pois WHERE name ILIKE ANY($1) LIMIT 3`,
        [searchTerms]
      );
      
      let mentionedContext = '';
      for (const poi of pois.rows) {
        if (poi.id !== parseInt(currentPoiId)) { // Avoid duplicating current POI
          const ctx = await buildPOIContext(poi.id);
          if (ctx) mentionedContext += ctx;
        }
      }
      if (mentionedContext) {
          contextParts.push(`\n**ĐỊA ĐIỂM ĐƯỢC NHẮC TỚI:**\n` + mentionedContext);
      }
    } catch (e) {
      console.error("Error fetching mentioned POIs:", e);
    }
  }

  // 3. Nearby POIs
  if (intent.needsNearby && userLocation && userLocation.length === 2) {
    try {
      // userLocation should be [lng, lat]
      const nearby = await pool.query(`
        SELECT p.id, p.name, p.overall_score,
               ST_Distance(p.location::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) as distance
        FROM pois p
        WHERE ST_DWithin(p.location::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, 2000)
        ORDER BY distance ASC
        LIMIT 5
      `, [userLocation[0], userLocation[1]]);

      if (nearby.rows.length > 0) {
        let nearbyText = `\n**ĐỊA ĐIỂM GẦN ĐÂY (Bán kính 2km):**`;
        for (const p of nearby.rows) {
          nearbyText += `\n- ${p.name} (Cách ${Math.round(p.distance)}m, Điểm: ${p.overall_score}/10)`;
        }
        contextParts.push(nearbyText);
      } else {
        contextParts.push(`\n**ĐỊA ĐIỂM GẦN ĐÂY:** Không tìm thấy địa điểm nào trong bán kính 2km.`);
      }
    } catch (e) {
      console.error("Error fetching nearby POIs:", e);
    }
  }

  // 4. Feature-specific Query (if no specific POI is selected/mentioned and user is looking for features)
  if (intent.features.length > 0 && !currentPoiId && intent.poiMentions.length === 0 && !intent.needsNearby) {
     try {
        const featured = await pool.query(`
          SELECT p.id, p.name, p.overall_score, p.address
          FROM pois p
          WHERE EXISTS (
            SELECT 1 FROM poi_accessibility pa
            JOIN accessibility_features af ON pa.feature_id = af.id
            WHERE pa.poi_id = p.id AND pa.is_available = true AND af.name = ANY($1)
          )
          ORDER BY p.overall_score DESC NULLS LAST
          LIMIT 5
        `, [intent.features]);

        if (featured.rows.length > 0) {
           let featureText = `\n**ĐỊA ĐIỂM CÓ TÍNH NĂNG (${intent.features.join(', ')}):**`;
           for (const p of featured.rows) {
             featureText += `\n- ${p.name} (${p.address || 'Không có địa chỉ'}, Điểm: ${p.overall_score}/10)`;
           }
           contextParts.push(featureText);
        }
     } catch (e) {
       console.error("Error fetching feature POIs:", e);
     }
  }

  return contextParts.join('\n\n');
}

module.exports = {
  detectIntent,
  buildPOIContext,
  buildRAGContext
};
