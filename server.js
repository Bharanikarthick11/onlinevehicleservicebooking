const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');

// Load env vars 
dotenv.config();

const User = require('./models/User');
const bcrypt = require('bcryptjs');

// Connect to database
connectDB().then(async () => {
    try {
        // Check and create single new master admin if missing
        const existingAdmin = await User.findOne({ email: 'admin@system.local' });
        if (!existingAdmin) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);
            await User.create({
                name: 'Master Admin',
                email: 'admin@system.local',
                password: hashedPassword,
                phone: '1234567890',
                role: 'admin'
            });
            console.log('✅ Single Master Admin (admin@system.local / admin123) created');
        } else {
            console.log('✅ Single Master Admin (admin@system.local) already exists');
        }

        // Check and create the user's customer account
        const existingUser = await User.findOne({ email: 'bharanikarthick011@gmail.com' });
        if (!existingUser) {
            await User.create({
                name: 'Bharani Karthick',
                email: 'bharanikarthick011@gmail.com',
                password: await bcrypt.hash('password', salt),
                phone: '9876543210',
                role: 'user'
            });
            console.log('✅ Customer account (bharanikarthick011@gmail.com / password) created for testing');
        } else {
            console.log('✅ Customer account (bharanikarthick011@gmail.com) already exists');
        }
    } catch (error) {
        console.error('Failed to create initial accounts:', error.message);
    }
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/centers', require('./routes/serviceCenterRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));

// Serve frontend
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
