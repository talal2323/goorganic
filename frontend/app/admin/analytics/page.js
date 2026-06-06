'use client'

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button, DashboardCard, StarRating } from '@/components/common/UIComponents';
import { getAdminAnalyticsOverview } from '@/utils/adminApi';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const defaultAnalytics = {
    salesByMonth: [],
    categorySales: [],
    vendorPerformance: [],
    lowestRatedVendors: [],
    disputeSummary: {
        openDisputes: 0,
        resolvedDisputes: 0,
        rejectedDisputes: 0,
    },
    disputeCases: [],
};

const formatCurrency = (value) => `PKR ${Number(value || 0).toLocaleString()}`;

const AdminAnalytics = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState(defaultAnalytics);

    useEffect(() => {
        const loadAnalytics = async () => {
            try {
                setLoading(true);
                const data = await getAdminAnalyticsOverview();
                setAnalytics({
                    ...defaultAnalytics,
                    ...data,
                    disputeSummary: data.disputeSummary || defaultAnalytics.disputeSummary,
                    disputeCases: data.disputeCases || [],
                });
            } catch (error) {
                setAnalytics(defaultAnalytics);
            } finally {
                setLoading(false);
            }
        };

        loadAnalytics();
    }, []);

    const maxSales = Math.max(...(analytics.salesByMonth || []).map((item) => item.totalSales || 0), 1);
    const maxCategorySales = Math.max(...(analytics.categorySales || []).map((item) => item.totalSales || 0), 1);
    const topVendor = analytics.vendorPerformance?.[0];

    return (
        <DashboardLayout title="Analytics & Reports" userRole="admin">
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    <DashboardCard className="p-6">
                        <p className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-2">Open disputes</p>
                        <div className="text-4xl font-black text-red-600">{analytics.disputeSummary.openDisputes}</div>
                        <p className="mt-2 text-sm text-gray-500">Cases requiring review</p>
                    </DashboardCard>
                    <DashboardCard className="p-6">
                        <p className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-2">Resolved disputes</p>
                        <div className="text-4xl font-black text-primary">{analytics.disputeSummary.resolvedDisputes}</div>
                        <p className="mt-2 text-sm text-gray-500">Closed after investigation</p>
                    </DashboardCard>
                    <DashboardCard className="p-6">
                        <p className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-2">Rejected disputes</p>
                        <div className="text-4xl font-black text-secondary">{analytics.disputeSummary.rejectedDisputes}</div>
                        <p className="mt-2 text-sm text-gray-500">Claims closed without escalation</p>
                    </DashboardCard>
                    <DashboardCard className="p-6">
                        <p className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-2">Active queue</p>
                        <div className="text-4xl font-black text-gray-900">{analytics.disputeSummary.openDisputes}</div>
                        <p className="mt-2 text-sm text-gray-500">Recent disputes loaded</p>
                    </DashboardCard>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <DashboardCard title="Sales by Month" className="xl:col-span-2 p-6">
                        <div className="h-72 rounded-xl border border-gray-100 bg-gray-50 p-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={analytics.salesByMonth || []}>
                                    <defs>
                                        <linearGradient id="colorSalesAnalytics" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#4CAF50" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                                    <YAxis tickFormatter={(val) => `Rs.${val}`} axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                    <Area type="monotone" dataKey="totalSales" stroke="#164A26" fillOpacity={1} fill="url(#colorSalesAnalytics)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </DashboardCard>

                    <DashboardCard title="Platform Snapshot" className="p-6 space-y-4">
                        <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
                            <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2">Top vendor</p>
                            <p className="text-lg font-semibold text-gray-900">{topVendor?.shopName || 'No vendor yet'}</p>
                            <p className="text-sm text-gray-500 mt-1">{formatCurrency(topVendor?.totalSales)} in sales</p>
                        </div>
                        <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
                            <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2">Resolution workflow</p>
                            <p className="text-lg font-semibold text-gray-900">{analytics.disputeSummary.openDisputes} active cases</p>
                            <p className="text-sm text-gray-500 mt-1">Open the queue to close or investigate disputes.</p>
                        </div>
                        <div className="flex gap-3">
                            <Button primary={false} className="flex-1" onClick={() => router.push('/admin/disputes')}>Open Queue</Button>
                            <Button className="flex-1" onClick={() => router.push('/admin/reviews')}>Reviews</Button>
                        </div>
                    </DashboardCard>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <DashboardCard title="Sales by Category" className="p-6">
                        <div className="space-y-3">
                            {(analytics.categorySales || []).length === 0 ? (
                                <p className="text-sm text-gray-500">No category sales data yet.</p>
                            ) : (
                                analytics.categorySales.map((item) => {
                                    const width = (item.totalSales / maxCategorySales) * 100;
                                    return (
                                        <div key={item._id}>
                                            <div className="mb-1 flex items-center justify-between text-sm">
                                                <span className="font-medium text-gray-700">{item._id}</span>
                                                <span className="text-gray-500">{formatCurrency(item.totalSales)}</span>
                                            </div>
                                            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                                                <div className="h-full rounded-full bg-secondary" style={{ width: `${Math.max(width, 8)}%` }} />
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </DashboardCard>

                    <DashboardCard title="Vendor Performance" className="p-6">
                        <div className="space-y-4">
                            {(analytics.vendorPerformance || []).length === 0 ? (
                                <p className="text-sm text-gray-500">No vendor performance data yet.</p>
                            ) : (
                                analytics.vendorPerformance.slice(0, 5).map((vendor) => (
                                    <div key={vendor.vendorId?.toString?.() || vendor.shopName} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <p className="font-semibold text-gray-900">{vendor.shopName || 'Vendor'}</p>
                                                <p className="text-sm text-gray-500">{formatCurrency(vendor.totalSales)} in sales</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-primary">{vendor.averageRating ? vendor.averageRating.toFixed(1) : '0.0'} / 5</p>
                                                <p className="text-xs text-gray-500">{vendor.reviewCount} reviews</p>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex items-center justify-between gap-3 text-sm text-gray-600">
                                            <StarRating rating={Math.round(vendor.averageRating || 0)} size="sm" />
                                            <span>{vendor.totalOrders} delivered orders</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </DashboardCard>
                </div>

                <DashboardCard title="Dispute Resolution Queue" className="p-6">
                    {loading ? (
                        <div className="py-10 text-center text-gray-500">Loading analytics...</div>
                    ) : analytics.disputeCases.filter(d => ['Open', 'Under Review'].includes(d.status)).length === 0 ? (
                        <div className="py-10 text-center text-gray-500">No active disputes right now.</div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {analytics.disputeCases.filter(d => ['Open', 'Under Review'].includes(d.status)).map((item) => (
                                <div key={`${item.type}-${item.id}`} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.severity === 'high' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {item.type}
                                                </span>
                                                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                                                    {item.vendor}
                                                </span>
                                            </div>
                                            <h4 className="font-semibold text-gray-900">{item.title}</h4>
                                            <p className="mt-2 text-sm text-gray-600">{item.reason}</p>
                                            <p className="mt-1 text-xs text-gray-500">Customer: {item.customer} · {new Date(item.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex gap-3 lg:justify-end">
                                            <Button primary={false} onClick={() => router.push(item.link)}>Review</Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </DashboardCard>
            </div>
        </DashboardLayout>
    );
};

export default AdminAnalytics;

