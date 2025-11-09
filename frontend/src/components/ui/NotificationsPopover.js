'use client'

import React, { useEffect, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';
import NotificationsContent from '@/components/dashboard/NotificationsContent';
import { Button } from '@/components/common/UIComponents';

const NotificationsPopover = ({ onClose }) => {
  const { state, dispatch } = useAppContext();
  const ref = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose?.();
    };
    // Defer listener so the opening click doesn't immediately close the popover
    const t = setTimeout(() => document.addEventListener('click', onDocClick), 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener('click', onDocClick);
    };
  }, [onClose]);

  const role = state.userRole;
  const isLoggedIn = state.isLoggedIn;

  return (
    <div ref={ref} className="absolute right-0 mt-2 w-[22rem] sm:w-[28rem] bg-white border rounded-lg shadow-2xl z-[100]">
      <div className="px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">
            {isLoggedIn ? (role === 'vendor' ? 'Vendor Notifications' : role === 'admin' ? 'Admin Notifications' : 'Notifications') : 'Notifications'}
          </h3>
          <button onClick={onClose} aria-label="Close" className="text-gray-500 hover:text-gray-700">×</button>
        </div>
      </div>

      <div className="max-h-[60vh] overflow-auto p-3">
        {!isLoggedIn ? (
          <div className="text-center p-4">
            <p className="text-sm text-gray-700 font-medium">No notifications</p>
            <p className="text-xs text-gray-500 mt-1">Sign in to see your updates and alerts.</p>
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2">
              <Button primary={false} className="bg-white border" onClick={() => { dispatch({ type: 'SET_PAGE', payload: 'Blog' }); onClose?.(); }}>
                Visit our Blogs
              </Button>
              <Button onClick={() => { dispatch({ type: 'SET_PAGE', payload: 'Login' }); onClose?.(); }}>
                Sign In
              </Button>
              <Button primary={false} onClick={() => { dispatch({ type: 'SET_PAGE', payload: 'Register' }); onClose?.(); }}>
                Sign Up
              </Button>
            </div>
          </div>
        ) : (
          <NotificationsContent />
        )}
      </div>

      <div className="px-4 py-2 border-t text-right">
        <button
          onClick={() => { dispatch({ type: 'SET_PAGE', payload: 'Notifications' }); onClose?.(); }}
          className="text-xs text-gray-600 hover:text-gray-900 underline"
        >
          Open full notifications
        </button>
      </div>
    </div>
  );
};

export default NotificationsPopover;
