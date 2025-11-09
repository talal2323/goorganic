import React from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { DashboardCard, Button } from '@/components/common/UIComponents';
import { COLORS } from '@/utils/config';

const AdminSubscriptionsControl = () => {
    return (
        <DashboardLayout title="Subscriptions Control" userRole="admin">
            <DashboardCard title="Subscription Plans Control">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {['Basic', 'Premium'].map((plan, i) => (
                        <div key={i} className="border-2 rounded-xl p-6 shadow-md" style={{ borderColor: i === 1 ? COLORS.secondary : COLORS.primary }}>
                            <h3 className="text-2xl font-bold" style={{ color: i === 1 ? COLORS.secondary : COLORS.primary }}>{plan}</h3>
                            <p className="text-4xl font-extrabold mt-2">PKR {i === 1 ? '5,000' : '1,000'}</p>
                            <p className="text-sm text-gray-500 mb-4">/ month</p>
                            <ul className="space-y-2 text-sm text-gray-700">
                                <li><span className="font-semibold">Transaction Fee:</span> {i === 1 ? '5%' : '10%'}</li>
                                <li><span className="font-semibold">Product Limit:</span> {i === 1 ? 'Unlimited' : '50'}</li>
                                <li><span className="font-semibold">Support:</span> {i === 1 ? 'Priority' : 'Standard'}</li>
                            </ul>
                            <Button primary={false} className="mt-6 w-full text-sm" onClick={(e) => { e.preventDefault(); console.log(`Editing ${plan} Plan`); }}>Edit Plan Details</Button>
                        </div>
                    ))}
                </div>
            </DashboardCard>
        </DashboardLayout>
    );
};

export default AdminSubscriptionsControl;
