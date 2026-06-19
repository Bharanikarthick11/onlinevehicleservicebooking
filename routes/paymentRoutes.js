const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, paymentFailed } = require('../controllers/paymentController');

// Route to create a Razorpay order
router.post('/create-order', createOrder);

// Route to verify Razorpay payment signature
router.post('/verify', verifyPayment);

// Route to handle payment failure updates
router.post('/failed', paymentFailed);

module.exports = router;
