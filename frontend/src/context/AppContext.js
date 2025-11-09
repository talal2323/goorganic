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
    case 'TOGGLE_CART':
      return { ...state, isCartOpen: !state.isCartOpen };
    case 'SET_CART_OPEN':
      return { ...state, isCartOpen: !!action.payload };
    case 'SUBMIT_FORM':
      // Static logic for form submission (shows a quick confirmation)
      console.log('Form Submitted:', action.payload);
      return state;
    default:
      return state;
  }
};

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(stateReducer, initialState);

  // Hydrate state from localStorage on first mount
  useEffect(() => {
    const raw = localStorage.getItem('userInfo');
    if (raw) {
      try {
        const user = JSON.parse(raw);
        if (user && user.accessToken) {
          // Hydrate auth without forcing a page redirect
          dispatch({ type: 'LOGIN', payload: user, meta: { preservePage: true } });
        }
      } catch (e) {
        // Clean invalid value
        localStorage.removeItem('userInfo');
      }
    }
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;