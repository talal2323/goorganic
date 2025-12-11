'use client'

import React from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import NotificationsContent from '@/components/dashboard/NotificationsContent';

const AdminNotificationsPage = () => {
    return (
        <DashboardLayout title="Notifications" userRole="admin">
            <NotificationsContent />
        </DashboardLayout>
    );
};

export default AdminNotificationsPage;
