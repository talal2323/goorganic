import api from './api';

/**
 * Get all categories
 * @returns {Promise} Categories array
 */
export const getCategories = async () => {
    try {
        const response = await api.get('/categories');
        return response.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

/**
 * Get a single category by ID
 * @param {string} categoryId - The category ID
 * @returns {Promise} Category data
 */
export const getCategoryById = async (categoryId) => {
    try {
        const response = await api.get(`/categories/${categoryId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching category:', error);
        throw error;
    }
};

/**
 * Create a new category (Admin only)
 * @param {Object} categoryData - Category information
 * @returns {Promise} Created category
 */
export const createCategory = async (categoryData) => {
    try {
        const response = await api.post('/categories', categoryData);
        return response.data;
    } catch (error) {
        console.error('Error creating category:', error);
        throw error;
    }
};

/**
 * Update a category (Admin only)
 * @param {string} categoryId - The category ID
 * @param {Object} categoryData - Updated category information
 * @returns {Promise} Updated category
 */
export const updateCategory = async (categoryId, categoryData) => {
    try {
        const response = await api.put(`/categories/${categoryId}`, categoryData);
        return response.data;
    } catch (error) {
        console.error('Error updating category:', error);
        throw error;
    }
};

/**
 * Delete a category (Admin only)
 * @param {string} categoryId - The category ID
 * @returns {Promise} Deletion confirmation
 */
export const deleteCategory = async (categoryId) => {
    try {
        const response = await api.delete(`/categories/${categoryId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting category:', error);
        throw error;
    }
};
