import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Home, FileText } from 'lucide-react';

const PaymentSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const { booking, paymentId, amount } = location.state || {};

    if (!booking) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
                <h2>No payment details found</h2>
                <button className="btn-primary" onClick={() => navigate('/user-dashboard')} style={{ marginTop: '1rem' }}>Go to Dashboard</button>
            </div>
        );
    }

    const displayAmount = amount || booking.estimatedPrice || 1500;

    return (
        <div className="animation-fade-in" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            <div className="center-card" style={{ padding: '3rem 2rem' }}>
                <CheckCircle size={64} color="#10B981" style={{ margin: '0 auto 1.5rem auto' }} />
                <h1 style={{ color: '#10B981', marginBottom: '0.5rem' }}>Payment Successful!</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Your service booking has been confirmed.</p>
                
                <div style={{ background: 'var(--surface-alt)', padding: '1.5rem', borderRadius: '1rem', textAlign: 'left', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Transaction ID:</span>
                        <span style={{ fontWeight: '500' }}>{paymentId}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Amount Paid:</span>
                        <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>₹{displayAmount}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Booking Status:</span>
                        <span style={{ fontWeight: 'bold', color: '#10B981' }}>Confirmed</span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button className="btn-outline" onClick={() => navigate('/user-dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Home size={18} /> Dashboard
                    </button>
                    <button className="btn-primary" onClick={() => navigate('/booking-confirmation', { state: { booking, paymentId, amount: displayAmount } })} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={18} /> View Receipt
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
