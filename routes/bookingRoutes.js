const express = require('express');
const router = express.Router();
const { createBooking, getMyAppointments, rateService } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

// Create a new booking
router.post('/create', protect, createBooking);

// View user's own bookings
router.get('/my-appointments', protect, getMyAppointments);

// Rate a completed booking
router.post('/:id/rate', protect, rateService);

module.exports = router;
