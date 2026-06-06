import api from './api';

export const createDispute = async (orderId, disputeData) => {
    const { data } = await api.post(`/disputes/orders/${orderId}`, disputeData);
    return data;
};

export const getMyDisputes = async () => {
    const { data } = await api.get('/disputes/my');
    return data;
};

export const getVendorDisputes = async () => {
    const { data } = await api.get('/disputes/vendor');
    return data;
};

export const getAdminDisputes = async () => {
    const { data } = await api.get('/disputes/admin');
    return data;
};

export const updateDisputeStatus = async (disputeId, payload) => {
    const { data } = await api.patch(`/disputes/${disputeId}/status`, payload);
    return data;
};

export const addVendorComment = async (disputeId, vendorComment) => {
    const { data } = await api.patch(`/disputes/${disputeId}/vendor-comment`, { vendorComment });
    return data;
};