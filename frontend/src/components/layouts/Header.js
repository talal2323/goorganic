import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Icon, Logo } from '../common/UIComponents';
import ShoppingCartSidebar from '../ui/ShoppingCartSidebar';
import NotificationsPopover from '../ui/NotificationsPopover';
import api from '../../utils/api';

// Account menu dropdown component (kept local to Header)
const AccountMenuButton = ({ state }) => {
  const { dispatch } = useAppContext();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const goto = (page) => {
    if (!state.isLoggedIn && (page === 'Profile' || page === 'OrderHistory')) {
      dispatch({ type: 'SET_PAGE', payload: 'Login' });
      // Set a return path in state so we can redirect after login
      dispatch({ type: 'SET_RETURN_PATH', payload: page });
    } else {
      dispatch({ type: 'SET_PAGE', payload: page });
    }
    setOpen(false);
  };

  const handleLogout = async () => {
    try {
      await api.post('/users/logout');
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
      localStorage.removeItem('userInfo');
      setOpen(false);
      dispatch({ type: 'SET_PAGE', payload: 'Login' });
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center focus:outline-none"
      >
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
          {state.isLoggedIn && state.user && state.user.avatar?.url ? (
            <img src={state.user.avatar.url} alt="avatar" className="w-10 h-10 object-cover" />
          ) : state.isLoggedIn && state.user ? (
            <span className="font-bold">
              {(state.user.name || state.user.email || 'U').charAt(0).toUpperCase()}
            </span>
          ) : (
            <Icon
              path="M5.121 17.804A4 4 0 0112 15a4 4 0 016.879 2.804M15 11a3 3 0 10-6 0 3 3 0 006 0z"
              className="w-6 h-6 text-gray-500"
            />
          )}
        </div>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-50">
          <div className="py-1">
            <div className="px-4 py-2 text-xs text-gray-500">Account</div>
            <button onClick={() => goto('Profile')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">My Profile</button>
            <button onClick={() => goto('OrderHistory')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Order History</button>
            <hr className="my-1 border-gray-200" />
            {state.isLoggedIn ? (
              <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Logout</button>
            ) : (
              <button onClick={() => goto('Login')} className="w-full text-left px-4 py-2 text-sm text-primary hover:bg-gray-100">Sign in / Sign up</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const Header = () => {
  const { dispatch, state } = useAppContext();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const navItems = [
    { label: 'Home', page: 'Home' },
    { label: 'Shop', page: 'Shop' },
    { label: 'Vendors', page: 'VendorList' }, // Navigate to vendor list page
    { label: 'Blog', page: 'Blog' },
    { label: 'About', page: 'About' },
    { label: 'Contact', page: 'Contact' },
  ];

  // state and dispatch are used directly below

  return (
    <>
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo
              src="/logo.png"
              alt="GOorganic"
              className="h-8 cursor-pointer"
              onClick={() => dispatch({ type: 'SET_PAGE', payload: 'Home' })}
            />

            {/* Main Navigation - Hidden on Mobile */}
            <nav className="hidden md:flex space-x-6 text-sm font-medium text-gray-700">
              {navItems.map(item => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => dispatch({ type: 'SET_PAGE', payload: item.page })}
                  className={`hover:text-secondary transition duration-150 ${state.page === item.page || (state.page.startsWith(item.page.substring(0, 5)) && item.page !== 'Home') ? 'text-secondary font-bold' : ''}`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Vendor/Admin quick link (if role matches) + Cart, Account Icons */}
            <div className="flex items-center space-x-4">
              {state.isLoggedIn && (state.userRole === 'vendor' || (state.user && Array.isArray(state.user.roles) && state.user.roles.includes('vendor'))) && (
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'SET_PAGE', payload: 'VendorDashboard' })}
                  className="hidden md:inline px-3 py-1.5 text-sm rounded bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Vendor Dashboard
                </button>
              )}
              {state.isLoggedIn && (state.userRole === 'admin' || (state.user && Array.isArray(state.user.roles) && state.user.roles.includes('admin'))) && (
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'SET_PAGE', payload: 'AdminDashboard' })}
                  className="hidden md:inline px-3 py-1.5 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Admin Dashboard
                </button>
              )}


              {/* Notifications bell - navigates to Notifications page state */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifOpen(o => !o)}
                  className="p-1 rounded hover:bg-gray-100"
                  title="Notifications"
                  aria-haspopup="dialog"
                  aria-expanded={notifOpen}
                >
                  <Icon path="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" className="w-5 h-5 text-gray-700" />
                </button>
                {notifOpen && (
                  <NotificationsPopover onClose={() => setNotifOpen(false)} />
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => dispatch({ type: 'TOGGLE_CART' })}
                  className="p-1 rounded hover:bg-gray-100"
                  title="Cart"
                  aria-label="View cart"
                >
                  <Icon path="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" className="w-5 h-5 text-gray-700" />
                  {state.cartItems && state.cartItems.length > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                      {state.cartItems.length}
                    </span>
                  )}
                </button>
              </div>
              <span className="text-gray-700 text-sm hidden md:inline">|</span>
              {/* Account dropdown */}
              <div className="relative">
                {/* Toggle button */}
                <AccountMenuButton state={state} setOpen={() => { }} />
              </div>
            </div>
          </div>
        </div>
      </header>
      <ShoppingCartSidebar />
    </>
  );
};