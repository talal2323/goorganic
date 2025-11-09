import React from 'react';

// src/config/utils.js
// Centralized small utilities: COLORS and lightweight Icon component + icon path constants

export const COLORS = {
    primary: '#175017',
    primaryDark: '#0d2f0d',
    accent: '#e6efe6',
    text: '#1f2937',
    muted: '#6b7280'
};

// Common SVG path strings that can be reused by Icon
export const BELL_ICON_PATH = "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9";
export const ORDERS_ICON_PATH = "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m5-9v9m4-9v9m5 0h-2";

export const ICON_PATHS = {
    bell: BELL_ICON_PATH,
    orders: ORDERS_ICON_PATH
};

// Lightweight Icon component using path constants above

export const Icon = ({ name, className = 'h-5 w-5', stroke = 'currentColor' }) => {
    const path = ICON_PATHS[name];
    if (!path) return null;
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke={stroke}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
        </svg>
    );
};

export default Icon;
