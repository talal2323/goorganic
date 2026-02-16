import api from './api';

/**
 * Get available subscription plans
 * @returns {Promise} Array of subscription plans
 */
export const getSubscriptionPlans = async () => {
    try {
        const response = await api.get('/vendors/subscriptions/plans');
        return response.data;
    } catch (error) {
        console.error('Error fetching subscription plans:', error);
        throw error;
    }
};

/**
 * Get vendor's subscription usage
 * @returns {Promise} Subscription usage data
 */
export const getSubscriptionUsage = async () => {
    try {
        const response = await api.get('/vendors/profile/subscription-usage');
        return response.data;
    } catch (error) {
        console.error('Error fetching subscription usage:', error);
        throw error;
    }
};

/**
 * Create Stripe checkout session for subscription
 * @param {string} planName - Target subscription plan name
 * @returns {Promise} Checkout URL
 */
export const createSubscriptionCheckout = async (planName) => {
    try {
        const response = await api.post('/vendors/subscriptions/create-checkout', { planName });
        return response.data;
    } catch (error) {
        console.error('Error creating subscription checkout:', error);
        throw error;
    }
};

/**
 * Verify subscription session after payment
 * @param {string} sessionId - Stripe session ID
 * @returns {Promise} Verification result
 */
export const verifySubscriptionSession = async (sessionId) => {
    try {
        const response = await api.get(`/vendors/subscriptions/verify-session/${sessionId}`);
        return response.data;
    } catch (error) {
        console.error('Error verifying subscription session:', error);
        throw error;
    }
};

/**
 * Cancel Stripe subscription (downgrades to free plan)
 * @returns {Promise} Cancellation result
 */
export const cancelStripeSubscription = async () => {
    try {
        const response = await api.post('/vendors/subscriptions/cancel-stripe');
        return response.data;
    } catch (error) {
        console.error('Error cancelling Stripe subscription:', error);
        throw error;
    }
};

/**
 * Get all subscription plans (Admin only)
 * @returns {Promise} Array of all subscription plans
 */
export const getAllSubscriptionPlans = async () => {
    try {
        const response = await api.get('/admin/subscriptions');
        return response.data;
    } catch (error) {
        console.error('Error fetching all subscription plans:', error);
        throw error;
    }
};

/**
 * Create subscription plan (Admin only)
 * @param {Object} planData - Subscription plan data
 * @returns {Promise} Created subscription plan
 */
export const createSubscriptionPlan = async (planData) => {
    try {
        const response = await api.post('/admin/subscriptions', planData);
        return response.data;
    } catch (error) {
        console.error('Error creating subscription plan:', error);
        throw error;
    }
};

/**
 * Update subscription plan (Admin only)
 * @param {string} planId - Subscription plan ID
 * @param {Object} planData - Updated plan data
 * @returns {Promise} Updated subscription plan
 */
export const updateSubscriptionPlan = async (planId, planData) => {
    try {
        const response = await api.put(`/admin/subscriptions/${planId}`, planData);
        return response.data;
    } catch (error) {
        console.error('Error updating subscription plan:', error);
        throw error;
    }
};

/**
 * Delete subscription plan (Admin only)
 * @param {string} planId - Subscription plan ID
 * @returns {Promise} Deletion result
 */
export const deleteSubscriptionPlan = async (planId) => {
    try {
        const response = await api.delete(`/admin/subscriptions/${planId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting subscription plan:', error);
        throw error;
    }
};
