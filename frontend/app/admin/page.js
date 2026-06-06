'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { DashboardCard, Button } from '@/components/common/UIComponents';
import { getAdminDashboardStats } from '@/utils/adminApi';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const defaultStats = {
    totalVendors: 0,
    pendingVendors: 0,
    totalCustomers: 0,
    totalProducts: 0,
    totalSales: 0,
    newOrdersToday: 0,
    openDisputes: 0,
    resolvedDisputes: 0,
    resolutionRate: 0,
    salesByMonth: [],
};

const formatCurrency = (value) => `PKR ${Number(value || 0).toLocaleString()}`;

const AdminDashboard = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(defaultStats);

    useEffect(() => {
        const loadStats = async () => {
            try {
                setLoading(true);
                const data = await getAdminDashboardStats();
                setStats({ ...defaultStats, ...data });
            } catch (error) {
                setStats(defaultStats);
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, []);

    return (
        <DashboardLayout title="Admin Dashboard" userRole="admin">
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
                    <DashboardCard title="Total Vendors">
                        <p className="text-3xl font-extrabold text-primary">{stats.totalVendors.toLocaleString()}</p>
                        <p className="text-sm text-gray-500 mt-2">{stats.pendingVendors} pending approval</p>
                    </DashboardCard>
                    <DashboardCard title="Total Customers">
                        <p className="text-3xl font-extrabold text-primary">{stats.totalCustomers.toLocaleString()}</p>
                        <p className="text-sm text-gray-500 mt-2">Platform-wide customer base</p>
                    </DashboardCard>
                    <DashboardCard title="Revenue (YTD)">
                        <p className="text-3xl font-extrabold text-secondary">{formatCurrency(stats.totalSales)}</p>
                        <p className="text-sm text-gray-500 mt-2">{stats.newOrdersToday} new orders today</p>
                    </DashboardCard>
                    <DashboardCard title="Open Disputes">
                        <p className="text-3xl font-extrabold text-red-500">{stats.openDisputes.toLocaleString()}</p>
                        <p className="text-sm text-gray-500 mt-2">{stats.resolvedDisputes} resolved cases</p>
                    </DashboardCard>
                    <DashboardCard title="Resolution Rate">
                        <p className="text-3xl font-extrabold text-primary">{stats.resolutionRate}%</p>
                        <p className="text-sm text-gray-500 mt-2">Disputes closed by moderation</p>
                    </DashboardCard>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                        <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Platform Activity</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
                                <p className="text-xs uppercase tracking-[0.18em] text-gray-500 mb-2">Product catalog</p>
                                <p className="text-2xl font-black text-primary">{stats.totalProducts.toLocaleString()}</p>
                                <p className="text-sm text-gray-500 mt-2">Listed products across all vendors</p>
                            </div>
                            <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
                                <p className="text-xs uppercase tracking-[0.18em] text-gray-500 mb-2">Order flow</p>
                                <p className="text-2xl font-black text-secondary">{stats.newOrdersToday.toLocaleString()}</p>
                                <p className="text-sm text-gray-500 mt-2">Orders received since midnight</p>
                            </div>
                            <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
                                <p className="text-xs uppercase tracking-[0.18em] text-gray-500 mb-2">Dispute health</p>
                                <p className="text-2xl font-black text-red-600">{stats.openDisputes.toLocaleString()}</p>
                                <p className="text-sm text-gray-500 mt-2">Cases awaiting or needing review</p>
                            </div>
                        </div>
                        <div className="mt-6 rounded-xl border border-gray-100 bg-gradient-to-r from-emerald-50 to-lime-50 p-5">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm uppercase tracking-[0.18em] text-gray-500">Platform summary</p>
                                    <h4 className="text-lg font-semibold text-gray-800">Analytics and dispute resolution at a glance</h4>
                                </div>
                                <div className="flex gap-3">
                                    <Button primary={false} onClick={() => router.push('/admin/analytics')}>Open Analytics</Button>
                                    <Button onClick={() => router.push('/admin/disputes')}>Review Disputes</Button>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50 p-4">
                            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500 mb-4">Revenue trend</h4>
                            <div className="h-64 rounded-lg bg-white border border-gray-200 p-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.salesByMonth || []}>
                                        <defs>
                                            <linearGradient id="colorSalesAdmin" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#4CAF50" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                                        <YAxis tickFormatter={(val) => `Rs.${val}`} axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                                        <Tooltip formatter={(value) => formatCurrency(value)} />
                                        <Area type="monotone" dataKey="totalSales" stroke="#164A26" fillOpacity={1} fill="url(#colorSalesAdmin)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                    <DashboardCard title="Latest Vendor Approvals">
                        <ul className="space-y-3 text-sm">
                            <li className="flex justify-between items-center"><span>Pending vendors</span><span className="text-yellow-500">{stats.pendingVendors}</span></li>
                            <li className="flex justify-between items-center"><span>Resolved disputes</span><span className="text-secondary">{stats.resolvedDisputes}</span></li>
                            <li className="flex justify-between items-center"><span>Analytics refresh</span><span className="text-primary">Live</span></li>
                        </ul>
                        <Button primary={false} className="mt-6 w-full text-sm" onClick={() => router.push('/admin/users-vendors')}>Review All</Button>
                    </DashboardCard>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;

