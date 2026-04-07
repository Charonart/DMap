const express = require('express');
const router = express.Router({ mergeParams: true });
const reactionController = require('../controllers/reactionController');
const { requireAuth } = require('../middleware/auth');

// POST /api/pois/:id/reviews/:review_id/helpful
router.post('/:review_id/helpful', requireAuth, reactionController.toggleHelpful);

module.exports = router;
