const Booking = require('../models/Booking');
const ServiceCenter = require('../models/ServiceCenter');
const nodemailer = require('nodemailer');

// Helper to send mock confirmation email to customer
const sendCustomerConfirmationEmail = async (customerEmail, bookingDetails) => {
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

        const fromAddress = process.env.EMAIL_FROM || '"AutoService Management" <noreply@autoservice.local>';

        let info = await transporter.sendMail({
            from: fromAddress,
            to: customerEmail,
            subject: `Booking Approved! - ID: ${bookingDetails._id}`,
            html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h2 style="color: #10B981; text-align: center;">Booking Confirmed & Approved!</h2>
                    <p style="font-size: 16px; color: #333;">Great news!</p>
                    <p style="font-size: 15px; color: #555;">Your vehicle service booking has been officially <strong>Approved</strong> by the service center.</p>
                    
                    <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr><td style="padding: 6px 0; color: #64748b;"><strong>Booking ID:</strong></td><td style="padding: 6px 0; color: #0f172a;">#${bookingDetails._id}</td></tr>
                            <tr><td style="padding: 6px 0; color: #64748b;"><strong>Vehicle:</strong></td><td style="padding: 6px 0; color: #0f172a;">${bookingDetails.vehicle}</td></tr>
                            <tr><td style="padding: 6px 0; color: #64748b;"><strong>Services Approved:</strong></td><td style="padding: 6px 0; color: #0f172a;">${bookingDetails.serviceType}</td></tr>
                            <tr><td style="padding: 6px 0; color: #64748b; border-top: 1px solid #cbd5e1;"><strong>Confirmed Time:</strong></td><td style="padding: 6px 0; color: #10B981; font-weight: bold; border-top: 1px solid #cbd5e1;">${bookingDetails.bookingDate.toISOString().split('T')[0]} at ${bookingDetails.timeSlot}</td></tr>
                        </table>
                    </div>
                    
                    <p style="font-size: 15px; color: #555;">Please arrive on time at the scheduled service center. We look forward to assisting you!</p>
                   </div>`
        });

        console.log("-----------------------------------------");
        console.log(`📧 CUSTOMER CONFIRMATION EMAIL DISPATCHED to ${customerEmail}!`);
        if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@gmail.com') console.log("Preview your email here: %s", nodemailer.getTestMessageUrl(info));
        console.log("-----------------------------------------");
    } catch (err) {
        console.error("Email simulation failed:", err.message);
    }
};

const sendCustomerCompletionEmail = async (userEmail, booking) => {
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

        let info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || '"AutoService" <noreply@autoservice.local>',
            to: userEmail,
            subject: `Service Completed - AutoService`,
            html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h2 style="color: #0f172a; text-align: center;">Service Successfully Completed!</h2>
                    <p style="font-size: 16px; color: #333;">Great news! Your service request for <strong>${booking.vehicle || 'your vehicle'}</strong> is now complete.</p>
                    <p style="font-size: 15px; color: #555;">All requested works have been successfully finished. You can now visit the center to pick up your vehicle or view your dashboard for details.</p>
                   </div>`
        });
        console.log(`📧 COMPLETION EMAIL SENT to ${userEmail}!`);
    } catch (err) {
        console.error("Email simulation failed:", err.message);
    }
};

