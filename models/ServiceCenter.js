const mongoose = require('mongoose');

const ServiceCenterSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    serviceCenterName: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    latitude: {
        type: Number,
        required: true,
    },
    longitude: {
        type: Number,
        required: true,
    },
    servicesOffered: [
        {
            name: { type: String, required: true },
            price: { type: Number, required: true },
            duration: { type: Number } // in minutes
        }
    ],
    workingHours: {
        open: { type: String, required: true }, // e.g., '09:00 AM'
        close: { type: String, required: true } // e.g., '06:00 PM'
    },
    timeSlots: [{ type: String }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('ServiceCenter', ServiceCenterSchema);
