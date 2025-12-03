/**
 * Cookie management utility functions
 * Provides consistent cookie handling across the application
 */

/**
 * Set a cookie with proper attributes
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {number} maxAge - Max age in seconds (default: 30 days)
 */
export function setCookie(name, value, maxAge = 2592000) {
    const isProduction = process.env.NODE_ENV === 'production';
    const secureFlag = isProduction ? 'Secure;' : '';

    document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax; ${secureFlag}`;
}

/**
 * Delete a cookie by setting it to expire immediately
 * @param {string} name - Cookie name
 */
export function deleteCookie(name) {
    // Set multiple variations to ensure deletion across all scenarios
    const variations = [
        `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0`,
        `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Lax`,
        `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Strict`,
        `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=None; Secure`,
        `${name}=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0`,
        `${name}=; path=/; domain=.${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0`,
    ];

    variations.forEach(cookieString => {
        document.cookie = cookieString;
    });
}

/**
 * Get a cookie value by name
 * @param {string} name - Cookie name
 * @returns {string|null} Cookie value or null if not found
 */
export function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

/**
 * Clear all authentication cookies
 */
export function clearAuthCookies() {
    // Delete standard auth cookies
    deleteCookie('authToken');
    deleteCookie('user');

    // Clear all cookies to ensure no remnants
    const cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
        const cookieName = cookie.split('=')[0].trim();
        // Delete any cookie that's not a Next.js internal cookie
        if (cookieName && !cookieName.startsWith('__next')) {
            deleteCookie(cookieName);
            // Also try with decoded name
            try {
                const decodedName = decodeURIComponent(cookieName);
                if (decodedName !== cookieName) {
                    deleteCookie(decodedName);
                }
            } catch (e) {
                // Ignore decode errors
            }
        }
    });
}
