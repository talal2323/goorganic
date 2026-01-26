'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react';

const initialState = {
    userRole: 'guest', // guest | customer | vendor | admin
    vendorRegStep: 1, // For multi-step registration
    isLoggedIn: false,
    user: null, // Authenticated user profile data
    selectedVendor: null, // Selected vendor for detail view
    selectedProduct: null, // Selected product for detail view
    vendors: [], // List of vendors
    // Shopping cart state
    cartItems: [], // Cart items from backend - populated after login
    isCartOpen: false,
    cartLoading: false, // Loading state for cart operations
};

const stateReducer = (state, action) => {
    switch (action.type) {
        case 'SET_USER_ROLE':
            return { ...state, userRole: action.payload, isLoggedIn: action.payload !== 'guest' };
        case 'LOGIN': {
            // The payload from the API is the normalized user object with roles[] and accessToken
            const user = action.payload || {};
            const roles = Array.isArray(user.roles) ? user.roles : [];
            const primaryRole = roles.includes('admin') ? 'admin' : roles.includes('vendor') ? 'vendor' : (roles.includes('customer') ? 'customer' : 'guest');

            return {
                ...state,
                isLoggedIn: true,
                userRole: primaryRole,
                user,
            };
        }
        case 'LOGOUT':
            return { ...initialState };
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
        // Shopping cart actions - synced with backend
        case 'SET_CART': {
            // Set cart items from backend response
            const cart = action.payload;
            if (!cart || !cart.items) {
                return { ...state, cartItems: [], cartLoading: false };
            }
            // Transform backend cart items to frontend format
            const items = cart.items.map(item => ({
                id: item.product._id || item.product,
                productId: item.product._id || item.product,
                name: item.product.name,
                price: item.product.price,
                qty: item.quantity,
                image: item.product.images?.[0]?.url,
                stock: item.product.stock,
                // Extract vendor information
                vendorId: item.vendor?._id || item.vendor,
                vendorName: item.vendor?.name,
                shopName: item.vendor?.shopName
            }));
            return { ...state, cartItems: items, cartLoading: false };
        }
        case 'SET_CART_LOADING':
            return { ...state, cartLoading: action.payload };
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

    // Restore authentication on mount
    useEffect(() => {
        let token = localStorage.getItem('authToken');
        let storedUser = localStorage.getItem('user');

        // Helper to get cookie value
        const getCookie = (name) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
            return null;
        };

        // If localStorage is empty, try to restore from cookies
        if (!token) {
            token = getCookie('authToken');
            if (token) {
                localStorage.setItem('authToken', token);
            }
        }

        if (!storedUser) {
            const cookieUser = getCookie('user');
            if (cookieUser) {
                try {
                    storedUser = decodeURIComponent(cookieUser);
                    localStorage.setItem('user', storedUser);
                } catch (e) {
                    console.error('Failed to decode user cookie:', e);
                }
            }
        }

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
                    dispatch({ type: 'LOGIN', payload: user });
                } else {
                    localStorage.removeItem('user');
                }
            } catch (e) {
                console.error('Failed to parse stored user:', e);
            }
        } else if (token) {
            // Have token but no user - invalid state, clear it
            localStorage.removeItem('authToken');
        }

        // Mark as initialized after first load
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

    // Fetch cart from backend when user logs in
    useEffect(() => {
        const fetchCart = async () => {
            if (state.isLoggedIn && isInitialized) {
                try {
                    dispatch({ type: 'SET_CART_LOADING', payload: true });
                    const { getCart } = await import('@/utils/cartApi');
                    const cart = await getCart();
                    dispatch({ type: 'SET_CART', payload: cart });
                } catch (error) {
                    console.error('Failed to fetch cart:', error);
                    dispatch({ type: 'SET_CART_LOADING', payload: false });
                }
            } else if (!state.isLoggedIn) {
                // Clear cart when logged out
                dispatch({ type: 'CLEAR_CART' });
            }
        };

        fetchCart();
    }, [state.isLoggedIn, isInitialized]);

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

/**
 * Custom hook for cart operations
 * Provides functions to add, update, and remove items from cart
 * All operations sync with backend
 */
export const useCart = () => {
    const { state, dispatch } = useAppContext();

    const addItemToCart = async (productId, quantity = 1) => {
        if (!state.isLoggedIn) {
            throw new Error('Please log in to add items to cart');
        }

        try {
            dispatch({ type: 'SET_CART_LOADING', payload: true });
            const { addToCart } = await import('@/utils/cartApi');
            const updatedCart = await addToCart(productId, quantity);
            dispatch({ type: 'SET_CART', payload: updatedCart });
            return updatedCart;
        } catch (error) {
            dispatch({ type: 'SET_CART_LOADING', payload: false });
            throw error;
        }
    };

    const updateCartItem = async (productId, quantity) => {
        if (!state.isLoggedIn) {
            throw new Error('Please log in to update cart');
        }

        try {
            dispatch({ type: 'SET_CART_LOADING', payload: true });
            const { addToCart } = await import('@/utils/cartApi');
            const updatedCart = await addToCart(productId, quantity);
            dispatch({ type: 'SET_CART', payload: updatedCart });
            return updatedCart;
        } catch (error) {
            dispatch({ type: 'SET_CART_LOADING', payload: false });
            throw error;
        }
    };

    const removeItemFromCart = async (productId) => {
        if (!state.isLoggedIn) {
            throw new Error('Please log in to remove items from cart');
        }

        try {
            dispatch({ type: 'SET_CART_LOADING', payload: true });
            const { removeFromCart } = await import('@/utils/cartApi');
            const updatedCart = await removeFromCart(productId);
            dispatch({ type: 'SET_CART', payload: updatedCart });
            return updatedCart;
        } catch (error) {
            dispatch({ type: 'SET_CART_LOADING', payload: false });
            throw error;
        }
    };

    const refreshCart = async () => {
        if (!state.isLoggedIn) {
            return;
        }

        try {
            dispatch({ type: 'SET_CART_LOADING', payload: true });
            const { getCart } = await import('@/utils/cartApi');
            const cart = await getCart();
            dispatch({ type: 'SET_CART', payload: cart });
            return cart;
        } catch (error) {
            dispatch({ type: 'SET_CART_LOADING', payload: false });
            throw error;
        }
    };

    return {
        cartItems: state.cartItems,
        cartLoading: state.cartLoading,
        isCartOpen: state.isCartOpen,
        addItemToCart,
        updateCartItem,
        removeItemFromCart,
        refreshCart,
        openCart: () => dispatch({ type: 'SET_CART_OPEN', payload: true }),
        closeCart: () => dispatch({ type: 'SET_CART_OPEN', payload: false }),
        toggleCart: () => dispatch({ type: 'TOGGLE_CART' }),
    };
};
