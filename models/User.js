const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
    latitude: {
        type: Number,
    },
    longitude: {
        type: Number,
    }
});

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    resetPasswordOtp: {
        type: String, // String to handle potentially generated zeros, e.g. "059281"
    },
    resetPasswordExpires: {
        type: Date,
    },
    location: LocationSchema,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('User', UserSchema);
