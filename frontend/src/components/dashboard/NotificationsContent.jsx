'use client'

// src/components/dashboard/NotificationsContent.jsx
import React, { useState, useMemo } from 'react';
import DashboardCard from '@/components/ui/DashboardCard';
import { Icon, COLORS } from '@/config/utils';

// Mock notifications data - replace with API fetch in real app
const INITIAL_NOTIFICATIONS = [
  { id: 'n1', title: 'New order received', message: 'Order #8341 requires packing.', time: '2h ago', read: false, type: 'order' },
  { id: 'n2', title: 'Payout processed', message: 'Your payout for Sep 2025 has been processed.', time: '1d ago', read: true, type: 'finance' },
  { id: 'n3', title: 'New review', message: 'You received a 5-star review.', time: '3d ago', read: false, type: 'review' },
  { id: 'n4', title: 'Profile approved', message: 'Your vendor profile is now verified.', time: '7d ago', read: true, type: 'system' }
];

const NotificationRow = ({ item, onToggleRead }) => {
  return (
    <div className={`flex items-start gap-4 p-3 rounded hover:bg-gray-50 ${item.read ? '' : 'bg-green-50'}`}>
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
          </div>
          <div className="text-xs text-gray-400">{item.time}</div>
        </div>
      </div>
      <div className="flex-shrink-0 pl-3">
        <button
          onClick={() => onToggleRead(item.id)}
          className={`text-sm px-2 py-1 rounded ${item.read ? 'bg-gray-100' : 'bg-[#175017] text-white'}`}
        >
          {item.read ? 'Mark unread' : 'Mark read'}
        </button>
      </div>
    </div>
  );
};

const NotificationsContent = () => {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const visible = useMemo(() => {
    return notifications.filter(n => {
      if (filter === 'unread' && n.read) return false;
      if (query && !(n.title.toLowerCase().includes(query.toLowerCase()) || n.message.toLowerCase().includes(query.toLowerCase()))) return false;
      return true;
    });
  }, [notifications, filter, query]);

  const toggleRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const clearRead = () => setNotifications(prev => prev.filter(n => !n.read));

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

      <div className="space-y-2">
        {visible.length === 0 ? (
          <div className="text-center text-sm text-gray-500 py-8">No notifications</div>
        ) : visible.map(item => (
          <NotificationRow key={item.id} item={item} onToggleRead={toggleRead} />
        ))}
      </div>
    </DashboardCard>
  );
};

export default NotificationsContent;
