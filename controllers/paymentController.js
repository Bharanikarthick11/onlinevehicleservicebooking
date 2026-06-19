const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const User = require('../models/User');
const nodemailer = require('nodemailer');

const sendPaymentReceiptEmail = async (customerEmail, customerName, bookingDetails) => {
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

        const fromAddress = process.env.EMAIL_FROM || '"AutoService Billing" <noreply@autoservice.local>';

        let info = await transporter.sendMail({
            from: fromAddress,
            to: customerEmail,
            subject: `Payment Receipt for Booking ID: ${bookingDetails.id}`,
            html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <div style="text-align: center; color: #10B981; margin-bottom: 20px;">
                        <h2 style="margin: 0;">Payment Successful</h2>
                        <span style="font-size: 24px;">✓ PAID</span>
                    </div>
                    <p style="font-size: 16px; color: #333;">Dear <strong>${customerName}</strong>,</p>
                    <p style="font-size: 15px; color: #555;">We have successfully received your payment. Your booking at <strong>${bookingDetails.centerName}</strong> is now confirmed!</p>
                    
                    <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
                        <h4 style="margin-top: 0; color: #0f172a; border-bottom: 2px solid #cbd5e1; padding-bottom: 5px;">Invoice Summary</h4>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr><td style="padding: 6px 0; color: #64748b;"><strong>Transaction ID:</strong></td><td style="padding: 6px 0; color: #0f172a;">${bookingDetails.paymentId}</td></tr>
                            <tr><td style="padding: 6px 0; color: #64748b;"><strong>Booking ID:</strong></td><td style="padding: 6px 0; color: #0f172a;">#${bookingDetails.id}</td></tr>
                            <tr><td style="padding: 6px 0; color: #64748b;"><strong>Vehicle:</strong></td><td style="padding: 6px 0; color: #0f172a;">${bookingDetails.vehicle}</td></tr>
                            <tr><td style="padding: 6px 0; color: #64748b;"><strong>Services:</strong></td><td style="padding: 6px 0; color: #0f172a;">${bookingDetails.service}</td></tr>
                            <tr><td style="padding: 6px 0; color: #64748b;"><strong>Date & Time:</strong></td><td style="padding: 6px 0; color: #0f172a;">${bookingDetails.date} at ${bookingDetails.time}</td></tr>
                            <tr><td style="padding: 6px 0; color: #64748b; border-top: 1px solid #e2e8f0;"><strong>Total Amount Paid:</strong></td><td style="padding: 6px 0; color: #10B981; font-weight: bold; border-top: 1px solid #e2e8f0;">₹${bookingDetails.amount}</td></tr>
                        </table>
                    </div>
                    
                    <p style="font-size: 15px; color: #555;">Please show this receipt at the service center.</p>
                    <p style="font-size: 16px; font-weight: bold; color: #333; margin-top: 30px; text-align: center;">Thank you for choosing AutoService!</p>
                   </div>`
        });

        console.log("-----------------------------------------");
        console.log(`📧 PAYMENT RECEIPT EMAIL DISPATCHED to ${customerEmail}!`);
        if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@gmail.com') console.log("Preview your email here: %s", nodemailer.getTestMessageUrl(info));
        console.log("-----------------------------------------");
    } catch (err) {
        console.error("Receipt Email simulation failed:", err.message);
    }
};

// Initialize razorpay instance
// Using sample test credentials for college project review.
// In a real project, always use process.env values.
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummykey12345',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummysecret1234567890abc'
});

// @desc    Create Razorpay Order
// @route   POST /api/payment/create-order
exports.createOrder = async (req, res) => {
    try {
        const { amount, bookingId } = req.body;
        
        // Options for razorpay order
        const options = {
            amount: amount * 100, // Amount in paise
            currency: 'INR',
            receipt: `receipt_order_${bookingId}`,
        };
        
        // If using the dummy college review key, bypass the actual Razorpay API to prevent 401 Unauthorized crashes
        if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'rzp_test_dummykey12345') {
            console.log("Mocking Razorpay Order Creation for College Demo...");
            const mockOrderId = `order_dummy_${Math.floor(Math.random() * 1000000)}`;
            await Booking.findByIdAndUpdate(bookingId, { 
                orderId: mockOrderId,
                amount: amount
            });
            return res.json({ id: mockOrderId, amount: amount * 100, currency: 'INR' });
        }

        const order = await razorpay.orders.create(options);
        
        if (!order) {
            return res.status(500).send('Some error occurred while creating order');
        }
        
        // Find booking and update with amount and orderId
        await Booking.findByIdAndUpdate(bookingId, { 
            orderId: order.id,
            amount: amount
        });
        
        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/payment/verify
exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            bookingId
        } = req.body;
        
        const secret = process.env.RAZORPAY_KEY_SECRET || 'dummysecret1234567890abc';
        
        // If it's a simulated college demo payment
        if (req.body.isMockDemo) {
            const updatedBooking = await Booking.findByIdAndUpdate(bookingId, {
                paymentStatus: 'Paid',
                status: 'Confirmed',
                paymentId: razorpay_payment_id
            }, { new: true }).populate('userId');
            
            if (updatedBooking && updatedBooking.userId) {
                sendPaymentReceiptEmail(updatedBooking.userId.email, updatedBooking.userId.name, {
                    id: updatedBooking._id,
                    paymentId: razorpay_payment_id,
                    centerName: updatedBooking.centerName,
                    vehicle: updatedBooking.vehicle,
                    service: updatedBooking.serviceType,
                    date: updatedBooking.bookingDate.toISOString().split('T')[0],
                    time: updatedBooking.timeSlot,
                    amount: updatedBooking.amount || 1500
                });
            }

            return res.json({ msg: 'Mock Payment verified successfully' });
        }

        // Verify signature
        const shasum = crypto.createHmac('sha256', secret);
        shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const digest = shasum.digest('hex');
        
        if (digest !== razorpay_signature) {
            // Update booking as Failed
            await Booking.findByIdAndUpdate(bookingId, {
                paymentStatus: 'Failed',
                paymentId: razorpay_payment_id
            });
            return res.status(400).json({ msg: 'Transaction not legit!' });
        }
        
        // Successful payment -> Booking Confirmed
        const updatedBooking = await Booking.findByIdAndUpdate(bookingId, {
            paymentStatus: 'Paid',
            status: 'Confirmed',
            paymentId: razorpay_payment_id
        }, { new: true }).populate('userId');
        
        if (updatedBooking && updatedBooking.userId) {
            sendPaymentReceiptEmail(updatedBooking.userId.email, updatedBooking.userId.name, {
                id: updatedBooking._id,
                paymentId: razorpay_payment_id,
                centerName: updatedBooking.centerName,
                vehicle: updatedBooking.vehicle,
                service: updatedBooking.serviceType,
                date: updatedBooking.bookingDate.toISOString().split('T')[0],
                time: updatedBooking.timeSlot,
                amount: updatedBooking.amount || 1500
            });
        }
        
        res.json({
            msg: 'Payment verified successfully',
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id
        });
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
};

// @desc    Handle payment failure
// @route   POST /api/payment/failed
exports.paymentFailed = async (req, res) => {
    try {
        const { bookingId } = req.body;
        await Booking.findByIdAndUpdate(bookingId, {
            paymentStatus: 'Failed'
        });
        res.json({ msg: 'Payment failed status updated' });
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
};
