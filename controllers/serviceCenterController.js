const ServiceCenter = require('../models/ServiceCenter');
const Booking = require('../models/Booking');

// GET /api/centers/search?location=...
const searchCenters = async (req, res) => {
    try {
        const { location } = req.query;
        let query = {};

        if (location) {
            query = {
                $or: [
                    { serviceCenterName: { $regex: location, $options: 'i' } },
                    { city: { $regex: location, $options: 'i' } },
                    { address: { $regex: location, $options: 'i' } }
                ]
            };
        }

        const centers = await ServiceCenter.find(query);

        // Transform to match frontend mock data exactly
        const formattedCenters = centers.map(c => {
            // Automatically capture the 6-digit Pincode from the admin's raw text
            const pincodeMatch = c.address.match(/\b\d{6}\b/);
            const pincode = pincodeMatch ? pincodeMatch[0] : '625000';

            // Cleanse the address of any repeated 'Unknown City' or 'To Be Updated' strings
            let cleanAddress = c.address.replace(/(,\s*)?Unknown City/gi, '')
                .replace(/(,\s*)?To Be Updated/gi, '')
                .replace(/,\s*,/g, ',')
                .replace(/,\s*$/, '');

            // Append city if valid and not already in address
            if (c.city && !c.city.toLowerCase().includes('unknown') && !cleanAddress.toLowerCase().includes(c.city.toLowerCase())) {
                cleanAddress += `, ${c.city}`;
            }

            return {
                id: c._id, // use actual ID for functionality
                name: c.serviceCenterName,
                address: cleanAddress,
                pincode: pincode, // Extracted securely
                distance: "2.5 km", // Dummy calculation for now
                rating: 4.5, // Dummy rating
                services: c.servicesOffered && c.servicesOffered.length > 0 ? c.servicesOffered.map(s => ({ name: s.name, price: s.price !== undefined ? s.price : 500 })) : [{ name: "General Service", price: 1000 }],
                timeSlots: c.timeSlots && c.timeSlots.length > 0 ? c.timeSlots : (c.workingHours && c.workingHours.open && c.workingHours.close ? [c.workingHours.open, '12:00 PM', c.workingHours.close] : ["09:00 AM", "02:00 PM"])
            };
        });

        res.json(formattedCenters);
    } catch (error) {
        console.error("Search Centers Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    searchCenters,
};
