import api from './api';

/**
 * Get all approved vendors
 * @returns {Promise} Vendors array
 */
export const getVendors = async () => {
    try {
        const response = await api.get('/vendors');
        return response.data;
    } catch (error) {
        console.error('Error fetching vendors:', error);
        throw error;
    }
};

/**
 * Get a single vendor by ID
 * @param {string} vendorId - The vendor ID
 * @returns {Promise} Vendor data
 */
export const getVendorById = async (vendorId) => {
    try {
        const response = await api.get(`/vendors/${vendorId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching vendor:', error);
        throw error;
    }
};

/**
 * Get vendor statistics (Vendor only)
 * @returns {Promise} Vendor dashboard stats
 */
export const getVendorStats = async () => {
    try {
        const response = await api.get('/vendors/dashboard/stats');
        return response.data;
    } catch (error) {
        console.error('Error fetching vendor stats:', error);
        throw error;
    }
};

/**
 * Get sales overview (Vendor only)
 * @returns {Promise} Sales data
 */
export const getSalesOverview = async () => {
    try {
        const response = await api.get('/vendors/dashboard/sales-overview');
        return response.data;
    } catch (error) {
        console.error('Error fetching sales overview:', error);
        throw error;
    }
};

/**
 * Get recent activity (Vendor only)
 * @returns {Promise} Recent activity data
 */
export const getRecentActivity = async () => {
    try {
        const response = await api.get('/vendors/dashboard/activity');
        return response.data;
    } catch (error) {
        console.error('Error fetching recent activity:', error);
        throw error;
    }
};

/**
 * Register as a vendor
 * @param {Object} vendorData - Vendor registration information
 * @returns {Promise} Registration result
 */
export const registerVendor = async (vendorData) => {
    try {
        const response = await api.post('/vendors/register', vendorData);
        return response.data;
    } catch (error) {
        console.error('Error registering vendor:', error);
        throw error;
    }
};

/**
 * Get all vendors for admin
 * @returns {Promise} All vendors array
 */
export const getAllVendorsAdmin = async () => {
    try {
        const response = await api.get('/admin/vendors');
        return response.data;
    } catch (error) {
        console.error('Error fetching all vendors:', error);
        throw error;
    }
};

/**
 * Approve a vendor (Admin only)
 * @param {string} vendorId - The vendor ID
 * @returns {Promise} Approval result
 */
export const approveVendor = async (vendorId) => {
    try {
        const response = await api.put(`/admin/vendors/${vendorId}/approve`);
        return response.data;
    } catch (error) {
        console.error('Error approving vendor:', error);
        throw error;
    }
};

/**
 * Reject a vendor (Admin only)
 * @param {string} vendorId - The vendor ID
 * @param {string} reason - Rejection reason
 * @returns {Promise} Rejection result
 */
export const rejectVendor = async (vendorId, reason) => {
    try {
        const response = await api.put(`/admin/vendors/${vendorId}/reject`, { reason });
        return response.data;
    } catch (error) {
        console.error('Error rejecting vendor:', error);
        throw error;
    }
};

/**
 * Upgrade vendor subscription (Admin only)
 * @param {string} vendorId - The vendor ID
 * @param {string} planName - New subscription plan name
 * @returns {Promise} Upgrade result
 */
export const upgradeVendorSubscription = async (vendorId, planName) => {
    try {
        const response = await api.put(`/admin/vendors/${vendorId}/upgrade`, { planName });
        return response.data;
    } catch (error) {
        console.error('Error upgrading vendor subscription:', error);
        throw error;
    }
};

/**
 * Add certification to vendor profile
 * @param {Object} certificationData - Certification data with url and publicId
 * @returns {Promise} Result
 */
export const addCertification = async (certificationData) => {
    try {
        const response = await api.post('/vendors/profile/certifications', certificationData);
        return response.data;
    } catch (error) {
        console.error('Error adding certification:', error);
        throw error;
    }
};

/**
 * Delete certification from vendor profile
 * @param {string} certId - Certification ID
 * @returns {Promise} Deletion result
 */
export const deleteCertification = async (certId) => {
    try {
        const response = await api.delete(`/vendors/profile/certifications/${certId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting certification:', error);
        throw error;
    }
};

/**
 * Add shop image to vendor profile
 * @param {Object} imageData - Image data with url and publicId
 * @returns {Promise} Result
 */
export const addShopImage = async (imageData) => {
    try {
        const response = await api.post('/vendors/profile/shop-images', imageData);
        return response.data;
    } catch (error) {
        console.error('Error adding shop image:', error);
        throw error;
    }
};

/**
 * Delete shop image from vendor profile
 * @param {string} imgId - Image ID
 * @returns {Promise} Deletion result
 */
export const deleteShopImage = async (imgId) => {
    try {
        const response = await api.delete(`/vendors/profile/shop-images/${imgId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting shop image:', error);
        throw error;
    }
};

/**
 * Update order status (Vendor only)
 * @param {string} orderId - The order ID
 * @param {string} status - New order status
 * @returns {Promise} Update result
 */
export const updateOrderStatus = async (orderId, status) => {
    try {
        const response = await api.put(`/vendors/orders/${orderId}/status`, { status });
        return response.data;
    } catch (error) {
        console.error('Error updating order status:', error);
        throw error;
    }
};

/**
 * Accept order (Vendor only)
 * @param {string} orderId - The order ID
 * @returns {Promise} Accept result
 */
export const acceptOrder = async (orderId) => {
    try {
        const response = await api.put(`/vendors/orders/${orderId}/accept`);
        return response.data;
    } catch (error) {
        console.error('Error accepting order:', error);
        throw error;
    }
};

/**
 * Cancel order (Vendor only)
 * @param {string} orderId - The order ID
 * @param {string} reason - Cancellation reason
 * @returns {Promise} Cancel result
 */
export const cancelOrder = async (orderId, reason) => {
    try {
        const response = await api.put(`/vendors/orders/${orderId}/cancel`, { reason });
        return response.data;
    } catch (error) {
        console.error('Error cancelling order:', error);
        throw error;
    }
};
