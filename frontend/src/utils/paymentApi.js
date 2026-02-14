import api from './api';

// Create a payment intent
export const createPaymentIntent = async (amount, orderId = null) => {
    try {
        const response = await api.post('/payment/create-payment-intent', {
            amount,
            orderId,
        });
        return response.data;
    } catch (error) {
        console.error('Error creating payment intent:', error);
        throw error;
    }
};

// Get payment status
export const getPaymentStatus = async (paymentIntentId) => {
    try {
        const response = await api.get(`/payment/payment-status/${paymentIntentId}`);
        return response.data;
    } catch (error) {
        console.error('Error getting payment status:', error);
        throw error;
    }
};
