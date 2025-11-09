import React from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { DashboardCard } from '@/components/common/UIComponents';

const AdminAnalytics = () => {
    return (
        <DashboardLayout title="Analytics & Reports" userRole="admin">
            <DashboardCard title="Platform Analytics" className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DashboardCard title="Sales by Category" className="!p-4 border border-gray-100">
                        <img
                            src="https://placehold.co/400x200/DBE9DB/164A26?text=Pie+Chart+Placeholder"
                            alt="Category Pie Chart"
                            className="w-full h-48 object-cover rounded-lg"
                        />
                    </DashboardCard>
                    <DashboardCard title="Vendor Performance" className="!p-4 border border-gray-100">
                        <ul className="space-y-3 text-sm">
                            <li className="flex justify-between items-center"><span>Top Vendor (Sales)</span><span className="font-semibold text-secondary">Green Valley Farms</span></li>
                            <li className="flex justify-between items-center"><span>Lowest Rated Vendor</span><span className="font-semibold text-red-500">XYZ Organics</span></li>
                            <li className="flex justify-between items-center"><span>Average Rating</span><span className="font-semibold text-primary">4.6 Stars</span></li>
                        </ul>
                    </DashboardCard>
                </div>
                <DashboardCard title="Customer Demographics" className="!p-4 border border-gray-100">
                    <img
                        src="https://placehold.co/800x200/DBE9DB/164A26?text=Customer+Demographics+Bar+Chart"
                        alt="Demographics Bar Chart"
                        className="w-full h-48 object-cover rounded-lg"
                    />
                </DashboardCard>
            </DashboardCard>
        </DashboardLayout>
    );
};

export default AdminAnalytics;
