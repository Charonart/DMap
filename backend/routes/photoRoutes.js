const express = require('express');
const router = express.Router();
const photoController = require('../controllers/photoController');
const { requireAuth } = require('../middleware/auth');

router.post('/:id/photos', requireAuth, photoController.uploadPhoto, photoController.handlePhotoUpload);
router.get('/:id/photos', photoController.getPhotosByPoi);

module.exports = router;
