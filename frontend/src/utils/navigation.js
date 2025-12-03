'use client'

import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';

/**
 * Custom hook to replace the old dispatch({ type: 'SET_PAGE' }) pattern
 * Provides Next.js router navigation with auth-aware redirects
 */
export const useNavigation = () => {
    const router = useRouter();
    const { state } = useAppContext();

    const navigate = (destination) => {
        // Map old page names to new routes
        const routeMap = {
            // Public routes
            'Home': '/',
            'Shop': '/shop',
            'About': '/about',
            'Contact': '/contact',
            'PrivacyPolicy': '/privacy',
            'TermsConditions': '/privacy',
            'Profile': '/profile',
            'OrderHistory': '/orders',
            'Checkout': '/checkout',
            'OrderConfirmation': '/order-confirmation',
            'Vendors': '/vendors',
            'VendorList': '/vendors',
            'VendorDetail': '/vendors', // needs dynamic ID
            'ProductDetail': '/products', // needs dynamic ID
            'Notifications': '/notifications',
            'Blog': '/blog',

            // Auth routes
            'Login': '/auth/login',
            'Register': '/auth/register',
            'VendorRegister': '/auth/vendor-register',
            'OTPVerification': '/auth/otp',
            'ForgotPassword': '/auth/forgot-password',
            'ResetPassword': '/auth/reset-password',

            // Vendor routes
            'VendorDashboard': '/vendor',
            'VendorOrders': '/vendor/orders',
            'VendorProducts': '/vendor/products',
            'VendorBusinessInfo': '/vendor/business-info',
            'VendorRatingsReviews': '/vendor/reviews',
            'VendorSubscriptions': '/vendor/subscriptions',
            'VendorNotifications': '/vendor/notifications',

            // Admin routes
            'AdminDashboard': '/admin',
            'AdminUsersVendors': '/admin/users-vendors',
            'AdminOrders': '/admin/orders',
            'AdminProductsCategories': '/admin/products-categories',
            'AdminSubscriptionsControl': '/admin/subscriptions',
            'AdminAnalytics': '/admin/analytics',
            'DeletionRequests': '/admin/deletion-requests',
            'Customers': '/admin/customers',
            'CustomersPage': '/admin/customers',
            'Categories': '/admin/categories',
            'CategoriesPage': '/admin/categories',
            'Reviews': '/admin/reviews',
            'ReviewsPage': '/admin/reviews',
            'Disputes': '/admin/disputes',
            'DisputesPage': '/admin/disputes',
            'FAQs': '/admin/faqs',
            'FAQsPage': '/admin/faqs',
        };

        const route = routeMap[destination] || destination;

        // Use router.push for navigation
        router.push(route);
    };

    return { navigate, router };
};

export default useNavigation;
