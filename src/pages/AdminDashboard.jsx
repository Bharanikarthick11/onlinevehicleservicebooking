import React, { useState, useEffect } from 'react';
import {
    Building2,
    CalendarCheck,
    MapPin,
    Wrench,
    Clock,
    Plus,
    CheckCircle,
    XCircle,
    MoreVertical,
    ChevronDown,
    FileText,
    Mail,
    Edit2
} from 'lucide-react';
import { fetchAllBookings, updateBookingStatus, addServiceCenter, updateServiceCenter } from '../services/adminAPI';
import { fetchNearbyCenters } from '../services/userAPI';

// Shared Mock Data matching Madurai User Dashboard
const INITIAL_CENTERS = [
    {
        id: 1,
        name: "Meenakshi Auto Care",
        address: "12 Anna Nagar Main Rd, Madurai - 625020",
        services: ["Oil Change", "Brake Repair", "Tire Rotation", "Battery Check"],
        timeSlots: ["09:00 AM", "10:30 AM", "12:00 PM", "02:00 PM", "04:00 PM"]
    },
    {
        id: 2,
        name: "Pandiyan Motors Garage",
        address: "45 SS Colony, Bypass Road, Madurai - 625016",
        services: ["Engine Diagnostics", "AC Service", "Wheel Alignment"],
        timeSlots: ["09:30 AM", "11:00 AM", "01:30 PM", "03:30 PM"]
    }
];

