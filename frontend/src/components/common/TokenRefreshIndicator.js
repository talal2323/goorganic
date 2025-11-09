'use client'

import React, { useState, useEffect } from 'react';

let globalSetRefreshing = null;

// Global function to control loading state from api.js
export const setTokenRefreshing = (isRefreshing) => {
    if (globalSetRefreshing) {
        globalSetRefreshing(isRefreshing);
    }
};

const TokenRefreshIndicator = () => {
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        globalSetRefreshing = setIsRefreshing;
        return () => {
            globalSetRefreshing = null;
        };
    }, []);

    if (!isRefreshing) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-blue-500 text-white px-4 py-2 text-center text-sm shadow-lg">
            <div className="flex items-center justify-center space-x-2">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Refreshing session...</span>
            </div>
        </div>
    );
};

export default TokenRefreshIndicator;
