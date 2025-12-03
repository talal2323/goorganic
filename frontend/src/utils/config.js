// Color Palette based on Figma designs (Deep Green and Accent Green)
export const COLORS = {
    primary: '#164A26', // Deep Green for header, sidebar, footer
    secondary: '#175017', // Dark Green for buttons, links, verification badges
    background: '#F8F9FA', // Light Gray background
    card: 'white',
    text: '#333333',
};

// Public Pages Navigation
export const publicNavItems = [
    { id: 'Home', label: 'Home' },
    { id: 'Shop', label: 'Shop' },
    { id: 'About', label: 'About Us' },
    { id: 'Contact', label: 'Contact' },
];

// Footer Navigation
export const footerNavItems = [
    {
        section: 'Quick Links', items: [
            { id: 'Home', label: 'Home' },
            { id: 'Shop', label: 'Shop' },
            { id: 'About', label: 'About Us' },
            { id: 'Contact', label: 'Contact' },
        ]
    },
    {
        section: 'Support', items: [
            { id: 'FAQ', label: 'FAQ' },
            { id: 'TrackOrder', label: 'Track Order' },
            { id: 'ShippingPolicy', label: 'Shipping Policy' },
            { id: 'ReturnPolicy', label: 'Return Policy' },
        ]
    },
    {
        section: 'Legal', items: [
            { id: 'PrivacyPolicy', label: 'Privacy Policy' },
            { id: 'TermsConditions', label: 'Terms & Conditions' },
            { id: 'RefundPolicy', label: 'Refund Policy' },
            { id: 'CancellationPolicy', label: 'Cancellation Policy' },
        ]
    },
];

// Navigation Data
export const vendorNavItems = [
    { id: 'VendorDashboard', label: 'Dashboard', href: '/vendor', path: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'VendorOrders', label: 'Orders', href: '/vendor/orders', path: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { id: 'VendorProducts', label: 'Products', href: '/vendor/products', path: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
    { id: 'VendorBusinessInfo', label: 'Business Info', href: '/vendor/business-info', path: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1M9 3v2m-2 4h4' },
    { id: 'VendorRatingsReviews', label: 'Rating & Reviews', href: '/vendor/reviews', path: 'M11.049 2.222a.75.75 0 00-.707 0l-5.385 2.146a.75.75 0 00-.401.678v11.754a.75.75 0 00.401.678l5.385 2.146a.75.75 0 00.707 0l5.385-2.146a.75.75 0 00.401-.678V5.046a.75.75 0 00-.401-.678l-5.385-2.146zM12 18.75V5.25' },
    { id: 'VendorSubscriptions', label: 'Subscriptions', href: '/vendor/subscriptions', path: 'M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
    { id: 'Chat', label: 'Chat', href: '/vendor/chat', path: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.693C5.165 15.908 6.5 15 8 15c4.97 0 9-3.582 9-8s-4.03-8-9-8-9 3.582-9 8h.08a2.5 2.5 0 012.5-2.5 2.5 2.5 0 012.5 2.5V13' },
];

export const adminNavItems = [
    { id: 'AdminDashboard', label: 'Dashboard', href: '/admin', path: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'AdminUsersVendors', label: 'Users & Vendors', href: '/admin/users-vendors', path: 'M17 20h-10a2 2 0 01-2-2v-1a2 2 0 012-2h10a2 2 0 012 2v1a2 2 0 01-2 2zM9 9a3 3 0 106 0 3 3 0 00-6 0z' },
    { id: 'AdminOrders', label: 'Orders', href: '/admin/orders', path: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { id: 'AdminProductsCategories', label: 'Products & Categories', href: '/admin/products-categories', path: 'M5 8h14M5 12h14M5 16h14M12 3v18' },
    { id: 'DeletionRequests', label: 'Deletion Requests', href: '/admin/deletion-requests', path: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' },
    { id: 'AdminSubscriptionsControl', label: 'Subscriptions', href: '/admin/subscriptions', path: 'M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
    { id: 'AdminAnalytics', label: 'Analytics', href: '/admin/analytics', path: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
    { id: 'Chat', label: 'Chat', href: '/admin/chat', path: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.693C5.165 15.908 6.5 15 8 15c4.97 0 9-3.582 9-8s-4.03-8-9-8-9 3.582-9 8h.08a2.5 2.5 0 012.5-2.5 2.5 2.5 0 012.5 2.5V13' },
];