const INITIAL_BOOKINGS = []; // Now fetching from live backend database

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('bookings');
    const [centers, setCenters] = useState(INITIAL_CENTERS);
    const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
    const [isAddingCenter, setIsAddingCenter] = useState(false);
    const [editingCenterId, setEditingCenterId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Live Database Fetching for Admins
    useEffect(() => {
        const loadGlobalBookings = async () => {
            setIsLoading(true);
            try {
                const liveBookings = await fetchAllBookings();
                setBookings(liveBookings);
            } catch (err) {
                console.error("Failed to load platform bookings", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (activeTab === 'bookings') {
            loadGlobalBookings();
        }
    }, [activeTab]);

    // Live Database Fetching for Centers
    useEffect(() => {
        const loadCenters = async () => {
            try {
                const liveCenters = await fetchNearbyCenters('');
                if (liveCenters && liveCenters.length > 0) {
                    setCenters([...INITIAL_CENTERS, ...liveCenters]);
                }
            } catch (err) {
                console.error("Failed fetching live centers", err);
            }
        };
        // Fetch on mount or when switching tabs
        if (activeTab === 'centers') {
            loadCenters();
        } else if (centers.length === INITIAL_CENTERS.length) {
            loadCenters();
        }
    }, [activeTab]);

    // New Center Form State
    const [newCenter, setNewCenter] = useState({
        name: '',
        address: '',
        services: '',
        timeSlots: ''
    });

    const handleStatusChange = async (bookingId, newStatus, completedTasks = null, newlyCompletedTask = null) => {
        // Optimistic UI update
        const prevBookings = [...bookings];
        setBookings(bookings.map(b => {
            if (b.id === bookingId) {
                return { ...b, status: newStatus, completedTasks: completedTasks !== null ? completedTasks : (b.completedTasks || []) };
            }
            return b;
        }));

        // Network Request
        try {
            await updateBookingStatus(bookingId, newStatus, completedTasks, newlyCompletedTask);
            if (newStatus === 'completed') {
                alert("Service officially marked as Complete. A completion email has been explicitly dispatched to the customer.");
            } else if (newlyCompletedTask) {
                alert(`Task '${newlyCompletedTask}' marked as completed. Customer has been notified.`);
            }
        } catch (err) {
            alert("Failed to update status on server: " + (err.message || "Network Error"));
            setBookings(prevBookings); // Revert optimistic update
        }
    };

    const handleTaskToggle = (booking, taskName) => {
        const currentTasks = booking.completedTasks || [];
        const isCompleted = currentTasks.includes(taskName);
        const newTasks = isCompleted
            ? currentTasks.filter(t => t !== taskName)
            : [...currentTasks, taskName];
        handleStatusChange(booking.id, booking.status, newTasks, !isCompleted ? taskName : null);
    };

    const handleSaveCenter = async (e) => {
        e.preventDefault();

        try {
            const servicesArray = newCenter.services.split(',').map(s => {
                const parts = s.split(':');
                const name = parts[0].trim();
                const price = parts.length > 1 ? parseInt(parts[1].trim(), 10) || 0 : 0;
                return { name, price };
            }).filter(s => s.name);
            const timeSlotsArray = newCenter.timeSlots.split(',').map(s => s.trim()).filter(s => s);

            if (editingCenterId) {
                // PUT to backend MongoDB
                await updateServiceCenter(editingCenterId, {
                    name: newCenter.name,
                    address: newCenter.address,
                    services: servicesArray,
                    timeSlots: timeSlotsArray
                });
                alert("Service Center Successfully Updated!");
            } else {
                // POST to backend MongoDB
                await addServiceCenter({
                    name: newCenter.name,
                    address: newCenter.address,
                    services: servicesArray,
                    timeSlots: timeSlotsArray
                });
                alert("New Service Center Successfully Added to the Database!");
            }

            // Reload centers dynamically
            const liveCenters = await fetchNearbyCenters('');
            setCenters([...INITIAL_CENTERS, ...liveCenters]);

            setNewCenter({ name: '', address: '', services: '', timeSlots: '' });
            setIsAddingCenter(false);
            setEditingCenterId(null);
        } catch (err) {
            alert("Failed to save center: " + (err.message || "Unknown error"));
        }
    };

    const handleEditClick = (center) => {
        setEditingCenterId(center.id);
        setIsAddingCenter(true);
        setNewCenter({
            name: center.name,
            address: center.address,
            services: center.services.map(s => typeof s === 'object' ? `${s.name}:${s.price || 0}` : s).join(', '),
            timeSlots: center.timeSlots.join(', ')
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const renderBookings = () => (
        <div className="animation-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)' }}>Incoming Service Requests</h3>
                <div className="status-badges-legend" style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }}></span> Pending Request</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }}></span> Accepted</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }}></span> Declined</span>
                </div>
            </div>

            <div className="bookings-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {bookings.map(booking => (
                    <div key={booking.id} className="booking-item admin-booking-card" style={{
                        background: 'var(--surface)', padding: '1.5rem', borderRadius: '1rem',
                        border: booking.status === 'pending' ? '2px solid var(--primary-light)' : '1px solid var(--border-color)',
                        display: 'grid', gridTemplateColumns: '1.5fr 2fr 1.5fr', gap: '1.5rem', alignItems: 'flex-start',
                        boxShadow: booking.status === 'pending' ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                        transition: 'all 0.2s'
                    }}>
                        {/* Customer & Vehicle Info */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                <h4 style={{ fontSize: '1.15rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {booking.customerName}
                                </h4>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    <Mail size={14} /> {booking.customerEmail}
                                </p>
                                <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                                    <Wrench size={14} /> {booking.vehicle}
                                </p>
                                <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                                    <Building2 size={14} /> {booking.centerName}
                                </p>
                            </div>
                        </div>

                        {/* Service Requirements & Schedule */}
                        <div style={{ padding: '0 1.5rem', borderLeft: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <p style={{ fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Service Request Details</p>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'monospace', fontWeight: 'bold' }}>#{booking.id}</span>
                            </div>

                            {/* Service Task Checklist */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', background: 'var(--surface-alt)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                                {(() => {
                                    const allTasks = booking.service.split(',').map(t => t.trim()).filter(Boolean);
                                    const areAllTasksDone = allTasks.length > 0 && allTasks.every(t => booking.completedTasks?.includes(t));

                                    return (
                                        <>
                                            {allTasks.map((t, idx) => {
                                                const isDone = booking.completedTasks?.includes(t);
                                                return (
                                                    <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: booking.status === 'accepted' ? 'pointer' : 'default', opacity: booking.status === 'pending' || booking.status === 'declined' ? 0.6 : 1 }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={isDone}
                                                            disabled={booking.status !== 'accepted'}
                                                            onChange={() => handleTaskToggle(booking, t)}
                                                            style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                                                        />
                                                        <span style={{ fontSize: '0.95rem', color: isDone ? 'var(--text-muted)' : 'var(--text-main)', textDecoration: isDone ? 'line-through' : 'none' }}>{t}</span>
                                                    </label>
                                                );
                                            })}

                                            {/* We inject the button exactly here for easy scope access or we just re-evaluate below. Let's just pass areAllTasksDone dynamically where needed. But Wait! The button is in the 'Actions' section. I'll just evaluate it before the whole card mapping, or inside the card scope. */}
                                        </>
                                    );
                                })()}
                            </div>
                            {booking.requirements && (
                                <div style={{ background: 'var(--surface-alt)', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '1rem', border: '1px dashed var(--border-color)' }}>
                                    <p style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem', color: 'var(--text-muted)' }}>
                                        <FileText size={14} /> Customer Notes:
                                    </p>
                                    "{booking.requirements}"
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 500 }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary-light)', color: 'var(--primary-hover)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>
                                    <CalendarCheck size={14} /> {new Date(booking.date).toLocaleDateString()}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary-light)', color: 'var(--primary-hover)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>
                                    <Clock size={14} /> {booking.time}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-end', height: '100%', justifyContent: 'center' }}>

                            <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Action Required</span>
                                <span className={`status-badge status-${booking.status === 'accepted' ? 'confirmed' : booking.status === 'declined' ? 'rejected' : booking.status}`} style={{ fontSize: '0.9rem', margin: 0 }}>
                                    {booking.status.toUpperCase()}
                                </span>
                            </div>

                            {booking.status === 'pending' && (
                                <div style={{ display: 'flex', gap: '0.5rem', width: '100%', marginTop: '0.5rem' }}>
                                    <button
                                        onClick={() => handleStatusChange(booking.id, 'accepted')}
                                        style={{ flex: 1, background: '#10B981', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', fontWeight: '600', transition: 'all 0.2s', boxShadow: 'var(--shadow-sm)' }}
                                    >
                                        <CheckCircle size={18} /> Accept
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange(booking.id, 'declined')}
                                        style={{ flex: 1, background: '#EF4444', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', fontWeight: '600', transition: 'all 0.2s', boxShadow: 'var(--shadow-sm)' }}
                                    >
                                        <XCircle size={18} /> Decline
                                    </button>
                                </div>
                            )}

                            {booking.status === 'accepted' && (() => {
                                const allTasks = booking.service.split(',').map(t => t.trim()).filter(Boolean);
                                const areAllTasksDone = allTasks.length > 0 && allTasks.every(t => booking.completedTasks?.includes(t));

                                if (!areAllTasksDone) return null;

                                return (
                                    <button
                                        onClick={() => handleStatusChange(booking.id, 'completed', booking.completedTasks)}
                                        style={{
                                            width: '100%',
                                            background: 'var(--primary)',
                                            color: 'white',
                                            border: 'none',
                                            padding: '0.65rem', borderRadius: '0.5rem',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem', fontWeight: '600', marginTop: '0.5rem',
                                            transition: 'all 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.25rem'
                                        }}
                                    >
                                        <CheckCircle size={16} /> Finalize Complete Service
                                    </button>
                                );
                            })()}

                            {booking.status !== 'pending' && (
                                <button
                                    onClick={() => handleStatusChange(booking.id, 'pending')}
                                    style={{ width: '100%', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-color)', padding: '0.5rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500', marginTop: '0.5rem', transition: 'all 0.2s' }}
                                >
                                    Revert to Pending
                                </button>
                            )}
                        </div>

                    </div>
                ))
                }
            </div >
        </div >
    );

    const renderCenters = () => (
        <div className="animation-fade-in">
            {/* Exisiting centers render logic kept strictly identical... */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)' }}>Service Centers Overview</h3>
                <button className="btn-primary" onClick={() => {
                    setIsAddingCenter(!isAddingCenter);
                    setEditingCenterId(null);
                    setNewCenter({ name: '', address: '', services: '', timeSlots: '' });
                }}>
                    {isAddingCenter ? 'Cancel' : <><Plus size={18} /> Add New Center</>}
                </button>
            </div>

            {isAddingCenter && (
                <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '1rem', boxShadow: 'var(--shadow-md)', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', color: 'var(--text-main)' }}>{editingCenterId ? 'Edit Service Center' : 'Add a New Service Center'}</h4>
                    <form onSubmit={handleSaveCenter} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="form-group"><label>Center Name</label><input type="text" required value={newCenter.name} onChange={e => setNewCenter({ ...newCenter, name: e.target.value })} /></div>
                        <div className="form-group"><label>Address & Pincode</label><input type="text" required value={newCenter.address} onChange={e => setNewCenter({ ...newCenter, address: e.target.value })} /></div>
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>Services (e.g., Oil Change:500, Wheel Alignment:1200)</label><input type="text" required value={newCenter.services} onChange={e => setNewCenter({ ...newCenter, services: e.target.value })} /></div>
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>Time Slots (Comma separated)</label><input type="text" required value={newCenter.timeSlots} onChange={e => setNewCenter({ ...newCenter, timeSlots: e.target.value })} /></div>
                        <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}><button type="submit" className="btn-primary" style={{ padding: '0.75rem 2rem' }}>Save Service Center</button></div>
                    </form>
                </div>
            )}

            <div className="centers-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
                {centers.map(center => (
                    <div key={center.id} className="center-card" style={{ cursor: 'default' }}>
                        <div className="center-card-header" style={{ marginBottom: '1.5rem' }}>
                            <h4 className="center-name" style={{ fontSize: '1.25rem' }}>{center.name}</h4>
                            <button onClick={() => handleEditClick(center)} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem', fontWeight: 500 }}><Edit2 size={16} /> Edit</button>
                        </div>

                        <div className="center-details" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: 'var(--text-main)' }}>
                                <MapPin size={18} style={{ color: 'var(--primary)', marginTop: '0.1rem' }} />
                                <span>{center.address}</span>
                            </div>

                            <div style={{ background: 'var(--surface-alt)', padding: '1rem', borderRadius: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-main)' }}><Wrench size={16} /> Services Offered</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {center.services.map((svc, i) => <span key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.85rem' }}>{typeof svc === 'string' ? svc : svc.name}</span>)}
                                </div>
                            </div>

                            <div style={{ background: 'var(--surface-alt)', padding: '1rem', borderRadius: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-main)' }}><Clock size={16} /> Time Slots</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {center.timeSlots.map((slot, i) => <span key={i} style={{ background: 'white', border: '1px solid var(--border-color)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '500' }}>{slot}</span>)}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h1>Admin Dashboard</h1>
                    <p>Review customer booking requirements, trigger notifications, and accept/decline queue requests.</p>
                </div>
            </div>

            <div className="dashboard-nav">
                <button
                    className={`dashboard-tab ${activeTab === 'bookings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('bookings')}
                >
                    <CalendarCheck size={18} /> Booking Requests
                    {bookings.filter(b => b.status === 'pending').length > 0 &&
                        <span style={{
                            background: 'var(--primary)', color: 'white', padding: '0.1rem 0.4rem',
                            borderRadius: '1rem', fontSize: '0.75rem', marginLeft: '0.25rem'
                        }}>
                            {bookings.filter(b => b.status === 'pending').length}
                        </span>
                    }
                </button>
                <button
                    className={`dashboard-tab ${activeTab === 'centers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('centers')}
                >
                    <Building2 size={18} /> Service Centers
                </button>
            </div>

            {activeTab === 'bookings' ? renderBookings() : renderCenters()}
        </div>
    );
};

export default AdminDashboard;
