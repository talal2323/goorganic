'use client'

import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button, Icon, Logo } from '@/components/common/UIComponents';

export const DashboardHeader = ({ title, userRole }) => {
  const { dispatch } = useAppContext();
  const [open, setOpen] = React.useState(false);
  const portalLabel = userRole.charAt(0).toUpperCase() + userRole.slice(1) + ' Portal';

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex justify-between items-center h-16 px-6">
        <h1 className="text-2xl font-semibold text-gray-800 hidden sm:block">{title}</h1>
        <Logo className="text-xl sm:hidden" />
        <div className="flex items-center space-x-4 relative">
          {/* Portal switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen(o => !o)}
              className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-secondary"
            >
              <Icon name="SwitchHorizontal" className="w-5 h-5 text-gray-500" />
              <span>{portalLabel}</span>
              <Icon name="ChevronDown" className="w-4 h-4 text-gray-500" />
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-md z-50 text-sm">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => { dispatch({ type: 'SET_PAGE', payload: 'Home' }); setOpen(false); }}
                >
                  Go to Customer Site
                </button>
                {userRole === 'vendor' && (
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() => { dispatch({ type: 'SET_PAGE', payload: 'VendorDashboard' }); setOpen(false); }}
                  >
                    Vendor Dashboard
                  </button>
                )}
                {userRole === 'admin' && (
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() => { dispatch({ type: 'SET_PAGE', payload: 'AdminDashboard' }); setOpen(false); }}
                  >
                    Admin Dashboard
                  </button>
                )}
              </div>
            )}
          </div>
          <Button
            onClick={async () => {
              try { await (await import('../../utils/api')).default.post('/users/logout'); } catch { }
              localStorage.removeItem('userInfo');
              dispatch({ type: 'LOGOUT' });
            }}
            primary={false}
            className="py-1 px-3"
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};