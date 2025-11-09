import React from 'react';
import { useAppContext } from '../../context/AppContext';

const Header = () => {
  const { state, dispatch } = useAppContext();
  const { userRole, isLoggedIn } = state;

  return (
    <header className="bg-[#175017] text-white py-2">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <a href="tel:+1234567890" className="text-sm hover:text-green-200">
              <span className="hidden sm:inline">Call us:</span> +123 456 7890
            </a>
            <a href="mailto:info@goorganic.com" className="text-sm hover:text-green-200">
              <span className="hidden sm:inline">Email:</span> info@goorganic.com
            </a>
          </div>
          <div className="flex items-center space-x-4">
            {!isLoggedIn ? (
              <>
                <button 
                  onClick={() => dispatch({ type: 'SET_PAGE', payload: 'Login' })}
                  className="text-sm hover:text-green-200"
                >
                  Login
                </button>
                <button 
                  onClick={() => dispatch({ type: 'SET_PAGE', payload: 'Register' })}
                  className="text-sm hover:text-green-200"
                >
                  Register
                </button>
                <button 
                  onClick={() => dispatch({ type: 'SET_PAGE', payload: 'VendorRegister' })}
                  className="text-sm hover:text-green-200"
                >
                  Become a Vendor
                </button>
              </>
            ) : (
              <div className="text-sm">
                Welcome, {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;