const sendTaskCompletedEmail = async (userEmail, booking, taskName) => {
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

        let info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || '"AutoService" <noreply@autoservice.local>',
            to: userEmail,
            subject: `Update: ${taskName} Completed`,
            html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h2 style="color: #0f172a; text-align: center;">Task Completed!</h2>
                    <p style="font-size: 16px; color: #333;">Hello,</p>
                    <p style="font-size: 15px; color: #555;">We are happy to inform you that the following task on your vehicle (<strong>${booking.vehicle || 'your vehicle'}</strong>) has just been successfully completed:</p>
                    <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0; text-align: center;">
                        <h3 style="margin: 0; color: #10B981;">✓ ${taskName}</h3>
                    </div>
                    <p style="font-size: 15px; color: #555;">Our team is continuing work on any remaining tasks. We'll notify you once everything is finished!</p>
                   </div>`
        });
        console.log(`📧 TASK COMPLETED EMAIL SENT to ${userEmail} for task: ${taskName}!`);
    } catch (err) {
        console.error("Email simulation failed:", err.message);
    }
};

// GET /api/admin/bookings/all
// As requested, this endpoint acts as a global master-admin hook. It actively ignores specific 
// Service Center tenancy boundaries and explicitly returns ALL bookings across the entire platform.
const getAllPlatformBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('userId', 'name phone email')
            .populate('serviceCenterId', 'serviceCenterName')
            .sort({ bookingDate: -1 });

        const formattedBookings = bookings.map(b => ({
            id: b._id,
            customerName: b.userId ? b.userId.name : 'Unknown Customer',
            customerPhone: b.userId && b.userId.phone ? b.userId.phone : 'N/A',
            customerEmail: b.userId && b.userId.email ? b.userId.email : 'N/A',
            centerName: b.centerName || (b.serviceCenterId ? b.serviceCenterId.serviceCenterName : 'Unknown Center'),
            date: b.bookingDate ? b.bookingDate.toISOString().split('T')[0] : 'N/A',
            time: b.timeSlot,
            status: b.status === 'Approved' ? 'accepted' : b.status === 'Cancelled' || b.status === 'Rejected' ? 'declined' : b.status.toLowerCase(),
            service: b.serviceType,
            completedTasks: b.completedTasks || [],
            vehicle: b.vehicle || 'Unknown Vehicle',
            requirements: b.requirements || ''
        }));

        res.json(formattedBookings);
    } catch (error) {
        console.error("Get All Bookings Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// POST /api/admin/bookings/:id/status
const updatePlatformBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, completedTasks, newlyCompletedTask } = req.body;

        // Map UI concepts back to MongoDB backend Schema Enums
        const statusMap = {
            'pending': 'Pending',
            'accepted': 'Approved',
            'completed': 'Completed',
            'declined': 'Cancelled'
        };

        const mappedStatus = statusMap[status.toLowerCase()] || 'Pending';

        const updatePayload = { status: mappedStatus };
        if (completedTasks) updatePayload.completedTasks = completedTasks;

        // Retrieve existing booking first to check its previous status
        const existingBooking = await Booking.findById(id);

        const booking = await Booking.findByIdAndUpdate(
            id,
            updatePayload,
            { new: true }
        ).populate('userId', 'email');

        if (booking.userId && booking.userId.email) {
            if (newlyCompletedTask) {
                // If this request was specifically just to tick a task, send the task email
                sendTaskCompletedEmail(booking.userId.email, booking, newlyCompletedTask);
            } else if (mappedStatus === 'Approved' && existingBooking.status !== 'Approved') {
                // Only send Approved email if the status ACTUALLY changed to Approved (prevents redundant emails)
                sendCustomerConfirmationEmail(booking.userId.email, booking);
            } else if (mappedStatus === 'Completed' && existingBooking.status !== 'Completed') {
                sendCustomerCompletionEmail(booking.userId.email, booking);
            }
        }

        res.json({ success: true, status: booking.status });
    } catch (error) {
        console.error("Update Booking Status Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// POST /api/admin/centers/create
const adminCreateCenter = async (req, res) => {
    try {
        const { name, address, services, timeSlots } = req.body;

        // Match structure: { id, adminId, serviceCenterName, address, city, latitude, longitude, servicesOffered }
        const center = await ServiceCenter.create({
            adminId: req.user._id,
            serviceCenterName: name,
            address: address,
            city: 'madurai', // Placeholder to bypass schema required fields temporarily
            latitude: 0,
            longitude: 0,
            servicesOffered: services ? services.map(s => typeof s === 'object' ? { name: s.name, price: s.price || 0 } : { name: s, price: 0 }) : [],
            workingHours: {
                open: timeSlots && timeSlots.length > 0 ? timeSlots[0] : '09:00 AM',
                close: timeSlots && timeSlots.length > 1 ? timeSlots[timeSlots.length - 1] : '06:00 PM',
            },
            timeSlots: timeSlots || []
        });

        res.status(201).json({ success: true, center });
    } catch (error) {
        console.error("Create Center Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// PUT /api/admin/centers/:id
const adminUpdateCenter = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, address, services, timeSlots } = req.body;

        // Bypass DB check for Mock Center Int IDs (Length check for valid Mongo ObjectId)
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.json({
                success: true,
                center: {
                    _id: id,
                    serviceCenterName: name,
                    address: address,
                    servicesOffered: services ? services.map(s => typeof s === 'object' ? s : { name: s, price: 0 }) : [],
                    timeSlots: timeSlots || []
                }
            });
        }

        const updateData = {};
        if (name) updateData.serviceCenterName = name;
        if (address) updateData.address = address;
        if (services) updateData.servicesOffered = services.map(s => typeof s === 'object' ? { name: s.name, price: s.price || 0 } : { name: s, price: 0 });
        if (timeSlots) {
            updateData.timeSlots = timeSlots;
            updateData.workingHours = {
                open: timeSlots.length > 0 ? timeSlots[0] : '09:00 AM',
                close: timeSlots.length > 1 ? timeSlots[timeSlots.length - 1] : '06:00 PM',
            };
        }

        const center = await ServiceCenter.findByIdAndUpdate(id, updateData, { new: true });

        if (!center) {
            return res.status(404).json({ message: 'Service Center not found' });
        }

        res.json({ success: true, center });
    } catch (error) {
        console.error("Update Center Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getAllPlatformBookings,
    updatePlatformBookingStatus,
    adminCreateCenter,
    adminUpdateCenter
};
