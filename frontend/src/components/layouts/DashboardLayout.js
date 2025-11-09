import React from 'react';
import { vendorNavItems, adminNavItems } from '@/utils/config';
import { DashboardHeader } from './DashboardHeader';
import Sidebar from './Sidebar';

const DashboardLayout = ({ title, userRole, children }) => {
  const navItems = userRole === 'admin' ? adminNavItems : vendorNavItems;
  return (
    <div className="flex min-h-screen">
      <Sidebar navItems={navItems} userRole={userRole} />
      <div className="flex-1 flex flex-col overflow-x-hidden bg-gray-50">
        <DashboardHeader title={title} userRole={userRole} />
        <main className="p-4 sm:p-6 flex-1">
          {children}
        </main>
        <footer className="p-3 text-center text-xs text-gray-500 border-t border-gray-200">
          GOorganic Dashboard | Static Mockup - {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;