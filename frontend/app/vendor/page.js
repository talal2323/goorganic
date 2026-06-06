'use client'

import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { DashboardCard, Icon, StarRating } from '@/components/common/UIComponents';
import VendorStatusBanner from '@/components/vendor/VendorStatusBanner';
import { getVendorStats } from '@/utils/vendorApi';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const defaultStats = {
    totalRevenue: 0,
    salesThisMonth: 0,
    pendingOrders: 0,
    totalProducts: 0,
    completedOrders: 0,
    averageRating: 0,
    reviewCount: 0,
    openDisputes: 0,
    resolvedDisputes: 0,
    monthlySales: [],
    topProducts: [],
    disputeSummary: { openDisputes: 0, resolvedDisputes: 0, cancelledOrders: 0 },
};

const formatCurrency = (value) => `PKR ${Number(value || 0).toLocaleString()}`;

const VendorDashboard = () => {
    const { state } = useAppContext();
    const user = state.user || {};
    const vendorStatus = user.vendorStatus;
    const rejectionReason = user.rejectionReason;
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(defaultStats);

    useEffect(() => {
        const loadStats = async () => {
            try {
                setLoading(true);
                const data = await getVendorStats();
                setStats({
                    ...defaultStats,
                    ...data,
                    disputeSummary: data.disputeSummary || defaultStats.disputeSummary,
                });
            } catch (error) {
                setStats(defaultStats);
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, []);

    const maxMonthlySales = Math.max(...(stats.monthlySales || []).map((item) => item.totalSales || 0), 1);
    const topProducts = (stats.topProducts || []).map((product, index) => ({
        id: String(product._id?.toString?.() || product._id || index),
        name: String(product.productName || 'Product'),
        totalUnits: Number(product.totalUnits || 0),
    }));

    return (
        <DashboardLayout title="Vendor Dashboard" userRole="vendor">
            <div className="space-y-8">
                <VendorStatusBanner status={vendorStatus} rejectionReason={rejectionReason} />
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    <DashboardCard title="Total Sales">
                        <p className="text-3xl font-extrabold text-primary">{formatCurrency(stats.totalRevenue)}</p>
                        <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                            <Icon path="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" className="w-4 h-4 text-green-500" color="currentColor" />
                            <span>{loading ? 'Loading analytics...' : `${formatCurrency(stats.salesThisMonth)} this month`}</span>
                        </p>
                    </DashboardCard>
                    <DashboardCard title="Delivered Orders">
                        <p className="text-3xl font-extrabold text-primary">{stats.completedOrders.toLocaleString()}</p>
                        <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                            <Icon path="M12 6v6l4 2" className="w-4 h-4 text-gray-500" color="currentColor" />
                            <span>{stats.pendingOrders} pending approval</span>
                        </p>
                    </DashboardCard>
                    <DashboardCard title="Average Rating">
                        <p className="text-3xl font-extrabold text-primary">{stats.reviewCount > 0 ? stats.averageRating.toFixed(1) : '0.0'}</p>
                        <div className="mt-2 flex items-center gap-2">
                            <StarRating rating={Math.round(stats.averageRating)} size="sm" />
                            <span className="text-sm text-gray-500">{stats.reviewCount} reviews</span>
                        </div>
                    </DashboardCard>
                    <DashboardCard title="Open Disputes">
                        <p className="text-3xl font-extrabold text-red-500">{stats.openDisputes.toLocaleString()}</p>
                        <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                            <Icon path="M12 8v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" className="w-4 h-4 text-red-500" color="currentColor" />
                            <span>{stats.resolvedDisputes} resolved disputes</span>
                        </p>
                    </DashboardCard>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                        <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Monthly Performance</h3>
                        <div className="h-72 rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.monthlySales || []}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                                    <YAxis tickFormatter={(val) => `Rs.${val}`} axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                                    <Tooltip cursor={{fill: '#f3f4f6'}} formatter={(value) => formatCurrency(value)} />
                                    <Bar dataKey="totalSales" fill="#164A26" radius={[4, 4, 0, 0]} maxBarSize={48} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <DashboardCard title="Top Selling Products">
                            <ul className="space-y-4">
                                {topProducts.length === 0 ? (
                                    <li className="text-sm text-gray-500">No sales data yet.</li>
                                ) : (
                                    topProducts.map((product) => (
                                        <li key={product.id} className="flex justify-between items-center text-sm gap-4">
                                            <span className="font-medium text-gray-700">{product.name}</span>
                                            <span className="text-secondary font-bold whitespace-nowrap">{product.totalUnits} units</span>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </DashboardCard>

                        <DashboardCard title="Dispute Resolution">
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Open cases</span>
                                    <span className="font-semibold text-red-600">{stats.disputeSummary.openDisputes}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Resolved disputes</span>
                                    <span className="font-semibold text-gray-900">{stats.resolvedDisputes}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Refund/mediation count</span>
                                    <span className="font-semibold text-gray-900">{stats.disputeSummary.resolvedDisputes || 0}</span>
                                </div>
                            </div>
                        </DashboardCard>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default VendorDashboard;

