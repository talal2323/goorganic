'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button, DashboardCard } from '@/components/common/UIComponents';
import { getAdminAnalyticsOverview, updateDisputeStatus } from '@/utils/adminApi';
import { showToast } from '@/utils/toast';

const defaultAnalytics = {
    disputeSummary: {
        openDisputes: 0,
        resolvedDisputes: 0,
        rejectedDisputes: 0,
    },
    disputeCases: [],
};

const DisputesPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState(defaultAnalytics);
    const [selectedDispute, setSelectedDispute] = useState(null);
    const [resolutionForm, setResolutionForm] = useState({ status: 'Under Review', resolutionNotes: '', refundPoints: 0 });
    const [submitting, setSubmitting] = useState(false);

    const handleResolveSubmit = async () => {
        try {
            setSubmitting(true);
            await updateDisputeStatus(selectedDispute.id, resolutionForm.status, resolutionForm.resolutionNotes, resolutionForm.refundPoints);
            showToast.success('Dispute resolved successfully');
            setSelectedDispute(null);
            const data = await getAdminAnalyticsOverview();
            setAnalytics({
                ...defaultAnalytics,
                ...data,
                disputeSummary: data.disputeSummary || defaultAnalytics.disputeSummary,
                disputeCases: data.disputeCases || [],
            });
        } catch (error) {
            showToast.error(error.response?.data?.message || 'Failed to resolve dispute');
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        const loadDisputes = async () => {
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

        loadDisputes();
    }, []);

    return (
        <DashboardLayout title="Disputes" userRole="admin">
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <DashboardCard className="p-6">
                        <p className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-2">Open disputes</p>
                        <div className="text-4xl font-black text-red-600">{analytics.disputeSummary.openDisputes}</div>
                    </DashboardCard>
                    <DashboardCard className="p-6">
                        <p className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-2">Resolved disputes</p>
                        <div className="text-4xl font-black text-primary">{analytics.disputeSummary.resolvedDisputes}</div>
                    </DashboardCard>
                    <DashboardCard className="p-6">
                        <p className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-2">Rejected disputes</p>
                        <div className="text-4xl font-black text-secondary">{analytics.disputeSummary.rejectedDisputes}</div>
                    </DashboardCard>
                    <DashboardCard className="p-6">
                        <p className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-2">Queue items</p>
                        <div className="text-4xl font-black text-gray-900">{analytics.disputeSummary.openDisputes}</div>
                    </DashboardCard>
                </div>

                <DashboardCard title="Resolution Queue" className="p-6">
                    {loading ? (
                        <div className="py-10 text-center text-gray-500">Loading disputes...</div>
                    ) : analytics.disputeCases.length === 0 ? (
                        <div className="py-10 text-center text-gray-500">No disputes require attention right now.</div>
                    ) : (
                        <div className="space-y-4">
                            {analytics.disputeCases.map((item) => (
                                <div key={`${item.type}-${item.id}`} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
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
                                        <div className="flex gap-3">
                                            {item.status !== 'Resolved' && item.status !== 'Rejected' && (
                                                <Button primary={false} onClick={() => {
                                                    setSelectedDispute(item);
                                                    setResolutionForm({ status: item.status || 'Under Review', resolutionNotes: '', refundPoints: 0 });
                                                }}>Resolve Dispute</Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </DashboardCard>
            </div>

            {selectedDispute && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
                        <h2 className="mb-4 text-2xl font-bold text-gray-900">Resolve Dispute</h2>
                        
                        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-semibold text-gray-700">Dispute Details</p>
                                <p className="mt-1 text-sm text-gray-600"><strong>Customer:</strong> {selectedDispute.customer}</p>
                                <p className="mt-1 text-sm text-gray-600"><strong>Vendor:</strong> {selectedDispute.vendor}</p>
                                <p className="mt-1 text-sm text-gray-600"><strong>Type:</strong> {selectedDispute.type}</p>
                                <p className="mt-1 text-sm text-gray-600"><strong>Reason:</strong> {selectedDispute.reason}</p>
                            </div>
                            <div>
                                {selectedDispute.proofImage?.url && (
                                    <>
                                        <p className="text-sm font-semibold text-gray-700 mb-2">Customer Proof</p>
                                        <div className="relative h-32 w-full rounded-lg overflow-hidden border border-gray-200">
                                            <Image src={selectedDispute.proofImage.url} alt="Proof" fill className="object-contain bg-gray-50" />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {selectedDispute.vendorComment && (
                            <div className="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-100">
                                <p className="text-sm font-bold text-emerald-900 mb-1">Vendor's Comment</p>
                                <p className="text-sm text-emerald-800 whitespace-pre-wrap">{selectedDispute.vendorComment}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <label className="block">
                                <span className="text-sm font-medium text-gray-700">Update Status</span>
                                <select
                                    value={resolutionForm.status}
                                    onChange={(e) => setResolutionForm({ ...resolutionForm, status: e.target.value })}
                                    className="mt-1 block w-full rounded-lg border border-gray-300 p-2 text-sm"
                                >
                                    <option value="Open">Open</option>
                                    <option value="Under Review">Under Review</option>
                                    <option value="Resolved">Resolved</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                            </label>

                            <label className="block">
                                <span className="text-sm font-medium text-gray-700">Refund Amount (Loyalty Points)</span>
                                <input
                                    type="number"
                                    min="0"
                                    value={resolutionForm.refundPoints}
                                    onChange={(e) => setResolutionForm({ ...resolutionForm, refundPoints: e.target.value })}
                                    className="mt-1 block w-full rounded-lg border border-gray-300 p-2 text-sm"
                                    placeholder="e.g. 500"
                                />
                                <p className="mt-1 text-xs text-gray-500">1 Point = Rs. 1. Points will be added to the customer's wallet if status is set to Resolved.</p>
                            </label>

                            <label className="block">
                                <span className="text-sm font-medium text-gray-700">Resolution Notes (Optional)</span>
                                <textarea
                                    value={resolutionForm.resolutionNotes}
                                    onChange={(e) => setResolutionForm({ ...resolutionForm, resolutionNotes: e.target.value })}
                                    rows={3}
                                    className="mt-1 block w-full rounded-lg border border-gray-300 p-2 text-sm"
                                    placeholder="Explain the resolution..."
                                />
                            </label>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <Button primary={false} onClick={() => setSelectedDispute(null)}>Cancel</Button>
                            <Button onClick={handleResolveSubmit} disabled={submitting}>
                                {submitting ? 'Saving...' : 'Save Resolution'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default DisputesPage;

