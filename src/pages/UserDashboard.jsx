import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Clock, Star, Wrench, ChevronLeft, CalendarCheck, Map, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { fetchUserBookings, createBooking as apiCreateBooking, fetchNearbyCenters, rateBooking } from '../services/userAPI';

const MOCK_CENTERS = [
    {
        id: 1,
        name: "Meenakshi Auto Care",
        address: "12 Anna Nagar Main Rd, Madurai",
        pincode: "625020",
        distance: "2.1 km",
        rating: 4.8,
        services: [
            { name: "Oil Change", price: 1500 },
            { name: "Brake Repair", price: 2500 },
            { name: "Tire Rotation", price: 800 },
            { name: "Battery Check", price: 500 }
        ],
        timeSlots: ["09:00 AM", "10:30 AM", "12:00 PM", "02:00 PM", "04:00 PM"]
    },
    {
        id: 2,
        name: "Pandiyan Motors Garage",
        address: "45 SS Colony, Bypass Road, Madurai",
        pincode: "625016",
        distance: "3.5 km",
        rating: 4.5,
        services: [
            { name: "Engine Diagnostics", price: 2000 },
            { name: "AC Service", price: 1800 },
            { name: "Wheel Alignment", price: 1200 }
        ],
        timeSlots: ["09:30 AM", "11:00 AM", "01:30 PM", "03:30 PM"]
    },
    {
        id: 3,
        name: "Vaigai Car Services",
        address: "88 Tallakulam, Madurai",
        pincode: "625002",
        distance: "5.0 km",
        rating: 4.9,
        services: [
            { name: "Full Servicing", price: 4500 },
            { name: "Body Work", price: 8000 },
            { name: "Painting", price: 12000 }
        ],
        timeSlots: ["10:00 AM", "01:00 PM", "04:00 PM"]
    },
    {
        id: 4,
        name: "Tirupparankundram Auto Fix",
        address: "212 Temple Road, Madurai",
        pincode: "625005",
        distance: "6.2 km",
        rating: 4.2,
        services: [
            { name: "Quick Oil Change", price: 1200 },
            { name: "Wiper Replacement", price: 600 },
            { name: "Wash & Detailing", price: 1500 }
        ],
        timeSlots: ["09:00 AM", "11:00 AM", "02:00 PM", "05:00 PM"]
    },
];

// Global platform bookings to simulate slots already taken by other users
const PLATFORM_BOOKINGS = [
    { centerId: 1, date: "2026-03-05", time: "10:30 AM" },
    { centerId: 1, date: "2026-03-05", time: "02:00 PM" },
    { centerId: 2, date: "2026-03-01", time: "11:00 AM" },
];

const ISSUE_MAPPINGS = [
    { keywords: ['power window', 'window stuck', 'window not working'], category: 'Electrical Repair', service: 'Power Window Inspection', price: '₹800 - ₹2500', time: '1-2 Hours' },
    { keywords: ['brake', 'braking', 'pad'], category: 'Brake System', service: 'Brake Pad Replacement / Inspection', price: '₹1200 - ₹3500', time: '2-3 Hours' },
    { keywords: ['engine sound', 'engine noise', 'engine vibration', 'engine knocking'], category: 'Engine Diagnostics', service: 'Engine Inspection', price: '₹1500 - ₹5000+', time: '3-5 Hours' },
    { keywords: ['battery', 'starting problem', "won't start", 'wont start'], category: 'Electrical System', service: 'Battery Health Check / Replacement', price: '₹500 - ₹4500', time: '1 Hour' },
    { keywords: ['ac not cooling', 'ac issue', 'air condition', 'ac gas'], category: 'AC Service', service: 'AC Gas Top-up / Leak Check', price: '₹1000 - ₹3000', time: '2 Hours' },
    { keywords: ['tyre puncture', 'flat tyre', 'flat tire', 'puncture'], category: 'Tire Service', service: 'Puncture Repair', price: '₹150 - ₹500', time: '30 Mins' },
    { keywords: ['oil leak', 'oil dripping', 'oil spill', 'oil leakage'], category: 'Engine Maintenance', service: 'Oil Leak Inspection', price: '₹500 - ₹2000', time: '1-2 Hours' }
];

