'use client'

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAppContext } from '@/context/AppContext';
import { Icon, Logo } from '@/components/common/UIComponents';
import ShoppingCartSidebar from '@/components/ui/ShoppingCartSidebar';
import NotificationsPopover from '@/components/ui/NotificationsPopover';
import api from '@/utils/api';
import { clearAuthCookies } from '@/utils/cookies';

// Account menu dropdown component (kept local to Header)
const AccountMenuButton = ({ state }) => {
  const router = useRouter();
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

  const goto = (route) => {
    if (!state.isLoggedIn && (route === '/profile' || route === '/orders')) {
      router.push('/auth/login?redirect=' + route);
    } else {
      router.push(route);
    }
    setOpen(false);
  };

  const handleLogout = async () => {
    try {
      await api.post('/users/logout');
    } catch (error) {
      console.error('Logout failed', error);
    }

    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();

    // Clear all authentication cookies
    clearAuthCookies();

    dispatch({ type: 'LOGOUT' });
    setOpen(false);

    // Use setTimeout to ensure cookies are cleared before redirect
    setTimeout(() => {
      router.push('/');
    }, 100);
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
        <div role="menu" className="absolute right-0 top-full mt-2 w-48 bg-white border rounded shadow-lg z-[100]">
          <div className="py-1">
            <div className="px-4 py-2 text-xs text-gray-500">Account</div>
            <button onClick={() => goto('/profile')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">My Profile</button>
            <button onClick={() => goto('/orders')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Order History</button>
            <hr className="my-1 border-gray-200" />
            {state.isLoggedIn ? (
              <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Logout</button>
            ) : (
              <button onClick={() => goto('/auth/login')} className="w-full text-left px-4 py-2 text-sm text-primary hover:bg-gray-100">Sign in / Sign up</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { dispatch, state } = useAppContext();
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const notifRef = useRef(null);
  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'Vendors', href: '/vendors' },
    { label: 'Blog', href: '/blog' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  const isActive = (href) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  // state and dispatch are used directly below

  return (
    <>
      <header className="sticky top-0 z-50 bg-white shadow-md w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex justify-between items-center h-16 w-full">
            <Link href="/">
              <Logo
                src="/images/logo.png"
                alt="GOorganic"
                className="h-8 cursor-pointer"
              />
            </Link>

            {/* Main Navigation - Hidden on Mobile */}
            <nav className="hidden md:flex space-x-6 text-sm font-medium text-gray-700">
              {navItems.map(item => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`hover:text-secondary transition duration-150 ${isActive(item.href) ? 'text-secondary font-semibold' : ''
                    }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Vendor/Admin quick link (if role matches) + Cart, Account Icons */}
            <div className="flex items-center space-x-2 md:space-x-4 relative">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded hover:bg-gray-100"
                aria-label="Toggle menu"
              >
                <Icon
                  path={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                  className="w-6 h-6 text-gray-700"
                />
              </button>
              {state.isLoggedIn && (state.userRole === 'vendor' || (state.user && Array.isArray(state.user.roles) && state.user.roles.includes('vendor'))) && (
                <Link
                  href="/vendor"
                  className="hidden md:inline px-3 py-1.5 text-sm rounded bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Vendor Dashboard
                </Link>
              )}
              {state.isLoggedIn && (state.userRole === 'admin' || (state.user && Array.isArray(state.user.roles) && state.user.roles.includes('admin'))) && (
                <Link
                  href="/admin"
                  className="hidden md:inline px-3 py-1.5 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Admin Dashboard
                </Link>
              )}


              {/* Notifications bell - navigates to Notifications page state */}
              <div className="relative z-[60]" ref={notifRef}>
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
              <div className="relative z-[60]">
                {/* Toggle button */}
                <AccountMenuButton state={state} setOpen={() => { }} />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t">
            <nav className="px-4 py-3 space-y-2">
              {navItems.map(item => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block w-full text-left px-4 py-2 rounded hover:bg-gray-100 ${isActive(item.href) ? 'text-secondary font-semibold bg-gray-50' : 'text-gray-700'
                    }`}
                >
                  {item.label}
                </Link>
              ))}

              {/* Mobile Dashboard Buttons */}
              {state.isLoggedIn && (state.userRole === 'vendor' || (state.user && Array.isArray(state.user.roles) && state.user.roles.includes('vendor'))) && (
                <Link
                  href="/vendor"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-left px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Vendor Dashboard
                </Link>
              )}
              {state.isLoggedIn && (state.userRole === 'admin' || (state.user && Array.isArray(state.user.roles) && state.user.roles.includes('admin'))) && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-left px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Admin Dashboard
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>
      <ShoppingCartSidebar />
    </>
  );
};