import api from './api';

export const getAdminDashboardStats = async () => {
    try {
        const response = await api.get('/admin/dashboard/stats');
        return response.data;
    } catch (error) {
        console.error('Error fetching admin dashboard stats:', error);
        throw error;
    }
};

export const getAdminAnalyticsOverview = async () => {
    try {
        const response = await api.get('/admin/analytics/overview');
        return response.data;
    } catch (error) {
        console.error('Error fetching admin analytics overview:', error);
        throw error;
    }
};

export const updateDisputeStatus = async (disputeId, status, resolutionNotes, refundPoints) => {
    try {
        const response = await api.patch(`/disputes/${disputeId}/status`, {
            status,
            resolutionNotes,
            refundPoints
        });
        return response.data;
    } catch (error) {
        console.error('Error updating dispute status:', error);
        throw error;
    }
};