const INITIAL_BOOKINGS = []; // Will be populated by real database

const UserDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('search');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCenter, setSelectedCenter] = useState(null);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [centers, setCenters] = useState(MOCK_CENTERS);
    
    const [ratingModalBookingId, setRatingModalBookingId] = useState(null);
    const [ratingValue, setRatingValue] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);

    // Set default date to today for the booking form
    const today = new Date().toISOString().split('T')[0];

    const [bookingForm, setBookingForm] = useState({
        date: today,
        time: '',
        services: [],
        vehicle: '',
        fuelType: 'Petrol',
        requirements: ''
    });

    const [userBookings, setUserBookings] = useState(INITIAL_BOOKINGS);
    const [availableSlots, setAvailableSlots] = useState([]);
    
    // Smart Issue Detection State
    const [detectedIssue, setDetectedIssue] = useState(null);
    const [showDetection, setShowDetection] = useState(false);
    const [customServiceCost, setCustomServiceCost] = useState(0);

    // Filter by Madurai pincode, address, or name
    const filteredCenters = centers.filter(center =>
        (center.pincode && center.pincode.includes(searchQuery)) ||
        (center.address && center.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (center.name && center.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Fetch live service centers on load
    useEffect(() => {
        const loadCenters = async () => {
            try {
                const liveCenters = await fetchNearbyCenters('');
                if (liveCenters && liveCenters.length > 0) {
                    setCenters([...MOCK_CENTERS, ...liveCenters]);
                }
            } catch (err) {
                console.error("Failed fetching live centers", err);
            }
        };
        loadCenters();
    }, []);

    // Dynamically calculate available slots based on selected date
    useEffect(() => {
        if (selectedCenter && bookingForm.date) {
            const slots = selectedCenter.timeSlots.filter(slot => {
                // Check if taken by others
                const globalTaken = PLATFORM_BOOKINGS.some(b =>
                    b.centerId === selectedCenter.id && b.date === bookingForm.date && b.time === slot
                );
                // Check if taken by this user
                const userTaken = userBookings.some(b =>
                    b.centerId === selectedCenter.id && b.date === bookingForm.date && b.time === slot && b.status !== 'cancelled'
                );
                return !globalTaken && !userTaken;
            });
            setAvailableSlots(slots);

            // Reset time if currently selected time is no longer available
            if (!slots.includes(bookingForm.time)) {
                setBookingForm(prev => ({ ...prev, time: '' }));
            }
        }
    }, [selectedCenter, bookingForm.date, userBookings]);

    // Real-time Issue Detection Effect
    useEffect(() => {
        const text = bookingForm.requirements;
        
        const timer = setTimeout(() => {
            const trimmed = text.trim();
            if (trimmed.length > 2 && text.includes(' ')) {
                setShowDetection(true);
                
                // Generate a random cost if not already generated
                setCustomServiceCost(prevCost => prevCost === 0 ? Math.floor(Math.random() * 4000) + 500 : prevCost);

                let found = null;
                for (const mapping of ISSUE_MAPPINGS) {
                    if (mapping.keywords.some(kw => text.toLowerCase().includes(kw))) {
                        found = mapping;
                        break;
                    }
                }
                setDetectedIssue(found);
            } else if (trimmed.length === 0) {
                setShowDetection(false);
                setDetectedIssue(null);
                setCustomServiceCost(0);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [bookingForm.requirements]);

    // Live Database Fetching for User Bookings
    useEffect(() => {
        const loadMyData = async () => {
            setIsLoadingData(true);
            try {
                const liveBookings = await fetchUserBookings();
                setUserBookings(liveBookings);
            } catch (err) {
                console.error("Failed fetching live bookings", err);
            } finally {
                setIsLoadingData(false);
            }
        };
        // Fetch on mount or when switching to bookings tab
        if (activeTab === 'bookings') {
            loadMyData();
        } else if (userBookings.length === 0) {
            loadMyData(); // Initial load for slot blocking logic
        }
    }, [activeTab]);

    const calculateTotal = () => {
        return bookingForm.services.reduce((total, serviceName) => {
            const s = selectedCenter.services.find(xs => xs.name === serviceName);
            return total + (s ? s.price : 0);
        }, 0) + customServiceCost;
    };

    const handleBookService = async (e) => {
        e.preventDefault();
        if (!bookingForm.time) {
            alert("Please select an available time slot.");
            return;
        }
        if (bookingForm.services.length === 0) {
            alert("Please select at least one service.");
            return;
        }

        try {
            // Live API Call to MongoDB
            const newBooking = await apiCreateBooking({
                centerName: selectedCenter.name,
                date: bookingForm.date,
                time: bookingForm.time,
                service: bookingForm.services.join(', '),
                vehicle: `${bookingForm.vehicle} (${bookingForm.fuelType})`,
                requirements: bookingForm.requirements,
                estimatedPrice: calculateTotal()
            });

            // Navigate to payment page with booking details
            navigate('/payment', { state: { booking: newBooking } });
        } catch (err) {
            alert("Failed to create booking over network: " + (err.message || 'Unknown error'));
        }
    };

    const handleSubmitRating = async (bookingId) => {
        if (ratingValue < 1 || ratingValue > 5) {
            alert('Please select a rating between 1 and 5 stars.');
            return;
        }
        setIsSubmittingRating(true);
        try {
            const response = await rateBooking(bookingId, { rating: ratingValue, review: reviewText });
            // Update local state
            setUserBookings(prev => prev.map(b => 
                b.id === bookingId ? { ...b, rating: response.rating, review: response.review } : b
            ));
            // Reset modal
            setRatingModalBookingId(null);
            setRatingValue(0);
            setReviewText('');
        } catch (error) {
            alert("Failed to submit rating: " + (error.message || 'Unknown error'));
        } finally {
            setIsSubmittingRating(false);
        }
    };

    const renderSearch = () => {
        if (selectedCenter) {
            const PREMIUM_IMAGES = [
                '/centers/premium_center_1_1775112249315.png',
                '/centers/premium_center_2_1775112265455.png',
                '/centers/premium_center_3_1775112278142.png',
                '/centers/premium_center_4_1775112294196.png',
                '/centers/premium_center_5_1775112310452.png',
                '/centers/premium_center_6_1775112325226.png',
            ];
            const hashId = String(selectedCenter.id || selectedCenter._id || selectedCenter.name).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const imgSrc = PREMIUM_IMAGES[hashId % PREMIUM_IMAGES.length];

            return (
                <div className="booking-view animation-fade-in">
                    <div>
                        <button className="btn-outline" onClick={() => setSelectedCenter(null)} style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ChevronLeft size={18} /> Back to Results
                        </button>
                        <div className="center-card" style={{ cursor: 'default' }}>
                            <div className="center-card-header">
                                <h3 className="center-name">{selectedCenter.name}</h3>
                                <span className="center-rating"><Star size={16} fill="currentColor" /> {selectedCenter.rating}</span>
                            </div>
                            <div className="center-details">
                                <div className="detail-row"><MapPin size={18} /> {selectedCenter.address} - {selectedCenter.pincode} ({selectedCenter.distance})</div>
                                <div className="detail-row"><Wrench size={18} /> Services: {selectedCenter.services.map(s => s.name).join(', ')}</div>
                                <div className="detail-row" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                                    <img src={imgSrc} alt="Garage setup" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '0.5rem', marginBottom: '1rem', boxShadow: 'var(--shadow-sm)' }} />
                                    <p><strong>About:</strong> Fully equipped garage in Madurai ready to handle your vehicle needs with certified mechanics.</p>
                                </div>
                            </div>
                        </div>

                        {(bookingForm.services.length > 0 || customServiceCost > 0) && (
                            <div className="center-card" style={{ marginTop: '1.5rem', background: 'var(--surface)', borderColor: 'var(--primary-light)', cursor: 'default', boxShadow: 'var(--shadow-orange)' }}>
                                <h4 style={{ marginBottom: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FileText size={18} /> Service Cost Breakdown
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {bookingForm.services.map(serviceName => {
                                        const s = selectedCenter.services.find(xs => xs.name === serviceName);
                                        return (
                                            <div key={serviceName} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed var(--border-color)', paddingBottom: '0.5rem', color: 'var(--text-main)' }}>
                                                <span>{serviceName}</span>
                                                <span style={{ fontWeight: '600' }}>{s ? `₹${s.price}` : 'TBD'}</span>
                                            </div>
                                        );
                                    })}
                                    {customServiceCost > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed var(--border-color)', paddingBottom: '0.5rem', color: 'var(--text-main)' }}>
                                            <span>Additional Services ({bookingForm.requirements})</span>
                                            <span style={{ fontWeight: '600' }}>₹{customServiceCost}</span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                                        <span>Total Amount Payable</span>
                                        <span>
                                            ₹{calculateTotal()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="booking-form-container" style={{ background: 'var(--surface-alt)', padding: '2rem', borderRadius: '1rem' }}>
                        <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>Schedule Service</h3>
                        <form onSubmit={handleBookService} className="booking-form">
                            <div className="form-group">
                                <label>Vehicle Make & Model</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Maruti Suzuki Swift 2022"
                                    value={bookingForm.vehicle}
                                    onChange={(e) => setBookingForm({ ...bookingForm, vehicle: e.target.value })}
                                    style={{ marginBottom: '0.5rem' }}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label>Fuel Type</label>
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                    {['Petrol', 'Diesel', 'CNG', 'EV'].map(fuel => (
                                        <button
                                            key={fuel}
                                            type="button"
                                            onClick={() => setBookingForm({ ...bookingForm, fuelType: fuel })}
                                            style={{
                                                flex: 1, padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '0.5rem',
                                                background: bookingForm.fuelType === fuel ? 'var(--primary-light)' : 'var(--surface)',
                                                color: bookingForm.fuelType === fuel ? 'var(--primary)' : 'var(--text-muted)',
                                                fontWeight: bookingForm.fuelType === fuel ? 600 : 500,
                                                cursor: 'pointer', transition: 'all 0.2s',
                                                borderColor: bookingForm.fuelType === fuel ? 'var(--primary)' : 'var(--border-color)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}
                                        >
                                            {fuel}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Services Required</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                                    {selectedCenter.services.map(s => (
                                        <label key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'normal', cursor: 'pointer', background: 'var(--surface)', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                                            <input
                                                type="checkbox"
                                                checked={bookingForm.services.includes(s.name)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setBookingForm({ ...bookingForm, services: [...bookingForm.services, s.name] });
                                                    } else {
                                                        setBookingForm({ ...bookingForm, services: bookingForm.services.filter(srv => srv !== s.name) });
                                                    }
                                                }}
                                                style={{ width: 'auto', margin: 0 }}
                                            />
                                            <span style={{ flex: 1 }}>{s.name}</span>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>₹{s.price}</span>
                                        </label>
                                    ))}

                                </div>
                            </div>

                            {/* Added Description Box */}
                            <div className="form-group">
                                <label>Additional Requirements / Issues</label>
                                <textarea
                                    rows="3"
                                    placeholder="Describe any specific issues, symptoms, or requests here..."
                                    value={bookingForm.requirements}
                                    onChange={(e) => setBookingForm({ ...bookingForm, requirements: e.target.value })}
                                    style={{ resize: 'vertical' }}
                                />
                                {showDetection && (
                                    <div style={{
                                        marginTop: '1rem',
                                        padding: '1.25rem',
                                        borderRadius: '0.75rem',
                                        background: detectedIssue ? 'rgba(249, 115, 22, 0.05)' : 'var(--surface-alt)',
                                        border: `1px solid ${detectedIssue ? 'var(--primary-light)' : 'var(--border-color)'}`,
                                        boxShadow: detectedIssue ? 'var(--shadow-orange)' : 'none',
                                        animation: 'fadeIn 0.3s ease-in-out',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        {detectedIssue ? (
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>
                                                    <Wrench size={20} />
                                                    <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Smart Issue Detected</h4>
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                    <div>
                                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Detected Category</span>
                                                        <p style={{ margin: '0.25rem 0 0', fontWeight: '500', color: 'var(--text-main)' }}>{detectedIssue.category}</p>
                                                    </div>
                                                    <div>
                                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Suggested Service</span>
                                                        <p style={{ margin: '0.25rem 0 0', fontWeight: '500', color: 'var(--text-main)' }}>{detectedIssue.service}</p>
                                                    </div>
                                                    <div>
                                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Estimated Cost</span>
                                                        <p style={{ margin: '0.25rem 0 0', fontWeight: '600', color: '#10B981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                            {detectedIssue.price}
                                                        </p>
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Starting From (Approx Range)</span>
                                                    </div>
                                                    <div>
                                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Estimated Time</span>
                                                        <p style={{ margin: '0.25rem 0 0', fontWeight: '500', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                            <Clock size={16} /> {detectedIssue.time}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                                <AlertCircle size={22} color="var(--primary)" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                                                <div>
                                                    <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1rem', color: 'var(--text-main)' }}>Inspection Required</h4>
                                                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                                                        Final quotation and suggested repairs will be provided after our mechanic diagnoses the issue in person.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Preferred Date</label>
                                    <input
                                        type="date"
                                        required
                                        min={today}
                                        value={bookingForm.date}
                                        onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                                    />
                                </div>
                                {/* Dynamically Populated Time Slots */}
                                <div className="form-group">
                                    <label>Available Time Slot</label>
                                    <select
                                        required
                                        value={bookingForm.time}
                                        onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                                        disabled={availableSlots.length === 0}
                                    >
                                        <option value="">
                                            {availableSlots.length === 0 ? "No slots available" : "Select a time"}
                                        </option>
                                        {availableSlots.map(slot => (
                                            <option key={slot} value={slot}>{slot}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <button type="submit" className="btn-primary" style={{ marginTop: '1.5rem', width: '100%' }} disabled={availableSlots.length === 0}>
                                <CalendarCheck size={18} /> Confirm Booking
                            </button>
                        </form>
                    </div>
                </div>
            );
        }

        return (
            <div className="animation-fade-in">
                <div className="search-section">
                    <div className="search-bar">
                        <div className="search-input-wrapper">
                            <Search className="search-icon" size={20} />
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search by Madurai Pincode (e.g., 625020) or location..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button className="btn-primary" style={{ padding: '1rem 2rem' }}><Map size={18} /> Locate Me</button>
                    </div>
                </div>

                <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-main)' }}>Service Centers in Madurai</h3>
                {filteredCenters.length > 0 ? (
                    <div className="centers-grid">
                        {filteredCenters.map(center => {
                            const PREMIUM_IMAGES = [
                                '/centers/premium_center_1_1775112249315.png',
                                '/centers/premium_center_2_1775112265455.png',
                                '/centers/premium_center_3_1775112278142.png',
                                '/centers/premium_center_4_1775112294196.png',
                                '/centers/premium_center_5_1775112310452.png',
                                '/centers/premium_center_6_1775112325226.png',
                            ];
                            const hashId = String(center.id || center._id || center.name).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                            const imgSrc = PREMIUM_IMAGES[hashId % PREMIUM_IMAGES.length];

                            return (
                                <div key={center.id} className="center-card" onClick={() => setSelectedCenter(center)}>
                                    <img src={imgSrc} alt={center.name} style={{ width: '100%', height: '140px', objectFit: 'cover', borderBottom: '1px solid var(--border-color)', margin: '-1.5rem -1.5rem 1rem -1.5rem', width: 'calc(100% + 3rem)', borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem' }} />
                                    <div className="center-card-header">
                                        <h4 className="center-name">{center.name}</h4>
                                        <span className="center-rating"><Star size={16} fill="currentColor" /> {center.rating}</span>
                                    </div>
                                    <div className="center-details">
                                        <div className="detail-row"><MapPin size={16} /> {center.address}</div>
                                        <div className="detail-row"><MapPin size={16} style={{ opacity: 0 }} /> Pincode: {center.pincode} • {center.distance} away</div>
                                        <div className="detail-row" style={{ marginTop: '0.5rem' }}><Wrench size={16} /> {center.services.length} Services Available</div>
                                    </div>
                                    <div className="card-footer">
                                        <span className="btn-outline" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>View Details & Slots</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="empty-state">
                        <Search size={48} opacity={0.5} />
                        <p style={{ marginTop: '1rem', fontSize: '1.1rem' }}>No service centers found in this region.</p>
                    </div>
                )}
            </div>
        );
    };

    const renderBookings = () => {
        return (
            <div className="animation-fade-in">
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-main)' }}>My Appointments</h3>
                {userBookings.length > 0 ? (
                    <div className="bookings-list">
                        {userBookings.map(booking => (
                            <div key={booking.id} style={{ display: 'flex', flexDirection: 'column' }}>
                                <div className="booking-item">
                                    <div className="booking-info" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                                        <div>
                                            <h4>{booking.centerName}</h4>
                                            <p style={{ color: 'var(--text-muted)' }}>{booking.vehicle} Request</p>

                                            <div style={{ marginTop: '1rem', background: 'var(--surface-alt)', padding: '1rem', borderRadius: '0.75rem', border: '1px dashed var(--border-color)', width: '100%' }}>
                                                <p style={{ fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text-main)', fontSize: '0.95rem' }}>Service Job Tracker</p>
                                                {booking.service.split(',').map((task, idx) => {
                                                    const t = task.trim();
                                                    if (!t) return null;
                                                    const isDone = booking.completedTasks?.includes(t);
                                                    return (
                                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.4rem 0' }}>
                                                            {isDone ? <CheckCircle size={18} color="#10B981" /> : <Clock size={18} color="#F59E0B" />}
                                                            <span style={{ fontSize: '0.95rem', color: isDone ? 'var(--text-muted)' : 'var(--text-main)', textDecoration: isDone ? 'line-through' : 'none' }}>
                                                                {t}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            {booking.requirements && (
                                                <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-main)', background: 'var(--surface-alt)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                                                    <FileText size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.25rem' }} />
                                                    "{booking.requirements}"
                                                </p>
                                            )}
                                            <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>Booking ID: {booking.id}</p>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-muted)' }}>
                                            <div className="detail-row"><Calendar size={16} /> {new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                            <div className="detail-row"><Clock size={16} /> {booking.time}</div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span className={`status-badge status-${booking.status}`}>
                                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                        </span>
                                        {booking.status === 'pending' && <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Awaiting Confirmation</p>}
                                    </div>
                                </div>
                                
                                {/* Rating Section Below Booking Item */}
                                {booking.status === 'completed' && (
                                    <div style={{ marginTop: '0.5rem', background: 'var(--surface-alt)', padding: '1.25rem', borderRadius: '1rem', border: '1px solid var(--border-color)', width: '100%' }}>
                                        {booking.rating ? (
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                    <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>Your Rating:</span>
                                                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                                                        {[1, 2, 3, 4, 5].map(star => (
                                                            <Star key={star} size={18} fill={star <= booking.rating ? "#F59E0B" : "none"} color={star <= booking.rating ? "#F59E0B" : "var(--border-color)"} />
                                                        ))}
                                                    </div>
                                                </div>
                                                {booking.review && (
                                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontStyle: 'italic', margin: 0 }}>"{booking.review}"</p>
                                                )}
                                            </div>
                                        ) : ratingModalBookingId === booking.id ? (
                                            <div>
                                                <h4 style={{ marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1.05rem' }}>Rate this Service</h4>
                                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <Star 
                                                            key={star} 
                                                            size={28} 
                                                            fill={star <= ratingValue ? "#F59E0B" : "none"} 
                                                            color={star <= ratingValue ? "#F59E0B" : "var(--border-color)"}
                                                            onClick={() => setRatingValue(star)}
                                                            style={{ cursor: 'pointer', transition: 'transform 0.1s' }}
                                                            onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                                                            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                                                        />
                                                    ))}
                                                </div>
                                                <textarea 
                                                    rows="2" 
                                                    placeholder="Optional: Tell us about your experience..."
                                                    value={reviewText}
                                                    onChange={(e) => setReviewText(e.target.value)}
                                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)', marginBottom: '1rem', fontFamily: 'inherit', resize: 'vertical' }}
                                                />
                                                <div style={{ display: 'flex', gap: '1rem' }}>
                                                    <button 
                                                        className="btn-primary" 
                                                        onClick={() => handleSubmitRating(booking.id)}
                                                        disabled={isSubmittingRating || ratingValue === 0}
                                                    >
                                                        {isSubmittingRating ? 'Submitting...' : 'Submit Rating'}
                                                    </button>
                                                    <button 
                                                        className="btn-outline" 
                                                        onClick={() => {
                                                            setRatingModalBookingId(null);
                                                            setRatingValue(0);
                                                            setReviewText('');
                                                        }}
                                                        disabled={isSubmittingRating}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button 
                                                className="btn-outline" 
                                                style={{ color: 'var(--primary)', borderColor: 'var(--primary)', padding: '0.5rem 1rem' }}
                                                onClick={() => {
                                                    setRatingModalBookingId(booking.id);
                                                    setRatingValue(0);
                                                    setReviewText('');
                                                }}
                                            >
                                                <Star size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'text-bottom' }} />
                                                Rate Service
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <CalendarCheck size={48} opacity={0.5} />
                        <p style={{ marginTop: '1rem', fontSize: '1.1rem' }}>You have no bookings yet.</p>
                        <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => setActiveTab('search')}>Find a Service Center</button>
                    </div>
                )}
            </div>
        );
    };

    const [profile, setProfile] = useState(() => {
        const saved = localStorage.getItem('user_profile');
        return saved ? JSON.parse(saved) : { name: 'Customer Name', email: 'customer@example.com', vehicle: 'Unknown Vehicle', fuelType: 'Petrol' };
    });
    const [isEditingProfile, setIsEditingProfile] = useState(false);

    const saveProfile = () => {
        localStorage.setItem('user_profile', JSON.stringify(profile));
        setIsEditingProfile(false);
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div>
                    <h1>User Dashboard</h1>
                    <p>Find the best service centers near you in Madurai and manage your bookings.</p>
                </div>

                {/* Profile Widget */}
                <div style={{ background: 'white', padding: '1rem', borderRadius: '1rem', boxShadow: 'var(--shadow-sm)', display: 'flex', gap: '1rem', alignItems: 'center', border: '1px solid var(--border-color)', minWidth: '320px' }}>

                    {!isEditingProfile ? (
                        <>
                            <div style={{ background: 'var(--primary-light)', padding: '0.75rem', borderRadius: '50%', flexShrink: 0 }}>
                                <CheckCircle size={32} color="var(--primary)" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between' }}>
                                    {profile.name}
                                    <button onClick={() => setIsEditingProfile(true)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem' }}>Edit</button>
                                </h4>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{profile.email}</p>
                                <div style={{ marginTop: '0.5rem', background: 'var(--surface-alt)', padding: '0.35rem 0.6rem', borderRadius: '0.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>
                                    <Wrench size={14} color="var(--primary)" />
                                    <span><strong>{profile.vehicle}</strong> ({profile.fuelType})</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <input type="text" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} placeholder="Name" style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', width: '100%' }} />
                            <input type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} placeholder="Email" style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', width: '100%' }} />
                            <input type="text" value={profile.vehicle} onChange={e => setProfile({ ...profile, vehicle: e.target.value })} placeholder="Vehicle Make/Model" style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', width: '100%' }} />
                            <select value={profile.fuelType} onChange={e => setProfile({ ...profile, fuelType: e.target.value })} style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', width: '100%' }}>
                                <option>Petrol</option>
                                <option>Diesel</option>
                                <option>CNG</option>
                                <option>EV</option>
                            </select>
                            <button onClick={saveProfile} className="btn-primary" style={{ padding: '0.5rem', width: '100%', marginTop: '0.25rem' }}>Save Profile</button>
                        </div>
                    )}
                </div>
            </div>

            <div className="dashboard-nav">
                <button
                    className={`dashboard-tab ${activeTab === 'search' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('search'); setSelectedCenter(null); }}
                >
                    <MapPin size={18} /> Find Services
                </button>
                <button
                    className={`dashboard-tab ${activeTab === 'bookings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('bookings')}
                >
                    <CalendarCheck size={18} /> My Bookings
                    {userBookings.filter(b => b.status === 'pending').length > 0 &&
                        <span style={{
                            background: 'var(--primary)', color: 'white', padding: '0.1rem 0.4rem',
                            borderRadius: '1rem', fontSize: '0.75rem', marginLeft: '0.25rem'
                        }}>
                            {userBookings.filter(b => b.status === 'pending').length}
                        </span>
                    }
                </button>
            </div>

            {activeTab === 'search' ? renderSearch() : renderBookings()}
        </div>
    );
};

export default UserDashboard;
