import api from './api';

/**
 * Create a new order from the user's cart (Checkout)
 * @param {Object} orderData - Order details
 * @param {Object} orderData.shippingAddress - Shipping address object
 * @param {string} orderData.shippingAddress.address - Complete address
 * @param {string} orderData.shippingAddress.city - City
 * @param {string} orderData.shippingAddress.postalCode - Postal code
 * @param {string} orderData.shippingAddress.country - Country
 * @param {string} orderData.phoneNumber - Phone number for delivery
 * @returns {Promise} Created order data
 */
export const createOrder = async (orderData) => {
    try {
        const response = await api.post('/orders', orderData);
        return response.data;
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
};

/**
 * Get the current customer's order history
 * @returns {Promise} Array of orders
 */
export const getMyOrders = async () => {
    try {
        const response = await api.get('/orders/my-orders');
        return response.data;
    } catch (error) {
        console.error('Error fetching my orders:', error);
        throw error;
    }
};

/**
 * Get all orders (Admin only)
 * @returns {Promise} Array of all orders on the platform
 */
export const getAllOrders = async () => {
    try {
        const response = await api.get('/admin/orders');
        return response.data;
    } catch (error) {
        console.error('Error fetching all orders:', error);
        throw error;
    }
};

/**
 * Get vendor's received orders
 * @returns {Promise} Array of orders for the vendor
 */
export const getVendorOrders = async () => {
    try {
        const response = await api.get('/vendors/orders');
        return response.data;
    } catch (error) {
        console.error('Error fetching vendor orders:', error);
        throw error;
    }
};

/**
 * Get order by ID with sub-orders
 * @param {string} orderId - Order ID
 * @returns {Promise} Order data with sub-orders
 */
export const getOrderById = async (orderId) => {
    try {
        const response = await api.get(`/orders/${orderId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching order:', error);
        throw error;
    }
};

/**
 * Download invoice PDF for an order
 * @param {string} orderId - Order ID
 * @param {string} orderNumber - Order number for filename
 * @returns {Promise} Downloads the PDF file
 */
export const downloadInvoice = async (orderId, orderNumber) => {
    try {
        const response = await api.get(`/orders/${orderId}/invoice`, {
            responseType: 'blob' // Important for downloading files
        });

        // Create a blob URL and trigger download
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `GOorganic-Invoice-${orderNumber || orderId.slice(-8).toUpperCase()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        return true;
    } catch (error) {
        console.error('Error downloading invoice:', error);
        throw error;
    }
};
