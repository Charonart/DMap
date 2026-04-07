const express = require('express');
const router = express.Router();
const bookmarkController = require('../controllers/bookmarkController');
const { requireAuth } = require('../middleware/auth');

router.post('/:id/save', requireAuth, bookmarkController.savePoi);
router.delete('/:id/save', requireAuth, bookmarkController.unsavePoi);

module.exports = router;
