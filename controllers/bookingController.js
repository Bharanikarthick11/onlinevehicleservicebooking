const Booking = require('../models/Booking');
const ServiceCenter = require('../models/ServiceCenter');
const nodemailer = require('nodemailer');

// Helper to send mock email silently avoiding crash
const sendAdminNotificationEmail = async (bookingDetails) => {
    try {
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

        const fromAddress = process.env.EMAIL_FROM || '"AutoService System" <noreply@autoservice.local>';
        const adminEmail = process.env.EMAIL_USER && process.env.EMAIL_USER !== 'your_email@gmail.com' ? process.env.EMAIL_USER : 'admin@autoservice.local';

        let info = await transporter.sendMail({
            from: fromAddress,
            to: adminEmail, // Send to the actual real admin email if configured
            subject: `New Service Request - ${bookingDetails.vehicle}`,
            text: `A new booking has been requested.\n\nService: ${bookingDetails.service}\nVehicle: ${bookingDetails.vehicle}\nRequirements: ${bookingDetails.requirements}\nDate: ${bookingDetails.date} at ${bookingDetails.time}\n\nPlease review and Accept/Decline from your dashboard.`,
            html: `<h3>New Customer Service Request</h3>
                   <ul>
                    <li><b>Service:</b> ${bookingDetails.service}</li>
                    <li><b>Vehicle:</b> ${bookingDetails.vehicle}</li>
                    <li><b>Customer Needs:</b> ${bookingDetails.requirements}</li>
                    <li><b>Schedule:</b> ${bookingDetails.date} @ ${bookingDetails.time}</li>
                   </ul>
                   <p>Please review and Accept/Decline via your Admin Dashboard.</p>`
        });

        console.log("-----------------------------------------");
        console.log("📧 ADMIN ALERT EMAIL DISPATCHED!");
        if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@gmail.com') console.log("Preview your email here: %s", nodemailer.getTestMessageUrl(info));
        console.log("-----------------------------------------");
    } catch (err) {
        console.error("Email simulation failed:", err.message);
    }
};

