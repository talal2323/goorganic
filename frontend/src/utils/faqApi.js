import api from './api';

/**
 * Get all FAQs
 * @returns {Promise} Array of FAQs
 */
export const getAllFAQs = async () => {
    try {
        const response = await api.get('/faqs');
        return response.data;
    } catch (error) {
        console.error('Error fetching FAQs:', error);
        throw error;
    }
};

/**
 * Create a new FAQ (Admin only)
 * @param {Object} faqData - FAQ data with question and answer
 * @returns {Promise} Created FAQ
 */
export const createFAQ = async (faqData) => {
    try {
        const response = await api.post('/faqs', faqData);
        return response.data;
    } catch (error) {
        console.error('Error creating FAQ:', error);
        throw error;
    }
};

/**
 * Update an FAQ (Admin only)
 * @param {string} faqId - The FAQ ID
 * @param {Object} faqData - Updated FAQ data
 * @returns {Promise} Updated FAQ
 */
export const updateFAQ = async (faqId, faqData) => {
    try {
        const response = await api.put(`/faqs/${faqId}`, faqData);
        return response.data;
    } catch (error) {
        console.error('Error updating FAQ:', error);
        throw error;
    }
};

/**
 * Delete an FAQ (Admin only)
 * @param {string} faqId - The FAQ ID
 * @returns {Promise} Deletion result
 */
export const deleteFAQ = async (faqId) => {
    try {
        const response = await api.delete(`/faqs/${faqId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting FAQ:', error);
        throw error;
    }
};
