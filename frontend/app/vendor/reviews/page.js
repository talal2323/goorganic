'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { DashboardCard, StarRating, Icon } from '@/components/common/UIComponents';
import { getVendorOrderReviews } from '@/utils/orderReviewApi';
import { showToast } from '@/utils/toast';

const VendorRatingsReviews = () => {
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [summary, setSummary] = useState({ averageRating: 0, reviewCount: 0, ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const data = await getVendorOrderReviews();
            setReviews(data.reviews || []);
            setSummary({
                averageRating: data.averageRating || 0,
                reviewCount: data.reviewCount || 0,
                ratingBreakdown: data.ratingBreakdown || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            });
        } catch (error) {
            showToast.error(error.response?.data?.message || 'Failed to load vendor reviews');
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    const recentReviewsCount = reviews.filter(
        (r) => new Date() - new Date(r.createdAt) <= 24 * 60 * 60 * 1000
    ).length;

    return (
        <DashboardLayout title="Ratings & Reviews" userRole="vendor">
            <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <DashboardCard className="p-6">
                        <p className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-2">Average rating</p>
                        <div className="flex items-end gap-3">
                            <span className="text-5xl font-black text-primary">{summary.reviewCount > 0 ? summary.averageRating.toFixed(1) : '0.0'}</span>
                            <span className="pb-2 text-sm text-gray-500">/ 5</span>
                        </div>
                        <div className="mt-3 flex items-center gap-3">
                            <StarRating rating={Math.round(summary.averageRating)} />
                            <span className="text-sm text-gray-500">{summary.reviewCount} review{summary.reviewCount === 1 ? '' : 's'}</span>
                        </div>
                    </DashboardCard>

                    <DashboardCard className="p-6">
                        <p className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-4">Rating spread</p>
                        <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((score) => {
                                const count = summary.ratingBreakdown?.[score] || 0;
                                const width = summary.reviewCount > 0 ? (count / summary.reviewCount) * 100 : 0;
                                return (
                                    <div key={score} className="flex items-center gap-2 text-sm">
                                        <span className="w-4 text-gray-600">{score}</span>
                                        <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                                            <div className="h-full rounded-full bg-secondary" style={{ width: `${width}%` }} />
                                        </div>
                                        <span className="w-6 text-right text-gray-500">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </DashboardCard>

                    <DashboardCard className="p-6">
                        <p className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-2">Recent feedback</p>
                        <div className="text-4xl font-black text-secondary">{recentReviewsCount}</div>
                        <p className="mt-2 text-sm text-gray-500">From the past 24 hours</p>
                    </DashboardCard>
                </div>

                <DashboardCard title="Customer Ratings & Reviews" className="p-6">
                    {loading ? (
                        <div className="py-10 text-center text-gray-500">Loading reviews...</div>
                    ) : reviews.length === 0 ? (
                        <div className="py-10 text-center text-gray-500">
                            <Icon path="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.192-2.058-.573-3.016z" className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p className="font-medium text-gray-700">No reviews yet</p>
                            <p className="text-sm text-gray-500 mt-1">When customers leave feedback, it will appear here.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reviews.map((review, idx) => (
                                <article key={review.itemId || review._id || idx} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-semibold">
                                                    {review.customerName?.[0]?.toUpperCase() || 'C'}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{review.customerName || 'Customer'}</p>
                                                    <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
                                                </div>
                                            </div>
                                            {review.productName && (
                                                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                                                    <span className="rounded-full bg-gray-100 px-2.5 py-1 font-medium text-gray-700">
                                                        {review.productName}
                                                    </span>
                                                </div>
                                            )}
                                            {review.comment && <p className="text-sm text-gray-700 leading-6">{review.comment}</p>}
                                        </div>
                                        <div className="shrink-0">
                                            <StarRating rating={review.rating} />
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </DashboardCard>
            </div>
        </DashboardLayout>
    );
};

export default VendorRatingsReviews;