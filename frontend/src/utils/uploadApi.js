import api from './api';

/**
 * Upload avatar image
 * @param {FormData} formData - FormData with avatar file
 * @returns {Promise} Upload result with URL
 */
export const uploadAvatar = async (formData) => {
    try {
        const response = await api.post('/upload/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        console.error('Error uploading avatar:', error);
        throw error;
    }
};

/**
 * Upload product image
 * @param {FormData} formData - FormData with product image
 * @returns {Promise} Upload result with URL
 */
export const uploadProductImage = async (formData) => {
    try {
        const response = await api.post('/upload/product', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        console.error('Error uploading product image:', error);
        throw error;
    }
};

/**
 * Upload certification document
 * @param {FormData} formData - FormData with certification file
 * @returns {Promise} Upload result with URL
 */
export const uploadCertification = async (formData) => {
    try {
        const response = await api.post('/upload/certification', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        console.error('Error uploading certification:', error);
        throw error;
    }
};

/**
 * Upload shop image
 * @param {FormData} formData - FormData with shop image
 * @returns {Promise} Upload result with URL
 */
export const uploadShopImage = async (formData) => {
    try {
        const response = await api.post('/upload/shop-image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        console.error('Error uploading shop image:', error);
        throw error;
    }
};

/**
 * Upload CNIC image (front or back)
 * @param {string} side - 'front' or 'back'
 * @param {FormData} formData - FormData with CNIC image
 * @returns {Promise} Upload result with URL
 */
export const uploadCnic = async (side, formData) => {
    try {
        const response = await api.post(`/upload/cnic/${side}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        console.error('Error uploading CNIC:', error);
        throw error;
    }
};
