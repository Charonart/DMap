// ============================================
// DMap AI Controller
// Handles: Chat, Semantic Search, Review Summary
// ============================================
const pool = require('../config/db');
const { getAIProvider } = require('../utils/aiProvider');
const { buildRAGContext } = require('../utils/ragContext');
const config = require('../config/aiConfig');

// ── Controller: Session Management ──────────

exports.createSession = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const anonId = !req.user ? req.headers['x-anon-id'] : null;

    if (!userId && !anonId) {
      return res.status(400).json({ status: 'error', message: 'Missing user identification' });
    }

    const result = await pool.query(
      `INSERT INTO ai_chat_sessions (user_id, anon_id) VALUES ($1, $2) RETURNING id`,
      [userId, anonId]
    );

    res.json({ status: 'success', data: { sessionId: result.rows[0].id } });
  } catch (err) {
    console.error('Create session error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to create session' });
  }
};

exports.getActiveSession = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const anonId = !req.user ? req.headers['x-anon-id'] : null;

    if (!userId && !anonId) {
      return res.status(400).json({ status: 'error', message: 'Missing user identification' });
    }

    // Get the most recently updated session
    const sessionQuery = userId
      ? `SELECT id FROM ai_chat_sessions WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1`
      : `SELECT id FROM ai_chat_sessions WHERE anon_id = $1 ORDER BY updated_at DESC LIMIT 1`;
      
    const sessionResult = await pool.query(sessionQuery, [userId || anonId]);

    if (sessionResult.rows.length === 0) {
      return res.json({ status: 'success', data: null });
    }

    const sessionId = sessionResult.rows[0].id;

    // Get last 20 messages for this session
    const messagesResult = await pool.query(
      `SELECT id, role, content, created_at 
       FROM ai_chat_messages 
       WHERE session_id = $1 
       ORDER BY created_at ASC 
       LIMIT 20`,
      [sessionId]
    );

    res.json({ 
      status: 'success', 
      data: { 
        sessionId, 
        messages: messagesResult.rows 
      } 
    });
  } catch (err) {
    console.error('Get session error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to get session' });
  }
};

// ── Controller: Chat ────────────────────────

