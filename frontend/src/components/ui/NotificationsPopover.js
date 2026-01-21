'use client'

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { Button, Icon } from '@/components/common/UIComponents';
import { getNotifications, markNotificationAsRead } from '@/utils/notificationApi';
import { COLORS } from '@/utils/config';

const NotificationItem = ({ item, onToggleRead, onClose }) => {
  const router = useRouter();

  const handleClick = async () => {
    if (!item.isRead) {
      await onToggleRead(item._id);
    }
    if (item.link) {
      router.push(item.link);
      onClose?.();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`flex items-start gap-3 p-3 rounded hover:bg-gray-50 cursor-pointer transition-colors ${item.isRead ? '' : 'bg-green-50'
        }`}
    >
      <div className="flex-shrink-0">
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center"
          style={{ backgroundColor: COLORS.primary }}
        >
          <Icon
            path={getNotificationIconPath(item.type)}
            className="w-4 h-4"
            color="white"
          />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-gray-900">{item.title}</div>
        <div className="text-xs text-gray-500 mt-1 line-clamp-2">{item.message}</div>
        <div className="text-xs text-gray-400 mt-1">
          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      {!item.isRead && (
        <div className="flex-shrink-0">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.secondary }}></div>
        </div>
      )}
    </div>
  );
};

const getNotificationIconPath = (type) => {
  switch (type) {
    case 'order':
      return 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2';
    case 'product':
      return 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4';
    case 'subscription':
      return 'M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z';
    case 'vendor':
      return 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1';
    default:
      return 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9';
  }
};

const NotificationsPopover = ({ onClose, onRefresh }) => {
  const router = useRouter();
  const { state } = useAppContext();
  const ref = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose?.();
    };
    const t = setTimeout(() => document.addEventListener('click', onDocClick), 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener('click', onDocClick);
    };
  }, [onClose]);

  // Only fetch when popover opens, not on every mount
  useEffect(() => {
    fetchNotifications();
  }, []); // Empty dependency - fetch only once when popover opens

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      // Show only the 5 most recent notifications in dropdown
      setNotifications((data.notifications || []).slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      await fetchNotifications();
      onRefresh?.(); // Refresh the badge count in header
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const role = state.userRole;
  const isLoggedIn = state.isLoggedIn;

  // Determine the notifications page URL based on user role
  const getNotificationsPageUrl = () => {
    if (role === 'vendor') return '/vendor/notifications';
    if (role === 'admin') return '/admin/notifications';
    return '/notifications';
  };

  return (
    <div ref={ref} className="absolute right-0 top-full mt-2 w-[22rem] sm:w-[28rem] bg-white border rounded-lg shadow-2xl z-[100]">
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
              <Button primary={false} className="bg-white border" onClick={() => { router.push('/blog'); onClose?.(); }}>
                Visit our Blogs
              </Button>
              <Button onClick={() => { router.push('/auth/login'); onClose?.(); }}>
                Sign In
              </Button>
              <Button primary={false} onClick={() => { router.push('/auth/register'); onClose?.(); }}>
                Sign Up
              </Button>
            </div>
          </div>
        ) : loading ? (
          <div className="text-center text-sm text-gray-500 py-8">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-block p-3 bg-gray-100 rounded-full mb-3">
              <Icon
                path="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                className="w-8 h-8"
                color="#9CA3AF"
              />
            </div>
            <p className="text-sm text-gray-600 font-medium">No notifications</p>
            <p className="text-xs text-gray-500 mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-1">
            {notifications.map(item => (
              <NotificationItem
                key={item._id}
                item={item}
                onToggleRead={handleToggleRead}
                onClose={onClose}
              />
            ))}
          </div>
        )}
      </div>

      <div className="px-4 py-2 border-t text-right">
        <button
          onClick={() => { router.push(getNotificationsPageUrl()); onClose?.(); }}
          className="text-xs text-gray-600 hover:text-gray-900 underline"
        >
          Open full notifications
        </button>
      </div>
    </div>
  );
};

export default NotificationsPopover;
