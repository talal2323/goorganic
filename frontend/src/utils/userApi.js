import api from './api';

/**
 * Register a new customer
 * @param {Object} userData - User registration data
 * @returns {Promise} Registration result with user and token
 */
export const registerCustomer = async (userData) => {
    try {
        const response = await api.post('/users/register-customer', userData);
        return response.data;
    } catch (error) {
        console.error('Error registering customer:', error);
        throw error;
    }
};

/**
 * Login user
 * @param {Object} credentials - Email and password
 * @returns {Promise} Login result with user and token
 */
export const login = async (credentials) => {
    try {
        const response = await api.post('/users/login', credentials);
        return response.data;
    } catch (error) {
        console.error('Error logging in:', error);
        throw error;
    }
};

/**
 * Logout user
 * @returns {Promise} Logout result
 */
export const logout = async () => {
    try {
        const response = await api.post('/users/logout');
        return response.data;
    } catch (error) {
        console.error('Error logging out:', error);
        throw error;
    }
};

/**
 * Get current user profile
 * @returns {Promise} User profile data
 */
export const getProfile = async () => {
    try {
        const response = await api.get('/users/profile');
        return response.data;
    } catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
    }
};

/**
 * Update user profile
 * @param {Object} userData - Updated user data
 * @returns {Promise} Updated user profile
 */
