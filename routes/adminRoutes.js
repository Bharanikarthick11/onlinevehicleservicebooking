const express = require('express');
const router = express.Router();
const { getAllPlatformBookings, updatePlatformBookingStatus, adminCreateCenter, adminUpdateCenter } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// Get all bookings across platform
router.get('/bookings/all', protect, admin, getAllPlatformBookings);

// Update status
router.post('/bookings/:id/status', protect, admin, updatePlatformBookingStatus);

// Create new platform Service Center
router.post('/centers/create', protect, admin, adminCreateCenter);

// Update existing platform Service Center
router.put('/centers/:id', protect, admin, adminUpdateCenter);

module.exports = router;
