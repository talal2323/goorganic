import api from './api';

/**
 * Get the current user's cart
 * @returns {Promise} Cart data with populated items
 */
export const getCart = async () => {
    try {
        const response = await api.get('/cart');
        return response.data;
    } catch (error) {
        console.error('Error fetching cart:', error);
        throw error;
    }
};

/**
 * Add or update an item in the cart
 * @param {string} productId - The product ID to add
 * @param {number} quantity - The quantity to set
 * @returns {Promise} Updated cart data
 */
export const addToCart = async (productId, quantity) => {
    try {
        const response = await api.post('/cart', {
            productId,
            quantity
        });
        return response.data;
    } catch (error) {
        console.error('Error adding to cart:', error);
        throw error;
    }
};

/**
 * Remove an item from the cart
 * @param {string} productId - The product ID to remove
 * @returns {Promise} Updated cart data
 */
export const removeFromCart = async (productId) => {
    try {
        const response = await api.delete(`/cart/${productId}`);
        return response.data;
    } catch (error) {
        console.error('Error removing from cart:', error);
        throw error;
    }
};
