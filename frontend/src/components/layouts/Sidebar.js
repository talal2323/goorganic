'use client'

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAppContext } from '@/context/AppContext';
import { Icon, Logo } from '@/components/common/UIComponents';
import { COLORS } from '@/utils/config';

const Sidebar = ({ navItems = [], userRole }) => {
  const { dispatch, state } = useAppContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Check vendor status for restricting access
  const user = state.user || {};
  const vendorStatus = user.vendorStatus;
  const isVendor = userRole === 'vendor';
  const isVendorNotApproved = isVendor && vendorStatus && vendorStatus !== 'Approved';

  const router = useRouter();

  const isActive = (href) => {
    return pathname === href;
  };

  const handleNavigation = (route) => {
    // Block navigation for unapproved vendors (except Dashboard, Business Info, and Home)
    if (isVendorNotApproved) {
      const allowedRoutes = ['/vendor', '/vendor/business-info', '/'];
      if (!allowedRoutes.includes(route)) {
        return; // Don't navigate
      }
    }

    router.push(route);
    setMobileMenuOpen(false); // Close mobile menu after navigation
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed bottom-4 right-4 z-50 p-4 rounded-full shadow-lg text-white"
        style={{ backgroundColor: COLORS.primary }}
        aria-label="Toggle menu"
      >
        <Icon
          path={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
          className="w-6 h-6"
          color="white"
        />
      </button>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop (always visible) & Mobile (slide in) */}
      <div
        style={{ backgroundColor: COLORS.primary }}
        className={`
          w-64 flex-shrink-0 text-white min-h-screen
          md:block
          fixed md:relative z-40
          transform transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-4 border-b border-gray-700">
          <Logo className="text-xl text-white" color="white" />
        </div>
        <nav className="p-4 space-y-2">
          {(Array.isArray(navItems) ? navItems : []).map(item => {
            // Check if this item should be disabled for unapproved vendors
            const allowedRoutes = ['/vendor', '/vendor/business-info'];
            const isDisabled = isVendorNotApproved && !allowedRoutes.includes(item.href);
            const active = isActive(item.href);

            return (
              <button
                key={item.href}
                type="button"
                onClick={() => handleNavigation(item.href)}
                disabled={isDisabled}
                className={`flex items-center space-x-3 p-3 rounded-lg transition duration-150 text-sm w-full
                  ${isDisabled
                    ? 'opacity-40 cursor-not-allowed text-gray-500'
                    : active
                      ? 'bg-white/20 text-white font-semibold'
                      : 'text-gray-300 hover:bg-gray-700'
                  }
                `}
              >
                <Icon path={item.path} className="w-5 h-5" color={isDisabled ? 'currentColor' : 'currentColor'} />
                <span>{item.label}</span>
                {isDisabled && <span className="ml-auto text-xs">🔒</span>}
              </button>
            );
          })}
          {/* Additional options at the bottom */}
          <div className="pt-4 border-t border-gray-700 space-y-2">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="flex items-center space-x-3 p-3 rounded-lg transition duration-150 text-sm text-gray-300 hover:bg-gray-700 w-full"
            >
              <Icon path="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" className="w-5 h-5" color="currentColor" />
              <span>Go to Customer Site</span>
            </button>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;