export const updateProfile = async (userData) => {
    try {
        const response = await api.put('/users/profile', userData);
        return response.data;
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
};

/**
 * Request password reset
 * @param {string} email - User email
 * @returns {Promise} Password reset request result
 */
export const forgotPassword = async (email) => {
    try {
        const response = await api.post('/users/forgot-password', { email });
        return response.data;
    } catch (error) {
        console.error('Error requesting password reset:', error);
        throw error;
    }
};

/**
 * Reset password with token
 * @param {string} token - Reset token
 * @param {string} password - New password
 * @returns {Promise} Password reset result
 */
export const resetPassword = async (token, password) => {
    try {
        const response = await api.put(`/users/reset-password/${token}`, { password });
        return response.data;
    } catch (error) {
        console.error('Error resetting password:', error);
        throw error;
    }
};

/**
 * Verify email with OTP
 * @param {string} otp - OTP code
 * @param {string} userId - User ID
 * @returns {Promise} Verification result
 */
export const verifyEmail = async (otp, userId) => {
    try {
        const response = await api.post('/users/verify-email', { otp, userId });
        return response.data;
    } catch (error) {
        console.error('Error verifying email:', error);
        throw error;
    }
};

/**
 * Change user password
 * @param {Object} passwordData - Current and new password
 * @returns {Promise} Password change result
 */
export const changePassword = async (passwordData) => {
    try {
        const response = await api.put('/users/profile/change-password', passwordData);
        return response.data;
    } catch (error) {
        console.error('Error changing password:', error);
        throw error;
    }
};

/**
 * Get featured vendors
 * @returns {Promise} Featured vendors array
 */
export const getFeaturedVendors = async () => {
    try {
        const response = await api.get('/users/featured-vendors');
        return response.data;
    } catch (error) {
        console.error('Error fetching featured vendors:', error);
        throw error;
    }
};

/**
 * Get all vendors with pagination
 * @param {number} page - Page number
 * @returns {Promise} Vendors data with pagination
 */
export const getVendorsWithPagination = async (page = 1) => {
    try {
        const response = await api.get(`/users/vendors?page=${page}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching vendors:', error);
        throw error;
    }
};

/**
 * Get vendor by ID (user route)
 * @param {string} vendorId - Vendor ID
 * @returns {Promise} Vendor data
 */
export const getVendorByIdUser = async (vendorId) => {
    try {
        const response = await api.get(`/users/vendors/${vendorId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching vendor:', error);
        throw error;
    }
};

/**
 * Get deletion requests (Admin only)
 * @returns {Promise} Array of deletion requests
 */
export const getDeletionRequests = async () => {
    try {
        const response = await api.get('/admin/deletion-requests');
        return response.data;
    } catch (error) {
        console.error('Error fetching deletion requests:', error);
        throw error;
    }
};

/**
 * Approve deletion request (Admin only)
 * @param {string} userId - User ID
 * @returns {Promise} Approval result
 */
export const approveDeletion = async (userId) => {
    try {
        const response = await api.put(`/admin/users/${userId}/approve-deletion`);
        return response.data;
    } catch (error) {
        console.error('Error approving deletion:', error);
        throw error;
    }
};

/**
 * Reject deletion request (Admin only)
 * @param {string} userId - User ID
 * @param {string} rejectionReason - Reason for rejection
 * @returns {Promise} Rejection result
 */
export const rejectDeletion = async (userId, rejectionReason) => {
    try {
        const response = await api.put(`/admin/users/${userId}/reject-deletion`, { rejectionReason });
        return response.data;
    } catch (error) {
        console.error('Error rejecting deletion:', error);
        throw error;
    }
};

/**
 * Get all customers (Admin only)
 * @returns {Promise} Customers array
 */
export const getAllCustomers = async () => {
    try {
        const response = await api.get('/admin/customers');
        return response.data;
    } catch (error) {
        console.error('Error fetching customers:', error);
        throw error;
    }
};

/**
 * Request account deletion
 * @param {string} reason - Deletion reason
 * @returns {Promise} Deletion request result
 */
export const requestAccountDeletion = async (reason) => {
    try {
        const response = await api.post('/users/request-deletion', { reason });
        return response.data;
    } catch (error) {
        console.error('Error requesting account deletion:', error);
        throw error;
    }
};

/**
 * Get all saved addresses
 * @returns {Promise} Array of saved addresses
 */
export const getAddresses = async () => {
    try {
        const response = await api.get('/users/profile/addresses');
        return response.data;
    } catch (error) {
        console.error('Error fetching addresses:', error);
        throw error;
    }
};

/**
 * Add a new saved address
 * @param {Object} addressData - Address details
 * @returns {Promise} Address creation result
 */
export const addAddress = async (addressData) => {
    try {
        const response = await api.post('/users/profile/addresses', addressData);
        return response.data;
    } catch (error) {
        console.error('Error adding address:', error);
        throw error;
    }
};

/**
 * Update a saved address
 * @param {string} addressId - Address ID
 * @param {Object} addressData - Updated address details
 * @returns {Promise} Address update result
 */
export const updateAddress = async (addressId, addressData) => {
    try {
        const response = await api.put(`/users/profile/addresses/${addressId}`, addressData);
        return response.data;
    } catch (error) {
        console.error('Error updating address:', error);
        throw error;
    }
};

/**
 * Delete a saved address
 * @param {string} addressId - Address ID
 * @returns {Promise} Address deletion result
 */
export const deleteAddress = async (addressId) => {
    try {
        const response = await api.delete(`/users/profile/addresses/${addressId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting address:', error);
        throw error;
    }
};

/**
 * Set an address as default
 * @param {string} addressId - Address ID
 * @returns {Promise} Set default result
 */
export const setDefaultAddress = async (addressId) => {
    try {
        const response = await api.put(`/users/profile/addresses/${addressId}/set-default`);
        return response.data;
    } catch (error) {
        console.error('Error setting default address:', error);
        throw error;
    }
};

/**
 * Suspend a user (Admin only)
 * @param {string} userId - User ID to suspend
 * @param {string} reason - Reason for suspension
 * @returns {Promise} Suspension result
 */
export const suspendUser = async (userId, reason) => {
    try {
        const response = await api.put(`/admin/users/${userId}/suspend`, { reason });
        return response.data;
    } catch (error) {
        console.error('Error suspending user:', error);
        throw error;
    }
};

/**
 * Unsuspend a user (Admin only)
 * @param {string} userId - User ID to unsuspend
 * @returns {Promise} Unsuspension result
 */
export const unsuspendUser = async (userId) => {
    try {
        const response = await api.put(`/admin/users/${userId}/unsuspend`);
        return response.data;
    } catch (error) {
        console.error('Error unsuspending user:', error);
        throw error;
    }
};
