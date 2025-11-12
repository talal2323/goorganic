'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react';

const initialState = {
    page: 'Home', // Current page view
    userRole: 'guest', // guest | customer | vendor | admin
    vendorRegStep: 1, // For multi-step registration
    isLoggedIn: false,
    user: null, // Authenticated user profile data
    returnPath: null, // For redirecting after login (e.g., Profile, OrderHistory)
    selectedVendor: null, // Selected vendor for detail view
    selectedProduct: null, // Selected product for detail view
    vendors: [], // List of vendors
    // Shopping cart state
    cartItems: [], // { id, name, price, qty }
    isCartOpen: false,
};

const stateReducer = (state, action) => {
    switch (action.type) {
        case 'SET_PAGE':
            // Prevent navigating to auth pages if already logged in
            if (state.isLoggedIn && ['Login', 'Register', 'VendorRegister', 'OTPVerification'].includes(action.payload)) {
                return state; // ignore
            }
            return { ...state, page: action.payload };
        case 'SET_USER_ROLE':
            return { ...state, userRole: action.payload, isLoggedIn: action.payload !== 'guest' };
        case 'LOGIN': {
            // The payload from the API is the normalized user object with roles[] and accessToken
            const user = action.payload || {};
            const roles = Array.isArray(user.roles) ? user.roles : [];
            const primaryRole = roles.includes('admin') ? 'admin' : roles.includes('vendor') ? 'vendor' : (roles.includes('customer') ? 'customer' : 'guest');
            const desiredPage = state.returnPath || (primaryRole === 'admin' ? 'AdminDashboard' : primaryRole === 'vendor' ? 'VendorDashboard' : 'Shop');
            const preservePage = action.meta && action.meta.preservePage;

            return {
                ...state,
                isLoggedIn: true,
                userRole: primaryRole,
                page: preservePage ? state.page : desiredPage,
                returnPath: null,
                user,
            };
        }
        case 'LOGOUT':
            return { ...initialState, page: 'Home' };
        case 'SET_RETURN_PATH':
            return { ...state, returnPath: action.payload };
        case 'UPDATE_USER': {
            // Merge current user with updates; create user object if it doesn't exist
            const updates = action.payload || {};
            const nextUser = {
                ...(state.user || {}),
                ...updates,
                // Ensure notifications object remains well-formed
                notifications: {
                    orders: true,
                    promotions: true,
                    newsletter: true,
                    ...(updates.notifications || (state.user && state.user.notifications) || {})
                }
            };
            return { ...state, user: nextUser };
        }
        case 'SET_VENDOR_REG_STEP':
            return { ...state, vendorRegStep: action.payload };
        case 'SELECT_VENDOR':
            return { ...state, selectedVendor: action.payload };
        case 'SET_SELECTED_PRODUCT':
            return { ...state, selectedProduct: action.payload };
        case 'CLEAR_SELECTED_PRODUCT':
            return { ...state, selectedProduct: null };
        case 'SET_VENDORS':
            return { ...state, vendors: action.payload };
        // Shopping cart actions
        case 'ADD_TO_CART': {
            // Block adding to cart if user not logged in; redirect to Login preserving current page
            if (!state.isLoggedIn) {
                return { ...state, page: 'Login', returnPath: state.page };
            }
            const item = action.payload;
            const existing = state.cartItems.find(ci => ci.id === item.id);
            let updated;
            if (existing) {
                updated = state.cartItems.map(ci => ci.id === item.id ? { ...ci, qty: (ci.qty || 1) + (item.qty || 1) } : ci);
            } else {
                updated = [...state.cartItems, { ...item, qty: item.qty || 1 }];
            }
            return { ...state, cartItems: updated };
        }
        case 'REMOVE_FROM_CART': {
            const id = action.payload;
            const updated = state.cartItems.filter(ci => ci.id !== id);
            return { ...state, cartItems: updated };
        }
        case 'UPDATE_CART_ITEM': {
            const { id, qty } = action.payload;
            const updated = state.cartItems.map(ci => ci.id === id ? { ...ci, qty } : ci);
            return { ...state, cartItems: updated };
        }
        case 'CLEAR_CART':
            return { ...state, cartItems: [] };
        case 'SET_CART_OPEN':
            return { ...state, isCartOpen: action.payload };
        case 'TOGGLE_CART':
            return { ...state, isCartOpen: !state.isCartOpen };
        default:
            return state;
    }
};

const AppContext = createContext(null);

