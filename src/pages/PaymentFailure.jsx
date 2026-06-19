import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { XCircle, RefreshCcw, Home } from 'lucide-react';

const PaymentFailure = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // We can extract bookingId if we want to allow retry
    const { bookingId } = location.state || {};

    return (
        <div className="animation-fade-in" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            <div className="center-card" style={{ padding: '3rem 2rem' }}>
                <XCircle size={64} color="#EF4444" style={{ margin: '0 auto 1.5rem auto' }} />
                <h1 style={{ color: '#EF4444', marginBottom: '0.5rem' }}>Payment Failed</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>We could not process your payment. Your booking remains in pending status.</p>
                
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button className="btn-outline" onClick={() => navigate('/user-dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Home size={18} /> Back to Dashboard
                    </button>
                    {/* If we had full state we could re-trigger payment, but going to dashboard is safer */}
                    <button className="btn-primary" onClick={() => navigate('/user-dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <RefreshCcw size={18} /> Try Again
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentFailure;
