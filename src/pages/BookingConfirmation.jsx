import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Printer, Home, CheckCircle, Car } from 'lucide-react';

const BookingConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const { booking, paymentId, amount } = location.state || {};

    if (!booking) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
                <h2>No booking details found</h2>
                <button className="btn-primary" onClick={() => navigate('/user-dashboard')} style={{ marginTop: '1rem' }}>Go to Dashboard</button>
            </div>
        );
    }

    const displayAmount = amount || booking.estimatedPrice || 1500;

    return (
        <div className="animation-fade-in" style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto' }}>
            <div className="center-card" style={{ padding: '2rem', background: '#fff', border: '1px solid var(--border-color)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '2rem', right: '2rem', color: '#10B981', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <CheckCircle size={40} />
                    <span style={{ fontWeight: 'bold', marginTop: '0.5rem' }}>PAID</span>
                </div>
                
                <div style={{ marginBottom: '2rem', borderBottom: '2px dashed var(--border-color)', paddingBottom: '2rem' }}>
                    <h1 style={{ color: 'var(--primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Car size={28} /> AutoService System
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>Official Booking Receipt</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                    <div>
                        <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem', textTransform: 'uppercase' }}>Customer Details</h4>
                        <p style={{ fontWeight: '500', marginBottom: '0.25rem' }}>Vehicle: {booking.vehicle}</p>
                    </div>
                    <div>
                        <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem', textTransform: 'uppercase' }}>Service Details</h4>
                        <p style={{ fontWeight: '500', marginBottom: '0.25rem' }}>Center: {booking.centerName}</p>
                        <p style={{ color: 'var(--text-main)', marginBottom: '0.25rem' }}>Date: {booking.date}</p>
                        <p style={{ color: 'var(--text-main)' }}>Time: {booking.time}</p>
                    </div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <h4 style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase' }}>Payment Summary</h4>
                    <div style={{ background: 'var(--surface-alt)', padding: '1.5rem', borderRadius: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <span style={{ color: 'var(--text-main)' }}>Services: {booking.service}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <span style={{ color: 'var(--text-main)' }}>Transaction ID</span>
                            <span style={{ fontWeight: '500' }}>{paymentId || 'N/A'}</span>
                        </div>
                        <hr style={{ margin: '1rem 0', borderColor: 'var(--border-color)' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem' }}>
                            <span style={{ fontWeight: 'bold' }}>Total Paid</span>
                            <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>₹{displayAmount}</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', marginTop: '2rem' }}>
                    <button className="btn-outline" onClick={() => navigate('/user-dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Home size={18} /> Dashboard
                    </button>
                    <button className="btn-primary" onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Printer size={18} /> Print Receipt
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingConfirmation;
