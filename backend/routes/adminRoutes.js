const express = require('express');
const router = express.Router();
const poiController = require('../controllers/poiController');
const { requireAuth, requireAdmin, requireAdminOrMod } = require('../middleware/auth');
const adminController = require('../controllers/adminController');
const claimController = require('../controllers/claimController');
const reportController = require('../controllers/reportController');

// Fix #15: Apply role checks at route level, not inside each controller
// Routes accessible to admin OR moderator
router.get('/stats', requireAuth, requireAdminOrMod, adminController.getStats);
router.get('/pois/pending', requireAuth, requireAdminOrMod, adminController.getPendingPois);
router.put('/pois/:id/review', requireAuth, requireAdminOrMod, adminController.reviewPoi);
router.get('/history', requireAuth, requireAdminOrMod, adminController.getEditHistory);
router.get('/flags', requireAuth, requireAdminOrMod, adminController.getFlaggedPois);
router.post('/flags/:id/resolve', requireAuth, requireAdminOrMod, adminController.resolveFlag);

// Module 3: Business claims management
router.get('/claims', requireAuth, requireAdminOrMod, claimController.getClaims);
router.put('/claims/:id', requireAuth, requireAdminOrMod, claimController.reviewClaim);

// Module 5: Review reports management
router.get('/reports', requireAuth, requireAdminOrMod, reportController.getReviewReports);
router.put('/reports/:id', requireAuth, requireAdminOrMod, reportController.resolveReport);

// Routes accessible to admin ONLY
router.get('/users', requireAuth, requireAdmin, adminController.getUsers);
router.post('/users', requireAuth, requireAdmin, adminController.createUser);
router.put('/users/:id', requireAuth, requireAdmin, adminController.updateUser);
router.delete('/users/:id', requireAuth, requireAdmin, adminController.deleteUser);
router.put('/users/:id/status', requireAuth, requireAdmin, adminController.banUser);
router.post('/rollback/:history_id', requireAuth, requireAdmin, poiController.rollbackPoi);

module.exports = router;
