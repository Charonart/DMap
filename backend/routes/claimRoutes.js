const express = require('express');
const router = express.Router({ mergeParams: true });
const claimController = require('../controllers/claimController');
const { requireAuth } = require('../middleware/auth');

// POST /api/pois/:id/claim — user submits a business claim
router.post('/', requireAuth, claimController.uploadClaimDoc, claimController.submitClaim);

module.exports = router;
