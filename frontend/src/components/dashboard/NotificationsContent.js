'use client'

// src/components/dashboard/NotificationsContent.js
import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardCard from '@/components/ui/DashboardCard';
import { Icon, COLORS } from '@/config/utils';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications
} from '@/utils/notificationApi';

const NotificationRow = ({ item, onToggleRead, onDelete }) => {
  const router = useRouter();

  const handleClick = async () => {
    if (!item.isRead) {
      await onToggleRead(item._id);
    }
    if (item.link) {
      router.push(item.link);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`flex items-start gap-4 p-3 rounded hover:bg-gray-50 cursor-pointer ${item.isRead ? '' : 'bg-green-50'}`}
    >
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-md flex items-center justify-center text-white" style={{ backgroundColor: COLORS.primary }}>
          <Icon name={item.type === 'order' ? 'orders' : 'bell'} className="h-5 w-5" stroke="#fff" />
        </div>
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-sm" style={{ color: COLORS.text }}>{item.title}</div>
            <div className="text-xs text-gray-500 mt-1">{item.message}</div>
            <div className="text-xs text-gray-400 mt-1">{new Date(item.createdAt).toLocaleString()}</div>
          </div>
        </div>
      </div>
      <div className="flex-shrink-0 pl-3 flex gap-2">
        {!item.isRead && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleRead(item._id);
            }}
            className="text-sm px-2 py-1 rounded bg-[#175017] text-white"
          >
            Mark read
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item._id);
          }}
          className="text-sm px-2 py-1 rounded bg-red-100 text-red-600 hover:bg-red-200"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

const NotificationsContent = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

  const visible = useMemo(() => {
    return notifications.filter(n => {
      if (filter === 'unread' && n.isRead) return false;
      if (query && !(n.title.toLowerCase().includes(query.toLowerCase()) || n.message.toLowerCase().includes(query.toLowerCase()))) return false;
      return true;
    });
  }, [notifications, filter, query]);

  const toggleRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      await fetchNotifications();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      await fetchNotifications();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const markAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      await fetchNotifications();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const clearRead = async () => {
    if (!confirm('Delete all read notifications?')) return;

    try {
      const readNotifications = notifications.filter(n => n.isRead);
      for (const notification of readNotifications) {
        await deleteNotification(notification._id);
      }
      await fetchNotifications();
    } catch (error) {
      console.error('Failed to clear read notifications:', error);
    }
  };

  return (
    <DashboardCard
      title={`Notifications (${unreadCount} unread)`}
      actions={(
        <div className="flex items-center space-x-2">
          <button onClick={() => setFilter('all')} className={`px-2 py-1 text-sm rounded ${filter === 'all' ? 'bg-[#e6efe6] text-[#175017]' : 'bg-white'}`}>All</button>
          <button onClick={() => setFilter('unread')} className={`px-2 py-1 text-sm rounded ${filter === 'unread' ? 'bg-[#e6efe6] text-[#175017]' : 'bg-white'}`}>Unread</button>
          <button onClick={markAllRead} className="px-2 py-1 text-sm rounded bg-white">Mark all read</button>
          <button onClick={clearRead} className="px-2 py-1 text-sm rounded bg-white">Clear read</button>
        </div>
      )}
    >
      <div className="mb-4">
        <input
          placeholder="Search notifications..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-3 py-2 border rounded text-sm"
          style={{ borderColor: '#e6efe6' }}
        />
      </div>

      {loading ? (
        <div className="text-center text-sm text-gray-500 py-8">Loading notifications...</div>
      ) : (
        <div className="space-y-2">
          {visible.length === 0 ? (
            <div className="text-center text-sm text-gray-500 py-8">No notifications</div>
          ) : visible.map(item => (
            <NotificationRow key={item._id} item={item} onToggleRead={toggleRead} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </DashboardCard>
  );
};

export default NotificationsContent;
