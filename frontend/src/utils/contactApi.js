import api from './api';

/**
 * Send contact form message to admins
 * @param {Object} contactData - Contact form data
 * @param {string} contactData.name - Sender's name
 * @param {string} contactData.email - Sender's email
 * @param {string} contactData.subject - Message subject
 * @param {string} contactData.message - Message content
 * @returns {Promise} Response message
 */
export const sendContactMessage = async (contactData) => {
    try {
        const response = await api.post('/contact', contactData);
        return response.data;
    } catch (error) {
        console.error('Error sending contact message:', error);
        throw error;
    }
};
