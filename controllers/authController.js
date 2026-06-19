const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const ServiceCenter = require('../models/ServiceCenter');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone, role, location, ...adminDetails } = req.body;

    try {
        // Check if user exists
        let userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            role: role || 'user',
            location: role === 'user' ? location : undefined,
        });

        // If role is admin, create a Service Center automatically
        if (user.role === 'admin') {
            const { serviceCenterName, address, city, latitude, longitude, servicesOffered, workingHours } = adminDetails;

            // Validation for admin specific fields can go here
            const serviceCenter = await ServiceCenter.create({
                adminId: user._id,
                serviceCenterName: serviceCenterName || `${name}'s Target Location`,
                address: address || 'To Be Updated',
                city: city || 'To Be Updated',
                latitude: latitude || 0,
                longitude: longitude || 0,
                servicesOffered: servicesOffered || [],
                workingHours: workingHours || { open: '09:00 AM', close: '06:00 PM' }
            });
        }

        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

const nodemailer = require('nodemailer');

// Helper to send login notification silently
const sendLoginNotificationEmail = async (userEmail, userName) => {
    try {
        let transporter;

        // Use real Gmail if configured in .env, otherwise fallback to Ethereal developer simulations
        if (process.env.EMAIL_USER && process.env.EMAIL_USER !== 'your_email@gmail.com') {
            transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });
        } else {
            let testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
        }

        const dateString = new Date().toLocaleString();
        const fromAddress = process.env.EMAIL_FROM || '"AutoService Security" <noreply@autoservice.local>';

        let info = await transporter.sendMail({
            from: fromAddress,
            to: userEmail,
            subject: `New Login Alert - AutoService`,
            html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h2 style="color: #0f172a; text-align: center;">New Login Detected</h2>
                    <p style="font-size: 16px; color: #333;">Hello <strong>${userName}</strong>,</p>
                    <p style="font-size: 15px; color: #555;">We noticed a successful login to your AutoService account.</p>
                    
                    <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr><td style="padding: 6px 0; color: #64748b;"><strong>Time:</strong></td><td style="padding: 6px 0; color: #0f172a;">${dateString}</td></tr>
                            <tr><td style="padding: 6px 0; color: #64748b;"><strong>Status:</strong></td><td style="padding: 6px 0; color: #10B981; font-weight: bold;">Authorized Access</td></tr>
                        </table>
                    </div>
                    
                    <p style="font-size: 14px; color: #64748b; margin-top: 20px;">If this was you, no further action is required. If you did not log in, please secure your account immediately or contact support.</p>
                   </div>`
        });

        console.log("-----------------------------------------");
        console.log(`📧 LOGIN NOTIFICATION DISPATCHED to ${userEmail}!`);
        if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@gmail.com') {
            console.log("Preview your simulated temporary email here: %s", nodemailer.getTestMessageUrl(info));
        } else {
            console.log("Real Email Sent Successfully via Gmail!");
        }
        console.log("-----------------------------------------");
    } catch (err) {
        console.error("Login Email simulation failed:", err.message);
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        // Check for user email
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            // Trigger login notification silently
            sendLoginNotificationEmail(user.email, user.name);

            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            location: req.user.location
        };
        res.status(200).json(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User with that email does not exist' });
        }

        // Generate 6-digit numeric OTP
        const otpStr = Math.floor(100000 + Math.random() * 900000).toString();

        user.resetPasswordOtp = otpStr;
        // Expires in 15 minutes
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
        await user.save();

        let transporter;
        if (process.env.EMAIL_USER && process.env.EMAIL_USER !== 'your_email@gmail.com') {
            transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
            });
        } else {
            let testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email", port: 587, secure: false,
                auth: { user: testAccount.user, pass: testAccount.pass },
            });
        }

        const adminEmail = process.env.EMAIL_USER && process.env.EMAIL_USER !== 'your_email@gmail.com' ? process.env.EMAIL_USER : 'admin@autoservice.local';

        let info = await transporter.sendMail({
            from: adminEmail, // As requested: from the admin mail
            to: user.email,
            subject: 'Password Reset OTP - AutoService',
            html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h3 style="color: #0f172a; text-align: center;">Password Reset Request</h3>
                    <p style="font-size: 16px; color: #333;">You have requested to reset your password for your AutoService Customer Account.</p>
                    <p style="font-size: 16px; color: #333;">Your unique numeric OTP is: <br><br>
                       <strong style="font-size: 32px; color: #4338ca; letter-spacing: 4px;">${otpStr}</strong>
                    </p>
                    <p style="font-size: 14px; color: #555;">This code will expire in 15 minutes.</p>
                   </div>`
        });

        console.log(`🔑 OTP Email Sent to ${user.email} (OTP: ${otpStr})`);
        res.status(200).json({ message: 'OTP sent to your email.' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ message: "Incomplete payload" });

    try {
        const user = await User.findOne({
            email,
            resetPasswordOtp: otp,
            resetPasswordExpires: { $gt: Date.now() } // Must not be expired
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // Clear OTP fields
        user.resetPasswordOtp = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({ message: 'Password successfully reset.' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    forgotPassword,
    resetPassword,
};
