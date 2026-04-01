import { io } from 'socket.io-client';

let socketInstance = null;

const getApiOrigin = () => {
    if (typeof window === 'undefined') {
        return '';
    }

    const configured = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
    if (configured) {
        return configured;
    }

    const { protocol, hostname } = window.location;
    const port = process.env.NEXT_PUBLIC_API_PORT || '5000';
    return `${protocol}//${hostname}:${port}`;
};

export const connectChatSocket = (token) => {
    if (!token) {
        return null;
    }

    if (socketInstance?.connected) {
        return socketInstance;
    }

    if (!socketInstance) {
        socketInstance = io(getApiOrigin(), {
            transports: ['websocket', 'polling'],
            autoConnect: false,
            auth: {
                token
            }
        });
    } else {
        socketInstance.auth = { token };
    }

    if (!socketInstance.connected) {
        socketInstance.connect();
    }

    return socketInstance;
};

export const getChatSocket = () => socketInstance;

export const disconnectChatSocket = () => {
    if (!socketInstance) {
        return;
    }

    socketInstance.disconnect();
    socketInstance = null;
};
