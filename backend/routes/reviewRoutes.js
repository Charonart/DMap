const express = require('express');
const router = express.Router({ mergeParams: true });
const reviewController = require('../controllers/reviewController');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { validateReview } = require('../middleware/validators');

router.get('/', optionalAuth, reviewController.getReviews);
// Fix #18: Added validateReview middleware
router.post('/', requireAuth, reviewController.uploadReviewImage, validateReview, reviewController.addReview);
router.put('/:review_id', requireAuth, reviewController.updateReview);
router.delete('/:review_id', requireAuth, reviewController.deleteReview);

module.exports = router;
