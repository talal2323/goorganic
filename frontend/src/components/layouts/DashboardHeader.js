'use client'

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { Button, Icon, Logo } from '@/components/common/UIComponents';
import { clearAuthCookies } from '@/utils/cookies';
import NotificationsPopover from '@/components/ui/NotificationsPopover';
import { getNotifications } from '@/utils/notificationApi';

export const DashboardHeader = ({ title, userRole }) => {
  const router = useRouter();
  const { dispatch } = useAppContext();
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);
  const portalLabel = userRole.charAt(0).toUpperCase() + userRole.slice(1) + ' Portal';

  // Fetch unread notification count
  useEffect(() => {
    fetchUnreadCount();
    // Refresh count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const data = await getNotifications();
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch notification count:', error);
    }
  };

  const handleNotificationClick = () => {
    setNotifOpen(o => !o);
    if (!notifOpen) {
      fetchUnreadCount(); // Refresh count when opening
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex justify-between items-center h-16 px-3 sm:px-6">
        <h1 className="text-lg sm:text-2xl font-semibold text-gray-800 truncate">{title}</h1>
        <div className="flex items-center space-x-2 sm:space-x-4 relative">
          {/* Notifications bell */}
          <div className="relative z-[60]" ref={notifRef}>
            <button
              onClick={handleNotificationClick}
              className="p-1 rounded hover:bg-gray-100 relative"
              title="Notifications"
              aria-haspopup="dialog"
              aria-expanded={notifOpen}
            >
              <Icon path="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" className="w-5 h-5 text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            {notifOpen && (
              <NotificationsPopover onClose={() => setNotifOpen(false)} onRefresh={fetchUnreadCount} />
            )}
          </div>

          {/* Portal switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen(o => !o)}
              className="flex items-center space-x-1 text-xs sm:text-sm font-medium text-gray-700 hover:text-secondary"
            >
              <Icon name="SwitchHorizontal" className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              <span className="hidden sm:inline">{portalLabel}</span>
              <Icon name="ChevronDown" className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
            </button>
            {open && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border rounded shadow-md z-[60] text-xs sm:text-sm">
                {userRole === 'vendor' && (
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() => { router.push('/vendor'); setOpen(false); }}
                  >
                    Vendor Dashboard
                  </button>
                )}
                {userRole === 'admin' && (
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() => { router.push('/admin'); setOpen(false); }}
                  >
                    Admin Dashboard
                  </button>
                )}
              </div>
            )}
          </div>
          <Button
            onClick={async () => {
              try {
                await (await import('../../utils/api')).default.post('/users/logout');
              } catch (e) {
                console.error('Logout API error:', e);
              }

              // Clear all storage
              localStorage.clear();
              sessionStorage.clear();

              // Clear all authentication cookies
              clearAuthCookies();

              // Verify cookies are cleared
              console.log('Cookies after clear:', document.cookie);

              dispatch({ type: 'LOGOUT' });

              // Use setTimeout to ensure cookies are cleared before redirect
              setTimeout(() => {
                window.location.href = '/';
              }, 100);
            }}
            primary={false}
            className="py-1 px-2 sm:px-3 text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">Logout</span>
            <span className="sm:hidden">
              <Icon path="M17 16l4-4m0 0l-4-4m4 4H7" className="w-4 h-4" />
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};