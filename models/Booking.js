const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    serviceCenterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServiceCenter',
        required: false,
    },
    centerName: {
        type: String, // Fallback purely for mock UI demonstration
        default: 'Unknown Center'
    },
    serviceType: {
        type: String,
        required: true,
    },
    bookingDate: {
        type: Date,
        required: true,
    },
    timeSlot: {
        type: String, // e.g., '10:00 AM'
        required: true,
    },
    vehicle: {
        type: String,
        default: 'Not Specified'
    },
    requirements: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Approved', 'In Progress', 'Completed', 'Cancelled'],
        default: 'Pending',
    },
    completedTasks: {
        type: [String],
        default: []
    },
    paymentId: {
        type: String,
        default: null
    },
    orderId: {
        type: String,
        default: null
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed'],
        default: 'Pending'
    },
    amount: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null
    },
    review: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Booking', BookingSchema);