exports.chat = async (req, res) => {
  try {
    const { message, poiId, sessionId, userLocation } = req.body;
    const userId = req.user ? req.user.id : null;
    const anonId = !req.user ? req.headers['x-anon-id'] : null;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ status: 'error', message: 'Tin nhắn không được để trống' });
    }

    if (message.length > config.maxMessageLength) {
      return res.status(400).json({ status: 'error', message: `Tin nhắn quá dài (tối đa ${config.maxMessageLength} ký tự)` });
    }

    // Check API key
    if (!process.env.AI_API_KEY) {
      return res.status(503).json({ status: 'error', message: 'Tính năng AI chưa được cấu hình. Vui lòng liên hệ quản trị viên.' });
    }

    // Anonymous rate limiting (3 messages per lifetime)
    if (!req.user) {
      if (!anonId) {
        return res.status(400).json({ status: 'error', message: 'Thiếu ID người dùng ẩn danh' });
      }

      const ip = req.ip || req.connection?.remoteAddress || 'unknown';

      const usageResult = await pool.query(
        `INSERT INTO ai_anonymous_usage (anon_id, ip_address, message_count, last_used_at)
         VALUES ($1, $2, 1, NOW())
         ON CONFLICT (anon_id) DO UPDATE SET
           message_count = ai_anonymous_usage.message_count + 1,
           last_used_at = NOW()
         RETURNING message_count`,
        [anonId, ip]
      );

      const count = usageResult.rows[0].message_count;
      if (count > config.anonymousMessageLimit) {
        return res.status(429).json({
          status: 'error',
          message: `Bạn đã dùng hết ${config.anonymousMessageLimit} tin nhắn miễn phí. Đăng nhập để tiếp tục sử dụng!`,
          data: { remainingMessages: 0, requiresLogin: true }
        });
      }

      req._anonRemaining = config.anonymousMessageLimit - count;
    }

    // 1. Resolve or Create Session
    let currentSessionId = sessionId;
    if (!currentSessionId) {
       const createRes = await pool.query(
         `INSERT INTO ai_chat_sessions (user_id, anon_id, title) VALUES ($1, $2, $3) RETURNING id`,
         [userId, anonId, message.substring(0, 50)]
       );
       currentSessionId = createRes.rows[0].id;
    }

    // 2. Save User Message
    await pool.query(
      `INSERT INTO ai_chat_messages (session_id, role, content) VALUES ($1, $2, $3)`,
      [currentSessionId, 'user', message.trim()]
    );
    await pool.query(`UPDATE ai_chat_sessions SET updated_at = NOW() WHERE id = $1`, [currentSessionId]);

    // 3. Retrieve Context via RAG
    // userLocation is expected as [lng, lat]
    const ragContext = await buildRAGContext(message, poiId, userLocation);
    let systemPrompt = config.CHAT_SYSTEM_PROMPT;
    
    if (ragContext) {
       systemPrompt += `\n\n## DỮ LIỆU HỆ THỐNG CUNG CẤP ĐỂ TRẢ LỜI:\n${ragContext}`;
    } else {
       systemPrompt += '\n\n## LƯU Ý: Không tìm thấy dữ liệu địa điểm nào khớp với yêu cầu của người dùng trong hệ thống.';
    }

    // 4. Retrieve History & Apply Compression if needed
    const historyRes = await pool.query(
      `SELECT role, content FROM ai_chat_messages WHERE session_id = $1 ORDER BY created_at ASC`,
      [currentSessionId]
    );
    
    let fullHistory = historyRes.rows;
    const sessionRes = await pool.query(`SELECT summary FROM ai_chat_sessions WHERE id = $1`, [currentSessionId]);
    let currentSummary = sessionRes.rows[0].summary;

    // Memory Compression Logic
    if (fullHistory.length > config.chatHistoryLimit) {
       const messagesToSummarize = fullHistory.slice(0, 10);
       const remainingMessages = fullHistory.slice(10);
       
       let summaryPrompt = "Tóm tắt ngắn gọn các ý chính của cuộc hội thoại sau thành 2-3 câu:\n\n";
       if (currentSummary) summaryPrompt = `Tóm tắt cũ:\n${currentSummary}\n\nCuộc trò chuyện mới:\n`;
       
       messagesToSummarize.forEach(m => {
          summaryPrompt += `${m.role === 'user' ? 'Người dùng' : 'Trợ lý'}: ${m.content}\n`;
       });

       try {
           const aiForSummary = getAIProvider();
           currentSummary = await aiForSummary.generateText(
              "Bạn là AI tóm tắt ngữ cảnh cuộc hội thoại.", [], summaryPrompt
           );
           
           // Save new summary and delete old messages to keep DB lean
           await pool.query(`UPDATE ai_chat_sessions SET summary = $1 WHERE id = $2`, [currentSummary, currentSessionId]);
           
           // We'll just rely on the DB keeping them for now, but pass compressed context to the main AI call
           fullHistory = remainingMessages; 
       } catch (e) {
           console.error("Compression error:", e);
           // Fallback to truncating if summary fails
           fullHistory = fullHistory.slice(-10);
       }
    }

    if (currentSummary) {
        systemPrompt += `\n\n## TÓM TẮT CUỘC TRÒ CHUYỆN TRƯỚC ĐÓ:\n${currentSummary}`;
    }

    // Exclude the last message (current user message) from history passed to provider
    // and limit the context window to prevent token overflow.
    const historyForAI = fullHistory.slice(0, -1).slice(-config.chatContextWindow).map(m => ({
       role: m.role,
       content: m.content
    }));

    // 5. Generate Reply
    const ai = getAIProvider();
    const reply = await ai.generateText(systemPrompt, historyForAI, message.trim());

    // 6. Parse and Save Reply
    const suggestedQuestions = [];
    const lines = reply.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('💡')) {
        suggestedQuestions.push(trimmed.replace(/^💡\s*/, ''));
      }
    }

    const cleanReply = lines
      .filter(line => !line.trim().startsWith('💡'))
      .join('\n')
      .trim();

    await pool.query(
      `INSERT INTO ai_chat_messages (session_id, role, content, metadata) VALUES ($1, $2, $3, $4)`,
      [currentSessionId, 'assistant', cleanReply, JSON.stringify({ suggestedQuestions: suggestedQuestions.slice(0, 3) })]
    );

    const responseData = {
      sessionId: currentSessionId,
      reply: cleanReply,
      suggestedQuestions: suggestedQuestions.slice(0, 3),
    };

    if (req._anonRemaining !== undefined) {
      responseData.remainingMessages = req._anonRemaining;
    }

    res.json({ status: 'success', data: responseData });
  } catch (err) {
    console.error('AI Chat error:', err);
    res.status(500).json({ status: 'error', message: 'Lỗi hệ thống AI. Vui lòng thử lại sau.' });
  }
};

