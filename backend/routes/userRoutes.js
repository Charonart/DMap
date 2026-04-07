const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const reportController = require('../controllers/reportController');
const { requireAuth } = require('../middleware/auth');

router.get('/profile', requireAuth, userController.getProfile);
router.put('/profile', requireAuth, userController.updateProfile);
router.get('/profile/contributions', requireAuth, userController.getContributions);
router.get('/profile/saved', requireAuth, userController.getSavedCollections);

// Module 5: Community leaderboard (public)
router.get('/leaderboard', reportController.getLeaderboard);

module.exports = router;
