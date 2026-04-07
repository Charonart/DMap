const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { requireAuth } = require('../middleware/auth');

// POST /api/reviews/:review_id/report — flag inappropriate review
router.post('/:review_id/report', requireAuth, reportController.reportReview);

module.exports = router;