// ── Controller: Semantic Search ─────────────

exports.semanticSearch = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 3) {
      return res.status(400).json({ status: 'error', message: 'Từ khóa tìm kiếm quá ngắn' });
    }

    if (!process.env.AI_API_KEY) {
      return res.status(503).json({ status: 'error', message: 'Tính năng AI chưa được cấu hình' });
    }

    // Step 1: Use AI to extract structured intent
    const ai = getAIProvider();
    const intentRaw = await ai.generateText(
      config.SEARCH_INTENT_PROMPT,
      [],
      q.trim()
    );

    // Parse JSON from AI response (handle potential markdown wrapping)
    let intent;
    try {
      const jsonMatch = intentRaw.match(/\{[\s\S]*\}/);
      intent = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (parseErr) {
      console.warn('Failed to parse AI search intent, falling back to keyword search:', parseErr.message);
      intent = null;
    }

    // Step 2: Build SQL query from intent
    const conditions = [];
    const params = [];
    let paramIdx = 1;

    if (intent?.category) {
      conditions.push(`c.name = $${paramIdx}`);
      params.push(intent.category);
      paramIdx++;
    }

    if (intent?.minScore && intent.minScore > 0) {
      conditions.push(`p.overall_score >= $${paramIdx}`);
      params.push(intent.minScore);
      paramIdx++;
    }

    if (intent?.area) {
      conditions.push(`p.address ILIKE $${paramIdx}`);
      params.push(`%${intent.area}%`);
      paramIdx++;
    }

    // Feature filter — POI must have these accessibility features
    if (intent?.features && intent.features.length > 0) {
      conditions.push(`
        EXISTS (
          SELECT 1 FROM poi_accessibility pa
          JOIN accessibility_features af ON pa.feature_id = af.id
          WHERE pa.poi_id = p.id AND pa.is_available = true
          AND af.name = ANY($${paramIdx})
        )
      `);
      params.push(intent.features);
      paramIdx++;
    }

    // Keyword FTS fallback
    if (intent?.keywords && intent.keywords.length > 0) {
      const tsQuery = intent.keywords.map(k => k.replace(/[^a-zA-ZÀ-ỹ0-9\s]/g, '')).join(' & ');
      if (tsQuery.trim()) {
        conditions.push(`
          to_tsvector('simple', coalesce(p.name,'') || ' ' || coalesce(p.name_vi,'') || ' ' || coalesce(p.address,''))
          @@ to_tsquery('simple', $${paramIdx})
        `);
        params.push(tsQuery);
        paramIdx++;
      }
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT p.id, p.name, p.name_vi, p.address, p.overall_score,
             p.phone, p.opening_hours, p.is_verified,
             c.name_vi as category_name, c.icon as category_icon,
             ST_X(p.location) as lng, ST_Y(p.location) as lat
      FROM pois p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY p.overall_score DESC NULLS LAST
      LIMIT 10
    `;

    const result = await pool.query(query, params);

    res.json({
      status: 'success',
      data: {
        results: result.rows,
        intent: intent, // Return parsed intent for transparency
        totalResults: result.rows.length,
      }
    });
  } catch (err) {
    console.error('Semantic search error:', err);
    res.status(500).json({ status: 'error', message: 'Lỗi tìm kiếm AI. Vui lòng thử lại.' });
  }
};

// ── Controller: Review Summary ──────────────

exports.getReviewSummary = async (req, res) => {
  try {
    const { poiId } = req.params;

    if (!poiId || isNaN(Number(poiId))) {
      return res.status(400).json({ status: 'error', message: 'Invalid POI ID' });
    }

    // Check if POI exists and has cached summary
    const poiResult = await pool.query(
      `SELECT id, ai_summary, ai_summary_updated_at FROM pois WHERE id = $1`,
      [poiId]
    );

    if (poiResult.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Địa điểm không tồn tại' });
    }

    const poi = poiResult.rows[0];

    // Count reviews
    const reviewCountResult = await pool.query(
      'SELECT COUNT(*) as count FROM user_reviews WHERE poi_id = $1',
      [poiId]
    );
    const reviewCount = parseInt(reviewCountResult.rows[0].count);

    if (reviewCount < 3) {
      return res.json({
        status: 'success',
        data: { summary: null, reviewCount, message: 'Cần ít nhất 3 đánh giá để tạo tóm tắt AI' }
      });
    }

    // Check cache validity: within 24h AND no newer reviews
    const cacheValid = poi.ai_summary && poi.ai_summary_updated_at && (() => {
      const cacheAge = Date.now() - new Date(poi.ai_summary_updated_at).getTime();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      return cacheAge < twentyFourHours;
    })();

    if (cacheValid) {
      // Check if any reviews are newer than cache
      const newerReviews = await pool.query(
        'SELECT COUNT(*) as count FROM user_reviews WHERE poi_id = $1 AND created_at > $2',
        [poiId, poi.ai_summary_updated_at]
      );

      if (parseInt(newerReviews.rows[0].count) === 0) {
        return res.json({
          status: 'success',
          data: { summary: poi.ai_summary, reviewCount, cached: true }
        });
      }
    }

    // Cache expired or invalidated — generate new summary
    if (!process.env.AI_API_KEY) {
      return res.status(503).json({ status: 'error', message: 'Tính năng AI chưa được cấu hình' });
    }

    // Fetch all reviews for this POI
    const reviewsResult = await pool.query(
      `SELECT rating, comment, disability_type, created_at
       FROM user_reviews
       WHERE poi_id = $1
       ORDER BY created_at DESC
       LIMIT 20`,
      [poiId]
    );

    // Build reviews text
    let reviewsText = '';
    for (const r of reviewsResult.rows) {
      reviewsText += `\n- Điểm: ${r.rating}/10`;
      if (r.disability_type) reviewsText += ` | Loại khuyết tật: ${r.disability_type}`;
      if (r.comment) reviewsText += ` | Nhận xét: "${r.comment}"`;
      const date = new Date(r.created_at).toLocaleDateString('vi-VN');
      reviewsText += ` | Ngày: ${date}`;
    }

    const ai = getAIProvider();
    const summary = await ai.generateText(
      config.REVIEW_SUMMARY_PROMPT,
      [],
      `Tổng số đánh giá: ${reviewCount}\n\nCác đánh giá gần nhất:${reviewsText}`
    );

    // Cache summary in DB
    await pool.query(
      'UPDATE pois SET ai_summary = $1, ai_summary_updated_at = NOW() WHERE id = $2',
      [summary.trim(), poiId]
    );

    res.json({
      status: 'success',
      data: { summary: summary.trim(), reviewCount, cached: false }
    });
  } catch (err) {
    console.error('Review summary error:', err);
    res.status(500).json({ status: 'error', message: 'Lỗi tạo tóm tắt AI. Vui lòng thử lại.' });
  }
};
