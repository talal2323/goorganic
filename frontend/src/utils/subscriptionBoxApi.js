import api from './api';

// Public
export const getSubscriptionBoxes = async (params = {}) => {
    try {
        const response = await api.get('/subscription-boxes', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching subscription boxes:', error);
        throw error;
    }
};

export const getSubscriptionBoxById = async (boxId) => {
    try {
        const response = await api.get(`/subscription-boxes/${boxId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching subscription box:', error);
        throw error;
    }
};

export const subscribeToSubscriptionBox = async (boxId, payload) => {
    try {
        const response = await api.post(`/subscription-boxes/${boxId}/subscribe`, payload);
        return response.data;
    } catch (error) {
        console.error('Error subscribing to subscription box:', error);
        throw error;
    }
};

// Vendor
export const getMySubscriptionBoxes = async () => {
    try {
        const response = await api.get('/vendors/subscription-boxes');
        return response.data;
    } catch (error) {
        console.error('Error fetching my subscription boxes:', error);
        throw error;
    }
};

export const createSubscriptionBox = async (payload) => {
    try {
        const response = await api.post('/vendors/subscription-boxes', payload);
        return response.data;
    } catch (error) {
        console.error('Error creating subscription box:', error);
        throw error;
    }
};

export const updateSubscriptionBox = async (boxId, payload) => {
    try {
        const response = await api.put(`/vendors/subscription-boxes/${boxId}`, payload);
        return response.data;
    } catch (error) {
        console.error('Error updating subscription box:', error);
        throw error;
    }
};

export const deleteSubscriptionBox = async (boxId) => {
    try {
        const response = await api.delete(`/vendors/subscription-boxes/${boxId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting subscription box:', error);
        throw error;
    }
};

// Customer subscriptions
export const getMyBoxSubscriptions = async () => {
    try {
        const response = await api.get('/box-subscriptions');
        return response.data;
    } catch (error) {
        console.error('Error fetching my subscriptions:', error);
        throw error;
    }
};

export const cancelBoxSubscription = async (subscriptionId) => {
    try {
        const response = await api.put(`/box-subscriptions/${subscriptionId}/cancel`);
        return response.data;
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        throw error;
    }
};

export const updateBoxSubscriptionAddress = async (subscriptionId, payload) => {
    try {
        const response = await api.put(`/box-subscriptions/${subscriptionId}/address`, payload);
        return response.data;
    } catch (error) {
        console.error('Error updating subscription address:', error);
        throw error;
    }
};

// Admin
export const getAllSubscriptionBoxes = async (params = {}) => {
    try {
        const response = await api.get('/admin/subscription-boxes', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching all subscription boxes:', error);
        throw error;
    }
};

export const adminToggleBoxStatus = async (boxId, isActive) => {
    try {
        const response = await api.put(`/admin/subscription-boxes/${boxId}/status`, { isActive });
        return response.data;
    } catch (error) {
        console.error('Error toggling box status:', error);
        throw error;
    }
};

export const adminDeleteSubscriptionBox = async (boxId) => {
    try {
        const response = await api.delete(`/admin/subscription-boxes/${boxId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting subscription box:', error);
        throw error;
    }
};
