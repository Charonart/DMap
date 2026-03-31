const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// GET /api/search/autocomplete?q=
router.get('/autocomplete', searchController.autocomplete);

module.exports = router;
