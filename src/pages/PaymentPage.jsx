import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { CreditCard, ShieldCheck, ChevronLeft, Loader } from 'lucide-react';

const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    
    // Get booking details passed from dashboard
    const bookingData = location.state?.booking;
    const amount = bookingData?.estimatedPrice || 1500; // Fallback amount

    useEffect(() => {
        if (!bookingData) {
            navigate('/user-dashboard');
        }
        
        // Dynamically load Razorpay SDK
        const loadRazorpayScript = () => {
            return new Promise((resolve) => {
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.onload = () => resolve(true);
                script.onerror = () => resolve(false);
                document.body.appendChild(script);
            });
        };
        
        loadRazorpayScript();
    }, [bookingData, navigate]);

    if (!bookingData) return null;

    const handlePayment = async () => {
        setIsLoading(true);
        try {
            // 1. Create Order on Backend
            const { data: order } = await apiClient.post('/payment/create-order', {
                amount: amount,
                bookingId: bookingData.id || bookingData._id
            });

            // 2. Setup Razorpay Options
            const options = {
                key: 'rzp_test_dummykey12345', // Put your Key ID here or use process.env.VITE_RAZORPAY_KEY
                amount: order.amount,
                currency: 'INR',
                name: 'AutoService Booking',
                description: 'Service Payment',
                order_id: order.id,
                handler: async function (response) {
                    try {
                        // 3. Verify Payment
                        const verifyRes = await apiClient.post('/payment/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            bookingId: bookingData.id || bookingData._id
                        });
                        
                        navigate('/payment-success', { 
                            state: { 
                                booking: bookingData, 
                                paymentId: response.razorpay_payment_id,
                                amount: amount
                            } 
                        });
                    } catch (error) {
                        navigate('/payment-failure', { state: { bookingId: bookingData.id || bookingData._id } });
                    }
                },
                prefill: {
                    name: 'College Project User',
                    email: 'student@college.edu',
                    contact: '9999999999'
                },
                theme: {
                    color: '#f97316' // Orange primary color
                }
            };

            // If we are using the dummy key for college review demo, bypass the real Razorpay widget to avoid 'Invalid Key' errors.
            if (options.key === 'rzp_test_dummykey12345') {
                alert("College Demo Mode: Simulating Razorpay Checkout Window...\n\nProcessing testing UPI ID: success@razorpay...");
                
                setTimeout(async () => {
                    const mockPaymentId = `pay_mock_${Math.floor(Math.random() * 1000000)}`;
                    try {
                        await apiClient.post('/payment/verify', {
                            razorpay_order_id: order.id,
                            razorpay_payment_id: mockPaymentId,
                            razorpay_signature: 'mock',
                            bookingId: bookingData.id || bookingData._id,
                            isMockDemo: true
                        });
                    } catch (e) {
                        console.log("Mock verify failed", e);
                    }
                    
                    navigate('/payment-success', { 
                        state: { 
                            booking: bookingData, 
                            paymentId: mockPaymentId,
                            amount: amount
                        } 
                    });
                }, 1500);
                return;
            }

            const paymentObject = new window.Razorpay(options);
            
            paymentObject.on('payment.failed', async function (response) {
                await apiClient.post('/payment/failed', {
                    bookingId: bookingData.id || bookingData._id
                });
                navigate('/payment-failure', { state: { bookingId: bookingData.id || bookingData._id } });
            });

            paymentObject.open();
        } catch (error) {
            console.error(error);
            alert("Failed to initialize payment. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="animation-fade-in" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            <button className="btn-outline" onClick={() => navigate('/user-dashboard')} style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ChevronLeft size={18} /> Back
            </button>
            
            <div className="center-card" style={{ cursor: 'default', background: 'var(--surface-alt)' }}>
                <h2 style={{ textAlign: 'center', color: 'var(--text-main)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                    <CreditCard size={24} /> Payment Details
                </h2>
                
                <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                    <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Service Center:</span>
                        <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{bookingData.centerName}</span>
                    </div>
                    <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Services:</span>
                        <span style={{ fontWeight: '600', color: 'var(--text-main)', textAlign: 'right', maxWidth: '70%', wordBreak: 'break-word' }}>
                            {[bookingData.service, bookingData.requirements].filter(Boolean).join(', ')}
                        </span>
                    </div>
                    <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Date & Time:</span>
                        <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{bookingData.date} | {bookingData.time}</span>
                    </div>
                    <hr style={{ border: 'none', borderTop: '1px dashed var(--border-color)', margin: '1rem 0' }} />
                    <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Total Amount:</span>
                        <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>₹{amount}</span>
                    </div>
                </div>

                <div style={{ background: '#ecfdf5', color: '#065f46', padding: '1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1.5rem', border: '1px solid #10b981' }}>
                    <ShieldCheck size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                        <h4 style={{ margin: 0, marginBottom: '0.25rem', fontSize: '0.95rem' }}>Test Mode Enabled</h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>No real money will be deducted. For testing, please use:</p>
                        <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Testing UPI ID:</span> <strong>success@razorpay</strong></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Testing Card:</span> <strong>4111 1111 1111 1111</strong></div>
                        </div>
                    </div>
                </div>

                <button 
                    className="btn-primary" 
                    onClick={handlePayment} 
                    style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                    disabled={isLoading}
                >
                    {isLoading ? <Loader className="spin" size={20} /> : <CreditCard size={20} />}
                    {isLoading ? 'Processing...' : `Pay ₹${amount}`}
                </button>
            </div>
        </div>
    );
};

export default PaymentPage;
