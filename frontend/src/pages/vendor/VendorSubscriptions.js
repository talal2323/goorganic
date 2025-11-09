import React from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { DashboardCard, Button, Icon } from '@/components/common/UIComponents';

const VendorSubscriptions = () => {
    return (
        <DashboardLayout title="Subscriptions" userRole="vendor">
            <DashboardCard title="Manage Your Subscription">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Current Plan Card */}
                    <div className="md:col-span-1 bg-green-50 rounded-xl p-6 border-2 border-secondary shadow-lg">
                        <h3 className="text-lg font-bold text-gray-800">Current Plan</h3>
                        <p className="text-4xl font-extrabold text-secondary mt-2 mb-4">PREMIUM</p>
                        <p className="text-sm text-gray-600">PKR 5,000 / month</p>
                        <p className="text-xs text-gray-500 mt-1">Next Bill Date: 15/12/2025</p>
                        <Button className="mt-6 w-full text-sm" primary={false}>Cancel Subscription</Button>
                    </div>

                    {/* Features List */}
                    <div className="md:col-span-2 space-y-4">
                        <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Plan Features</h3>
                        <ul className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                            <li className="flex items-center"><Icon path="M5 13l4 4L19 7" className="w-4 h-4 mr-2 text-secondary" color="currentColor" />Unlimited Product Listings</li>
                            <li className="flex items-center"><Icon path="M5 13l4 4L19 7" className="w-4 h-4 mr-2 text-secondary" color="currentColor" />Priority Featured Placement</li>
                            <li className="flex items-center"><Icon path="M5 13l4 4L19 7" className="w-4 h-4 mr-2 text-secondary" color="currentColor" />Direct Customer Chat</li>
                            <li className="flex items-center"><Icon path="M5 13l4 4L19 7" className="w-4 h-4 mr-2 text-secondary" color="currentColor" />Dedicated Support Manager</li>
                            <li className="flex items-center"><Icon path="M5 13l4 4L19 7" className="w-4 h-4 mr-2 text-secondary" color="currentColor" />Advanced Analytics</li>
                            <li className="flex items-center"><Icon path="M5 13l4 4L19 7" className="w-4 h-4 mr-2 text-secondary" color="currentColor" />Low Transaction Fee (5%)</li>
                        </ul>
                        <div className="pt-4 border-t mt-6">
                            <h4 className="font-semibold text-gray-800 mb-2">Need to Downgrade?</h4>
                            <Button primary={false} onClick={(e) => { e.preventDefault(); console.log('Downgrade flow initiated'); }}>
                                Switch to Basic Plan (10% fee, 50 products)
                            </Button>
                        </div>
                    </div>
                </div>
            </DashboardCard>
        </DashboardLayout>
    );
};

export default VendorSubscriptions;
