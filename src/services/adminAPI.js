import apiClient from './apiClient';

/**
 * Admin Module API Service
 */

// Example GET request: Fetch all bookings across platform
export const fetchAllBookings = async () => {
    try {
        const response = await apiClient.get('/admin/bookings/all');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Example POST request: Update the status of a booking
export const updateBookingStatus = async (bookingId, newStatus, completedTasks = null, newlyCompletedTask = null) => {
    try {
        const payload = { status: newStatus };
        if (completedTasks) payload.completedTasks = completedTasks;
        if (newlyCompletedTask) payload.newlyCompletedTask = newlyCompletedTask;
        const response = await apiClient.post(`/admin/bookings/${bookingId}/status`, payload);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Example POST request: Register a new Service Center
export const addServiceCenter = async (centerData) => {
    try {
        const response = await apiClient.post('/admin/centers/create', centerData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Example PUT request: Update an existing Service Center
export const updateServiceCenter = async (id, centerData) => {
    try {
        const response = await apiClient.put(`/admin/centers/${id}`, centerData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
