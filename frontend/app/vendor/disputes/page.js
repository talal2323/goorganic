'use client'

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button, DashboardCard } from '@/components/common/UIComponents';
import { getVendorDisputes, addVendorComment } from '@/utils/disputeApi';
import { showToast } from '@/utils/toast';

const VendorDisputesPage = () => {
    const [disputes, setDisputes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(null);
    const [commentForms, setCommentForms] = useState({});

    useEffect(() => {
        loadDisputes();
    }, []);

    const loadDisputes = async () => {
        try {
            setLoading(true);
            const data = await getVendorDisputes();
            setDisputes(data || []);
        } catch (error) {
            console.error('Error fetching vendor disputes:', error);
            showToast.error('Failed to load disputes');
        } finally {
            setLoading(false);
        }
    };

    const handleCommentChange = (id, value) => {
        setCommentForms({ ...commentForms, [id]: value });
    };

    const handleSubmitComment = async (disputeId) => {
        const comment = commentForms[disputeId];
        if (!comment || !comment.trim()) {
            showToast.error('Please enter a comment');
            return;
        }

        try {
            setSubmitting(disputeId);
            await addVendorComment(disputeId, comment);
            showToast.success('Comment added successfully');
            await loadDisputes();
            // Clear form
            setCommentForms({ ...commentForms, [disputeId]: '' });
        } catch (error) {
            showToast.error(error.response?.data?.message || 'Failed to add comment');
        } finally {
            setSubmitting(null);
        }
    };

    return (
        <DashboardLayout title="Disputes" userRole="vendor">
            <div className="space-y-6 max-w-5xl mx-auto">
                <DashboardCard title="Disputes Against Your Shop" className="p-6">
                    {loading ? (
                        <div className="py-10 text-center text-gray-500">Loading disputes...</div>
                    ) : disputes.length === 0 ? (
                        <div className="py-10 text-center text-gray-500">
                            No disputes have been raised against your shop. Keep up the good work!
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {disputes.map((dispute) => (
                                <div key={dispute._id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                    dispute.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                                                    dispute.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {dispute.status}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    Raised on {new Date(dispute.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900">{dispute.subject}</h3>
                                            <p className="text-sm text-gray-600 mt-1">Issue Type: <span className="font-medium text-gray-800">{dispute.issueType}</span></p>
                                        </div>
                                        <div className="text-left md:text-right">
                                            <p className="text-sm text-gray-500">Related Order</p>
                                            <p className="font-semibold text-gray-900">{dispute.order?.orderNumber || dispute.order?._id.slice(-8).toUpperCase()}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                        <div className="md:col-span-2">
                                            <p className="text-sm font-semibold text-gray-700 mb-1">Customer's Description</p>
                                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 whitespace-pre-wrap">
                                                {dispute.description}
                                            </p>
                                        </div>
                                        {dispute.proofImage?.url && (
                                            <div>
                                                <p className="text-sm font-semibold text-gray-700 mb-1">Customer Proof</p>
                                                <div className="relative h-24 w-full rounded-lg overflow-hidden border border-gray-200">
                                                    <Image src={dispute.proofImage.url} alt="Proof" fill sizes="200px" className="object-cover" />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Vendor Comment Section */}
                                    <div className="border-t border-gray-100 pt-4 mt-4">
                                        {dispute.vendorComment ? (
                                            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg">
                                                <div className="flex justify-between items-center mb-1">
                                                    <p className="text-sm font-bold text-emerald-900">Your Comment</p>
                                                    <span className="text-xs text-emerald-700">
                                                        {dispute.vendorCommentAt ? new Date(dispute.vendorCommentAt).toLocaleDateString() : ''}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-emerald-800 whitespace-pre-wrap">{dispute.vendorComment}</p>
                                            </div>
                                        ) : (
                                            <div>
                                                {['Open', 'Under Review'].includes(dispute.status) ? (
                                                    <div className="space-y-3">
                                                        <label className="block text-sm font-semibold text-gray-700">Add Your Comment (Only visible to Admin)</label>
                                                        <textarea
                                                            value={commentForms[dispute._id] || ''}
                                                            onChange={(e) => handleCommentChange(dispute._id, e.target.value)}
                                                            placeholder="Explain your side of the story to the admin..."
                                                            rows={3}
                                                            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                                                        />
                                                        <Button 
                                                            onClick={() => handleSubmitComment(dispute._id)} 
                                                            disabled={submitting === dispute._id || !commentForms[dispute._id]?.trim()}
                                                        >
                                                            {submitting === dispute._id ? 'Submitting...' : 'Submit Comment'}
                                                        </Button>
                                                        <p className="text-xs text-gray-500">Note: You can only submit your comment once. Please ensure it contains all necessary details.</p>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-500 italic">This dispute has been closed. Comments are no longer allowed.</p>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Resolution Notes */}
                                    {dispute.resolutionNotes && (
                                        <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-100">
                                            <p className="text-sm font-bold text-blue-900 mb-1">Admin Resolution Update</p>
                                            <p className="text-sm text-blue-800 whitespace-pre-wrap">{dispute.resolutionNotes}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </DashboardCard>
            </div>
        </DashboardLayout>
    );
};

export default VendorDisputesPage;