const sendCustomerBookingEmail = async (customerEmail, customerName, bookingDetails) => {
    try {
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

        const fromAddress = process.env.EMAIL_FROM || '"AutoService Booking" <noreply@autoservice.local>';
        const amountToPay = bookingDetails.estimatedPrice ? `₹${bookingDetails.estimatedPrice}` : 'To be determined at center';

        let info = await transporter.sendMail({
            from: fromAddress,
            to: customerEmail,
            subject: `Booking Confirmation received - ID: ${bookingDetails.id}`,
            html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h2 style="color: #4338ca; text-align: center;">Booking Received Successfully!</h2>
                    <p style="font-size: 16px; color: #333;">Dear <strong>${customerName}</strong>,</p>
                    <p style="font-size: 15px; color: #555;">Thank you so much for your booking with AutoService! Your request has been securely forwarded to <strong>${bookingDetails.centerName}</strong>.</p>
                    
                    <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
                        <h4 style="margin-top: 0; color: #0f172a; border-bottom: 2px solid #cbd5e1; padding-bottom: 5px;">Your Booking Summary</h4>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr><td style="padding: 6px 0; color: #64748b;"><strong>Booking ID:</strong></td><td style="padding: 6px 0; color: #0f172a;">#${bookingDetails.id}</td></tr>
                            <tr><td style="padding: 6px 0; color: #64748b;"><strong>Vehicle:</strong></td><td style="padding: 6px 0; color: #0f172a;">${bookingDetails.vehicle}</td></tr>
                            <tr><td style="padding: 6px 0; color: #64748b;"><strong>Services Requested:</strong></td><td style="padding: 6px 0; color: #0f172a;">${bookingDetails.service}</td></tr>
                            <tr><td style="padding: 6px 0; color: #64748b;"><strong>Date & Time:</strong></td><td style="padding: 6px 0; color: #0f172a;">${bookingDetails.date} at ${bookingDetails.time}</td></tr>
                            <tr><td style="padding: 6px 0; color: #64748b; border-top: 1px solid #e2e8f0;"><strong>Estimated Amount:</strong></td><td style="padding: 6px 0; color: #4338ca; font-weight: bold; border-top: 1px solid #e2e8f0;">${amountToPay}</td></tr>
                        </table>
                    </div>
                    
                    <p style="font-size: 15px; color: #555;">Please note that the final amount may vary slightly based on physical vehicle inspection. The service center will review your request and confirm your time slot shortly.</p>
                    
                    <p style="font-size: 16px; font-weight: bold; color: #333; margin-top: 30px; text-align: center;">Thank you for choosing us!</p>
                   </div>`
        });

        console.log("-----------------------------------------");
        console.log(`📧 CUSTOMER NOTIFICATION EMAIL DISPATCHED to ${customerEmail}!`);
        if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@gmail.com') console.log("Preview your email here: %s", nodemailer.getTestMessageUrl(info));
        console.log("-----------------------------------------");
    } catch (err) {
        console.error("Customer Email simulation failed:", err.message);
    }
};

const createBooking = async (req, res) => {
    try {
        // Assume requirements is part of payload from the newly crafted frontend
        const { centerName, date, time, service, vehicle, requirements, contactEmail, estimatedPrice } = req.body;

        const center = await ServiceCenter.findOne({ serviceCenterName: centerName });

        const booking = await Booking.create({
            userId: req.user._id,
            serviceCenterId: center ? center._id : null,
            centerName: centerName,
            serviceType: service,
            bookingDate: new Date(date),
            timeSlot: time,
            status: 'Pending',
            vehicle: vehicle || 'Unknown',
            requirements: requirements || ''
        });

        // Fire and forget email notification to the Admin!
        sendAdminNotificationEmail({ centerName, date, time, service, vehicle, requirements });

        // Dispatch Email to the Customer
        const targetEmail = contactEmail || req.user.email;
        sendCustomerBookingEmail(targetEmail, req.user.name, {
            id: booking._id,
            centerName,
            date,
            time,
            service,
            vehicle,
            estimatedPrice
        });

        res.status(201).json({
            id: booking._id,
            centerName: centerName,
            date: date,
            time: time,
            status: 'pending',
            service: service,
            vehicle: vehicle,
            requirements: requirements,
            estimatedPrice: estimatedPrice || 0
        });
    } catch (error) {
        console.error("Create Booking Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// GET /api/bookings/my-appointments
const getMyAppointments = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user._id })
            .populate('serviceCenterId')
            .sort({ bookingDate: -1 });

        const formattedBookings = bookings.map(b => ({
            id: b._id,
            centerName: b.centerName || (b.serviceCenterId ? b.serviceCenterId.serviceCenterName : 'Unknown Center'),
            date: b.bookingDate.toISOString().split('T')[0],
            time: b.timeSlot,
            status: b.status.toLowerCase(),
            service: b.serviceType,
            completedTasks: b.completedTasks || [],
            vehicle: b.vehicle || 'My Vehicle',
            requirements: b.requirements || '',
            rating: b.rating,
            review: b.review
        }));

        res.json(formattedBookings);
    } catch (error) {
        console.error("Get Appointments Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// POST /api/bookings/:id/rate
const rateService = async (req, res) => {
    try {
        const { rating, review } = req.body;
        const bookingId = req.params.id;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Valid rating between 1 and 5 is required' });
        }

        const booking = await Booking.findOne({ _id: bookingId, userId: req.user._id });
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.status.toLowerCase() !== 'completed') {
            return res.status(400).json({ message: 'You can only rate a completed service' });
        }

        if (booking.rating) {
            return res.status(400).json({ message: 'Service has already been rated' });
        }

        booking.rating = rating;
        booking.review = review || '';
        await booking.save();

        res.json({ message: 'Rating submitted successfully', rating: booking.rating, review: booking.review });
    } catch (error) {
        console.error("Rate Service Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createBooking,
    getMyAppointments,
    rateService
};
