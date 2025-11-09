import React from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import NotificationsContent from '../../components/dashboard/NotificationsContent';

const VendorNotificationsPage = () => {
    return (
        <DashboardLayout title="Notifications" userRole="vendor">
            <NotificationsContent />
        </DashboardLayout>
    );
};

export default VendorNotificationsPage;
