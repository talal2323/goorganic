import api from './api';

export const startConversation = async (vendorId) => {
    const { data } = await api.post('/chat/conversations/start', { vendorId });
    return data.conversation;
};

export const getConversations = async () => {
    const { data } = await api.get('/chat/conversations');
    return data.conversations || [];
};

export const getConversationMessages = async (conversationId, params = {}) => {
    const { data } = await api.get(`/chat/conversations/${conversationId}/messages`, { params });
    return data;
};

export const sendConversationMessage = async ({ conversationId, messageText }) => {
    const { data } = await api.post('/chat/messages', { conversationId, messageText });
    return data;
};

export const markConversationRead = async (conversationId) => {
    const { data } = await api.put(`/chat/conversations/${conversationId}/read`);
    return data;
};

export const getAdminConversations = async (params = {}) => {
    const { data } = await api.get('/chat/admin/conversations', { params });
    return data;
};

export const getAdminConversationMessages = async (conversationId, params = {}) => {
    const { data } = await api.get(`/chat/admin/conversations/${conversationId}/messages`, { params });
    return data;
};
