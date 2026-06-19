import apiClient from './apiClient';

/**
 * User Module API Service
 */

// Example GET request: Fetch nearby service centers based on coords or string
export const fetchNearbyCenters = async (queryLocation) => {
    try {
        // Pass query params using 'params' object
        const response = await apiClient.get('/centers/search', { params: { location: queryLocation } });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Example GET request: Get User Bookings
export const fetchUserBookings = async () => {
    try {
        const response = await apiClient.get('/bookings/my-appointments');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Example POST request: Create a New Service Booking
export const createBooking = async (bookingData) => {
    try {
        const response = await apiClient.post('/bookings/create', bookingData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Example POST request: Rate a Service Booking
export const rateBooking = async (bookingId, ratingData) => {
    try {
        const response = await apiClient.post(`/bookings/${bookingId}/rate`, ratingData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
