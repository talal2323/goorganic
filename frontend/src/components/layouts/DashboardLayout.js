'use client'

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { vendorNavItems, adminNavItems } from '@/utils/config';
import { DashboardHeader } from './DashboardHeader';
import Sidebar from './Sidebar';

const DashboardLayout = ({ title, userRole, children }) => {
  const router = useRouter();
  const navItems = userRole === 'admin' ? adminNavItems : vendorNavItems;

  useEffect(() => {
    // Check authentication on mount and on history navigation
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        window.location.replace('/auth/login');
      }
    };

    checkAuth();

    // Handle browser back/forward buttons
    const handlePopState = () => {
      checkAuth();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return (
    <div className="flex min-h-screen relative overflow-x-hidden">
      <Sidebar navItems={navItems} userRole={userRole} />
      <div className="flex-1 flex flex-col overflow-x-hidden bg-gray-50 w-full md:w-auto min-w-0">
        <DashboardHeader title={title} userRole={userRole} />
        <main className="min-w-0 p-3 sm:p-6 flex-1 pb-20 md:pb-6">
          {children}
        </main>
        <footer className="p-3 text-center text-xs text-gray-500 border-t border-gray-200">
          GOorganic Dashboard
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;