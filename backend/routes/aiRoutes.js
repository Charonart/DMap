// ============================================
// DMap AI Routes
// POST /api/ai/chat          — Chatbot
// GET  /api/ai/search        — Semantic search
// GET  /api/ai/summary/:poiId — Review summary
// ============================================
const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const aiController = require('../controllers/aiController');
const { optionalAuth } = require('../middleware/auth');

// ── Rate Limiters ──────────────────────────

// Chat: 10 messages per minute for logged-in users
// (Anonymous 3/lifetime is handled in controller via DB)
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: {
    status: 'error',
    message: 'Quá nhiều tin nhắn. Vui lòng chờ 1 phút.',
  },
  // Skip rate limit for anonymous (handled by controller)
  skip: (req) => !req.user,
});

// Search: 5 per minute
const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    status: 'error',
    message: 'Quá nhiều yêu cầu tìm kiếm. Vui lòng chờ 1 phút.',
  },
});

// Summary: 10 per minute
const summaryLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    status: 'error',
    message: 'Quá nhiều yêu cầu. Vui lòng chờ 1 phút.',
  },
});

// ── Routes ──────────────────────────────────

// Sessions
router.post('/sessions', optionalAuth, chatLimiter, aiController.createSession);
router.get('/sessions/active', optionalAuth, aiController.getActiveSession);

// Chat & RAG
router.post('/chat', optionalAuth, chatLimiter, aiController.chat);
router.get('/search', searchLimiter, aiController.semanticSearch);
router.get('/summary/:poiId', summaryLimiter, aiController.getReviewSummary);

module.exports = router;
