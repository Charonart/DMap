const express = require('express');
const router = express.Router();
const poiController = require('../controllers/poiController');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { validatePoi, validateUpdatePoi } = require('../middleware/validators');
const reviewRoutes = require('./reviewRoutes');

router.get('/', poiController.getPois);
// Fix #7: Removed optionalAuth from getNearbyPois — controller doesn't use req.user
router.get('/nearby', poiController.getNearbyPois);
router.get('/:id', optionalAuth, poiController.getPoiById);

router.post('/', requireAuth, validatePoi, poiController.createPoi);
// Fix #16: Added validateUpdatePoi middleware
router.put('/:id', requireAuth, validateUpdatePoi, poiController.updatePoi);
router.delete('/:id', requireAuth, poiController.deletePoi);
router.post('/:id/flag', requireAuth, poiController.flagPoi);

// Reviews sub-router
router.use('/:id/reviews', reviewRoutes);

module.exports = router;
