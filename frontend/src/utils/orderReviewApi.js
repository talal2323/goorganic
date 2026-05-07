'use client'

import api from './api';

// Get reviews for a specific product (public)
export const getProductReviews = async (productId) => {
    const { data } = await api.get(`/reviews/products/${productId}`);
    return data;
};

// Check if customer can review an order
export const getOrderReviewEligibility = async (orderId) => {
    const { data } = await api.get(`/reviews/orders/${orderId}/eligibility`);
    return data;
};

// Submit order review with per-product ratings
export const createOrderReview = async (orderId, reviewData) => {
    const { data } = await api.post(`/reviews/orders/${orderId}`, reviewData);
    return data;
};

// Update an order review
export const updateOrderReview = async (reviewId, reviewData) => {
    const { data } = await api.put(`/reviews/${reviewId}`, reviewData);
    return data;
};

// Delete an order review (or specific item from review)
export const deleteOrderReview = async (reviewId, productId) => {
    const params = productId ? { productId } : {};
    const { data } = await api.delete(`/reviews/${reviewId}`, { params });
    return data;
};

// Get reviews for vendor's products
export const getVendorOrderReviews = async () => {
    const { data } = await api.get('/reviews/vendors/me');
    return data;
};

// Get all reviews for admin dashboard
export const getAdminOrderReviews = async (params = {}) => {
    const { data } = await api.get('/reviews/admin', { params });
    return data;
};

// Update review status (admin only)
export const updateOrderReviewStatus = async (reviewId, status, hiddenReason) => {
    const { data } = await api.patch(`/reviews/${reviewId}/status`, {
        status,
        hiddenReason,
    });
    return data;
};
