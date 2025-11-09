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

                // Show loading indicator
                if (typeof window !== 'undefined') {
                    try {
                        const { setTokenRefreshing } = await import('@/components/common/TokenRefreshIndicator');
                        setTokenRefreshing(true);
                    } catch { }
                }

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

                    // Hide loading indicator
                    if (typeof window !== 'undefined') {
                        try {
                            const { setTokenRefreshing } = await import('@/components/common/TokenRefreshIndicator');
                            setTokenRefreshing(false);
                        } catch { }
                    }
                } catch (refreshErr) {
                    isRefreshing = false;

                    // Hide loading indicator
                    if (typeof window !== 'undefined') {
                        try {
                            const { setTokenRefreshing } = await import('@/components/common/TokenRefreshIndicator');
                            setTokenRefreshing(false);
                        } catch { }
                    }

                    // Clear invalid session and notify app to logout
                    try {
                        localStorage.removeItem('userInfo');
                    } catch { }

                    // Dispatch custom event for global logout handling
                    if (typeof window !== 'undefined' && window.dispatchEvent) {
                        window.dispatchEvent(new CustomEvent('goorganic:unauthorized', {
                            detail: { error: refreshErr }
                        }));
                    }
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
