import apiClient from './apiClient';

/**
 * Auth API Service
 */

// Example POST request: User Login
export const loginUser = async (credentials) => {
    try {
        const response = await apiClient.post('/auth/login', credentials);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Example POST request: User Registration
export const registerUser = async (userData) => {
    try {
        const response = await apiClient.post('/auth/register', userData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Example GET request: Fetch Current Logged-in User Profile
export const fetchCurrentUser = async () => {
    try {
        // Requires JWT token attached automatically by apiClient interceptor
        const response = await apiClient.get('/auth/me');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const requestForgotPassword = async (email) => {
    try {
        const response = await apiClient.post('/auth/forgot-password', { email });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const submitResetPassword = async (payload) => {
    try {
        const response = await apiClient.post('/auth/reset-password', payload);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
