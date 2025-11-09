'use client'

import React from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { DashboardCard, Button } from '@/components/common/UIComponents';
import { useAppContext } from '@/context/AppContext';

const AdminDashboard = () => {
    const { dispatch } = useAppContext();
    return (
        <DashboardLayout title="Admin Dashboard" userRole="admin">
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <DashboardCard title="Total Vendors">
                        <p className="text-3xl font-extrabold text-primary">245</p>
                        <p className="text-sm text-gray-500 mt-2">New: 15 this month</p>
                    </DashboardCard>
                    <DashboardCard title="Total Customers">
                        <p className="text-3xl font-extrabold text-primary">12,400</p>
                        <p className="text-sm text-gray-500 mt-2">Active: 4,500</p>
                    </DashboardCard>
                    <DashboardCard title="Revenue (YTD)">
                        <p className="text-3xl font-extrabold text-secondary">PKR 12M</p>
                        <p className="text-sm text-gray-500 mt-2">Target: 15M</p>
                    </DashboardCard>
                    <DashboardCard title="Pending Approvals">
                        <p className="text-3xl font-extrabold text-red-500">22</p>
                        <p className="text-sm text-gray-500 mt-2">Vendors & Products</p>
                    </DashboardCard>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                        <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Platform Activity</h3>
                        <div className="h-64 flex flex-col items-center justify-center bg-gray-50 rounded-lg border border-gray-200 p-4">
                            <img
                                src="https://placehold.co/800x250/E9F5E9/164A26?text=Admin+Traffic+and+Sales+Chart"
                                alt="Admin Chart"
                                className="w-full h-full object-cover rounded-lg"
                            />
                        </div>
                    </div>
                    <DashboardCard title="Latest Vendor Approvals">
                        <ul className="space-y-3 text-sm">
                            <li className="flex justify-between items-center"><span>FarmFresh Organics</span><span className="text-secondary">Approved</span></li>
                            <li className="flex justify-between items-center"><span>Herbal Health Co.</span><span className="text-yellow-500">Pending</span></li>
                            <li className="flex justify-between items-center"><span>The Spice Route</span><span className="text-primary">New</span></li>
                        </ul>
                        <Button primary={false} className="mt-6 w-full text-sm" onClick={() => dispatch({ type: 'SET_PAGE', payload: 'AdminUsersVendors' })}>Review All</Button>
                    </DashboardCard>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;
