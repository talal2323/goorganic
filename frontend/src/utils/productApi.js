import api from './api';

/**
 * Get all products with optional filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {string} params.keyword - Search keyword
 * @param {string} params.category - Category ID
 * @param {string} params.vendor - Vendor ID to filter by
 * @param {number} params.price_min - Minimum price
 * @param {number} params.price_max - Maximum price
 * @returns {Promise} Products data with pagination
 */
export const getProducts = async (params = {}) => {
    try {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page);
        if (params.keyword) queryParams.append('keyword', params.keyword);
        if (params.category) queryParams.append('category', params.category);
        if (params.vendor) queryParams.append('vendor', params.vendor);
        if (params.price_min) queryParams.append('price_min', params.price_min);
        if (params.price_max) queryParams.append('price_max', params.price_max);

        const response = await api.get(`/products?${queryParams.toString()}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
};

/**
 * Get featured products for homepage
 * @returns {Promise} Featured products array
 */
export const getFeaturedProducts = async () => {
    try {
        const response = await api.get('/products/featured');
        return response.data;
    } catch (error) {
        console.error('Error fetching featured products:', error);
        throw error;
    }
};

/**
 * Get a single product by ID
 * @param {string} productId - The product ID
 * @returns {Promise} Product data
 */
export const getProductById = async (productId) => {
    try {
        const response = await api.get(`/products/${productId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching product:', error);
        throw error;
    }
};

/**
 * Create a new product (Vendor only)
 * @param {Object} productData - Product information
 * @returns {Promise} Created product
 */
export const createProduct = async (productData) => {
    try {
        const response = await api.post('/products/new', productData);
        return response.data;
    } catch (error) {
        console.error('Error creating product:', error);
        throw error;
    }
};

/**
 * Update a product (Vendor only)
 * @param {string} productId - The product ID
 * @param {Object} productData - Updated product information
 * @returns {Promise} Updated product
 */
export const updateProduct = async (productId, productData) => {
    try {
        const response = await api.put(`/products/${productId}`, productData);
        return response.data;
    } catch (error) {
        console.error('Error updating product:', error);
        throw error;
    }
};

/**
 * Delete a product (Vendor only)
 * @param {string} productId - The product ID
 * @returns {Promise} Deletion confirmation
 */
export const deleteProduct = async (productId) => {
    try {
        const response = await api.delete(`/products/${productId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
};

/**
 * Get vendor's own products
 * @returns {Promise} Array of vendor's products
 */
export const getMyProducts = async () => {
    try {
        const response = await api.get('/products/my-products');
        return response.data;
    } catch (error) {
        console.error('Error fetching my products:', error);
        throw error;
    }
};

/**
 * Get all products for admin
 * @returns {Promise} All products array
 */
export const getAllProductsAdmin = async (page = 1, keyword = '') => {
    try {
        let url = `/admin/products?page=${page}`;
        if (keyword) {
            url += `&keyword=${encodeURIComponent(keyword)}`;
        }
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching all products:', error);
        throw error;
    }
};

/**
 * Update product status (Admin only)
 * @param {string} productId - The product ID
 * @param {string} status - New status
 * @returns {Promise} Updated product
 */
export const updateProductStatus = async (productId, status, reason = '') => {
    try {
        const response = await api.put(`/admin/products/${productId}/status`, { status, reason });
        return response.data;
    } catch (error) {
        console.error('Error updating product status:', error);
        throw error;
    }
};
