import api from './api';

/**
 * Get all notifications for the logged-in user
 * @returns {Promise} Object with notifications array and unreadCount
 */
export const getNotifications = async () => {
    try {
        const response = await api.get('/notifications');
        return response.data;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
};

/**
 * Mark a specific notification as read
 * @param {string} notificationId - The notification ID
 * @returns {Promise} Response data
 */
export const markNotificationAsRead = async (notificationId) => {
    try {
        const response = await api.put(`/notifications/${notificationId}/read`);
        return response.data;
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
};

/**
 * Mark all notifications as read
 * @returns {Promise} Response data
 */
export const markAllNotificationsAsRead = async () => {
    try {
        const response = await api.put('/notifications/read-all');
        return response.data;
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
    }
};

/**
 * Delete a specific notification
 * @param {string} notificationId - The notification ID
 * @returns {Promise} Response data
 */
export const deleteNotification = async (notificationId) => {
    try {
        const response = await api.delete(`/notifications/${notificationId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting notification:', error);
        throw error;
    }
};

/**
 * Delete all notifications
 * @returns {Promise} Response data
 */
export const deleteAllNotifications = async () => {
    try {
        const response = await api.delete('/notifications/all');
        return response.data;
    } catch (error) {
        console.error('Error deleting all notifications:', error);
        throw error;
    }
};
