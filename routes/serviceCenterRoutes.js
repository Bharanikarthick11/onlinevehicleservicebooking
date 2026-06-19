const express = require('express');
const router = express.Router();
const { searchCenters } = require('../controllers/serviceCenterController');
const { protect } = require('../middleware/authMiddleware');

// User searches nearby service centers
router.get('/search', protect, searchCenters);

module.exports = router;