export const AppContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(stateReducer, initialState);
    const [isInitialized, setIsInitialized] = React.useState(false);

    // Restore auth and sync page from URL on mount
    useEffect(() => {
        // Map URL path to page name
        const path = window.location.pathname;
        const pageMap = {
            '/': 'Home',
            '/shop': 'Shop',
            '/vendors': 'Vendors',
            '/vendorlist': 'VendorList',
            '/about': 'About',
            '/contact': 'Contact',
            '/faqs': 'FAQs',
            '/login': 'Login',
            '/register': 'Register',
            '/vendorregister': 'VendorRegister',
            '/forgotpassword': 'ForgotPassword',
            '/resetpassword': 'ResetPassword',
            '/profile': 'Profile',
            '/cart': 'Cart',
            '/checkout': 'Checkout',
            '/orders': 'Orders',
            '/orderhistory': 'OrderHistory',
            '/vendordashboard': 'VendorDashboard',
            '/vendorproducts': 'VendorProducts',
            '/vendororders': 'VendorOrders',
            '/vendoranalytics': 'VendorAnalytics',
            '/admindashboard': 'AdminDashboard',
            '/adminproductscategories': 'AdminProductsCategories',
            '/adminuservendors': 'AdminUsersVendors',
            '/adminorders': 'AdminOrders',
            '/adminanalytics': 'AdminAnalytics',
            '/adminsubscriptionscontrol': 'AdminSubscriptionsControl',
            '/dashboardpage': 'DashboardPage',
            '/customerspage': 'CustomersPage',
            '/orderspage': 'OrdersPage',
            '/productspage': 'ProductsPage',
            '/categoriespage': 'CategoriesPage',
            '/vendorspage': 'VendorsPage',
            '/analyticspage': 'AnalyticsPage',
            '/faqspage': 'FAQsPage',
            '/deletionrequests': 'DeletionRequests',
        };

        const pageName = pageMap[path.toLowerCase()] || 'Home';

        // Restore authentication
        let token = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');

        // Try to restore auth if we have either token or storedUser
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);

                // If token is missing but user has accessToken, use that
                if (!token && user.accessToken) {
                    token = user.accessToken;
                    localStorage.setItem('authToken', token);
                }

                if (token) {
                    dispatch({ type: 'LOGIN', payload: user, meta: { preservePage: true } });
                    // Set the page from URL after login
                    dispatch({ type: 'SET_PAGE', payload: pageName });
                } else {
                    localStorage.removeItem('user');
                    dispatch({ type: 'SET_PAGE', payload: pageName });
                }
            } catch (e) {
                console.error('Failed to parse stored user:', e);
                // If auth fails, go to the page anyway (might redirect to login if protected)
                dispatch({ type: 'SET_PAGE', payload: pageName });
            }
        } else if (token) {
            // Have token but no user - invalid state, clear it
            localStorage.removeItem('authToken');
            dispatch({ type: 'SET_PAGE', payload: pageName });
        } else {
            // No auth, just set the page from URL
            dispatch({ type: 'SET_PAGE', payload: pageName });
        }        // Mark as initialized after first load
        setIsInitialized(true);
    }, []);

    useEffect(() => {
        // Only sync to localStorage after initial load is complete
        if (!isInitialized) return;

        if (state.user && state.isLoggedIn) {
            const userString = JSON.stringify(state.user);
            const currentUser = localStorage.getItem('user');

            // Only update if changed to prevent infinite loops
            if (userString !== currentUser) {
                console.log('Syncing user to localStorage');
                localStorage.setItem('user', userString);
            }

            // Also store the authToken separately if it exists in user object
            if (state.user.accessToken) {
                const currentToken = localStorage.getItem('authToken');
                if (currentToken !== state.user.accessToken) {
                    localStorage.setItem('authToken', state.user.accessToken);
                }
            }
        } else if (state.isLoggedIn === false) {
            // Only clear if explicitly logged out (not during initialization)
            localStorage.removeItem('user');
            localStorage.removeItem('authToken');
        }
    }, [state.user, state.isLoggedIn, isInitialized]);

    // Sync URL with current page
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const path = state.page === 'Home' ? '/' : `/${state.page.toLowerCase()}`;
            window.history.pushState({}, '', path);
        }
    }, [state.page]);

    // Handle browser back/forward navigation
    useEffect(() => {
        const handlePopState = () => {
            const path = window.location.pathname;
            const pageMap = {
                '/': 'Home',
                '/shop': 'Shop',
                '/vendors': 'Vendors',
                '/vendorlist': 'VendorList',
                '/about': 'About',
                '/contact': 'Contact',
                '/faqs': 'FAQs',
                '/login': 'Login',
                '/register': 'Register',
                '/vendorregister': 'VendorRegister',
                '/forgotpassword': 'ForgotPassword',
                '/resetpassword': 'ResetPassword',
                '/profile': 'Profile',
                '/cart': 'Cart',
                '/checkout': 'Checkout',
                '/orders': 'Orders',
                '/orderhistory': 'OrderHistory',
                '/vendordashboard': 'VendorDashboard',
                '/vendorproducts': 'VendorProducts',
                '/vendororders': 'VendorOrders',
                '/vendoranalytics': 'VendorAnalytics',
                '/admindashboard': 'AdminDashboard',
                '/adminproductscategories': 'AdminProductsCategories',
                '/adminuservendors': 'AdminUsersVendors',
                '/adminorders': 'AdminOrders',
                '/adminanalytics': 'AdminAnalytics',
                '/adminsubscriptionscontrol': 'AdminSubscriptionsControl',
                '/dashboardpage': 'DashboardPage',
                '/customerspage': 'CustomersPage',
                '/orderspage': 'OrdersPage',
                '/productspage': 'ProductsPage',
                '/categoriespage': 'CategoriesPage',
                '/vendorspage': 'VendorsPage',
                '/analyticspage': 'AnalyticsPage',
                '/faqspage': 'FAQsPage',
                '/deletionrequests': 'DeletionRequests',
            };

            const pageName = pageMap[path.toLowerCase()] || 'Home';
            dispatch({ type: 'SET_PAGE', payload: pageName });
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // Listen for unauthorized events from API interceptor (refresh token failure)
    useEffect(() => {
        const handleUnauthorized = async (event) => {
            console.warn('Session expired or unauthorized. Logging out...', event.detail);
            dispatch({ type: 'LOGOUT' });

            // Show toast notification (dynamically import to avoid SSR issues)
            if (typeof window !== 'undefined') {
                try {
                    const { showToast } = await import('@/utils/toast');
                    showToast.error('Your session has expired. Please log in again.');
                } catch (err) {
                    // Fallback to alert if toast fails
                    alert('Your session has expired. Please log in again.');
                }
            }
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('goorganic:unauthorized', handleUnauthorized);
            return () => window.removeEventListener('goorganic:unauthorized', handleUnauthorized);
        }
    }, [dispatch]);

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within AppContextProvider');
    }
    return context;
};
