import axios from 'axios';

const api = axios.create({
    baseURL: '/api/v1', // Using a relative URL for proxying
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Interceptor to add the auth token to every request if it exists.
 */
api.interceptors.request.use(
    (config) => {
        let userInfo = null;
        try {
            const raw = localStorage.getItem('userInfo');
            userInfo = raw ? JSON.parse(raw) : null;
        } catch (e) {
            // If parsing fails due to bad value like "undefined", clean it up
            localStorage.removeItem('userInfo');
            userInfo = null;
        }

        if (userInfo && userInfo.accessToken) {
            config.headers['Authorization'] = `Bearer ${userInfo.accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;

// ---------------- Response interceptor: auto refresh and retry on 401 ----------------
let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
    refreshSubscribers.push(cb);
}

function onRrefreshed(newToken) {
    refreshSubscribers.forEach((cb) => cb(newToken));
    refreshSubscribers = [];
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config || {};
        const status = error?.response?.status;

        // Avoid infinite loop for refresh/login endpoints
        const isAuthEndpoint = originalRequest.url?.includes('/users/login') || originalRequest.url?.includes('/users/refresh-token') || originalRequest.url?.includes('/users/logout');

        if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
            originalRequest._retry = true;

            if (!isRefreshing) {
                isRefreshing = true;
                try {
                    const { data } = await api.post('/users/refresh-token');
                    const newAccessToken = data?.accessToken;

                    // Update localStorage
                    try {
                        const raw = localStorage.getItem('userInfo');
                        const userInfo = raw ? JSON.parse(raw) : {};
                        userInfo.accessToken = newAccessToken;
                        localStorage.setItem('userInfo', JSON.stringify(userInfo));
                    } catch {
                        // ignore storage errors
                    }

                    onRrefreshed(newAccessToken);
                    isRefreshing = false;
                } catch (refreshErr) {
                    isRefreshing = false;
                    // Clear invalid session
                    localStorage.removeItem('userInfo');
                    return Promise.reject(refreshErr);
                }
            }

            // Queue the original request until refresh completes
            return new Promise((resolve) => {
                subscribeTokenRefresh((newToken) => {
                    // Attach the new token and retry
                    originalRequest.headers = originalRequest.headers || {};
                    originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                    resolve(api(originalRequest));
                });
            });
        }

        return Promise.reject(error);
    }
);
