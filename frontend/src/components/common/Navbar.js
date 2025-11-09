import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';

const Navbar = () => {
  const { state, dispatch } = useAppContext();
  const { userRole, isLoggedIn } = state;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // --- This section correctly maps 'Vendors' to 'VendorList' ---
  const navigationItems = [
    { name: 'Home', page: 'Home' },
    { name: 'Shop', page: 'Shop' },
    { name: 'Vendors', page: 'VendorList' }, // <-- This is correct
    { name: 'About', page: 'About' },
    { name: 'Contact', page: 'Contact' },
  ];

  const userMenu = isLoggedIn ? (
    userRole === 'vendor' ? [
      { name: 'Dashboard', page: 'VendorDashboard' },
      { name: 'Products', page: 'VendorProducts' },
      { name: 'Orders', page: 'VendorOrders' },
      { name: 'Business Info', page: 'VendorBusinessInfo' },
    ] : userRole === 'admin' ? [
      { name: 'Dashboard', page: 'AdminDashboard' },
      { name: 'Users & Vendors', page: 'AdminUsersVendors' },
      { name: 'Products', page: 'AdminProductsCategories' },
      { name: 'Orders', page: 'AdminOrders' },
    ] : [
      { name: 'My Orders', page: 'CustomerOrders' },
      { name: 'Profile', page: 'CustomerProfile' },
      { name: 'Wishlist', page: 'CustomerWishlist' },
    ]
  ) : [];

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 cursor-pointer" onClick={() => dispatch({ type: 'SET_PAGE', payload: 'Home' })}>
            <span className="text-2xl font-bold text-[#175017]">Go Organic</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            {navigationItems.map((item) => (
              <button
                key={item.name}
                onClick={() => dispatch({ type: 'SET_PAGE', payload: item.page })}
                className="text-gray-700 hover:text-[#175017] px-3 py-2 rounded-md text-sm font-medium"
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-[#175017]">
                  <span>Account</span>
                </button>
                <div className="absolute right-0 w-48 py-2 mt-2 bg-white rounded-md shadow-xl hidden group-hover:block">
                  {userMenu.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => dispatch({ type: 'SET_PAGE', payload: item.page })}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      {item.name}
                    </button>
                  ))}
                  <button
                    onClick={() => dispatch({ type: 'LOGOUT' })}
                    className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : null}
            
            {/* Shopping Cart */}
            <button
              onClick={() => dispatch({ type: 'SET_PAGE', payload: 'Cart' })}
              className="bg-[#175017] text-white p-2 rounded-full hover:bg-[#0d2f0d]"
            >
              Cart (0)
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-[#175017] hover:bg-gray-100"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    dispatch({ type: 'SET_PAGE', payload: item.page });
                    setIsMenuOpen(false);
                  }}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#175017] hover:bg-gray-100 w-full text-left"
                >
                  {item.name}
                </button>
              ))}
              {isLoggedIn && userMenu.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    dispatch({ type: 'SET_PAGE', payload: item.page });
                    setIsMenuOpen(false);
                  }}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#175017] hover:bg-gray-100 w-full text-left"
                >
                  {item.name}
                </button>
              ))}
              {isLoggedIn && (
                <button
                  onClick={() => {
                    dispatch({ type: 'LOGOUT' });
                    setIsMenuOpen(false);
                  }}
                  className="block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-gray-100 w-full text-left"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;