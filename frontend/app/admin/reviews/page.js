'use client';

import React, { useEffect, useRef, useState } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button, DashboardCard, StarRating, Icon } from '@/components/common/UIComponents';
import { deleteOrderReview, getAdminOrderReviews, updateOrderReviewStatus } from '@/utils/orderReviewApi';
import { showToast } from '@/utils/toast';

const AdminReviewsPage = () => {
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [summary, setSummary] = useState({ averageRating: 0, reviewCount: 0, totalReviews: 0, ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({ keyword: '', status: '', rating: '' });
    const [busyId, setBusyId] = useState(null);
    const lastRequestKeyRef = useRef('');

    useEffect(() => {
        fetchReviews();
    }, [page]);

    const fetchReviews = async (targetPage = page) => {
        try {
            setLoading(true);
            const params = { page: targetPage };
            if (filters.keyword) params.keyword = filters.keyword;
            if (filters.status) params.status = filters.status;
            if (filters.rating) params.rating = filters.rating;

            const requestKey = JSON.stringify(params);
            if (lastRequestKeyRef.current === requestKey) {
                return;
            }
            lastRequestKeyRef.current = requestKey;

            const data = await getAdminOrderReviews(params);
            setReviews(data.reviews || []);
            setTotalPages(data.totalPages || 1);
            setSummary({
                averageRating: data.averageRating || 0,
                reviewCount: data.reviewCount || 0,
                totalReviews: data.totalReviews || 0,
                ratingBreakdown: data.ratingBreakdown || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            });
        } catch (error) {
            showToast.error(error.response?.data?.message || 'Failed to load reviews');
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = async (event) => {
        event.preventDefault();
        setPage(1);
        await fetchReviews(1);
    };

    const handleDelete = async (reviewId) => {
        if (!window.confirm('Delete this review permanently?')) return;

        try {
            setBusyId(reviewId);
            await deleteOrderReview(reviewId);
            showToast.success('Review deleted successfully');
            await fetchReviews();
        } catch (error) {
            showToast.error(error.response?.data?.message || 'Failed to delete review');
        } finally {
            setBusyId(null);
        }
    };

    const toggleStatus = async (review) => {
        const nextStatus = review.status === 'Published' ? 'Hidden' : 'Published';
        const hiddenReason = nextStatus === 'Hidden' ? window.prompt('Optional reason for hiding this review:') || '' : '';

        try {
            setBusyId(review._id);
            await updateOrderReviewStatus(review._id, nextStatus, hiddenReason);
            showToast.success(`Review marked as ${nextStatus.toLowerCase()}`);
            await fetchReviews();
        } catch (error) {
            showToast.error(error.response?.data?.message || 'Failed to update review status');
        } finally {
            setBusyId(null);
        }
    };

    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    return (
        <DashboardLayout title="Reviews" userRole="admin">
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <DashboardCard className="p-6">
                        <p className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-2">Average rating</p>
                        <div className="text-4xl font-black text-primary">{summary.reviewCount > 0 ? summary.averageRating.toFixed(1) : '0.0'}</div>
                        <p className="mt-2 text-sm text-gray-500">Across published reviews</p>
                    </DashboardCard>
                    <DashboardCard className="p-6">
                        <p className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-2">Published reviews</p>
                        <div className="text-4xl font-black text-secondary">{summary.reviewCount}</div>
                        <p className="mt-2 text-sm text-gray-500">Visible to customers</p>
                    </DashboardCard>
                    <DashboardCard className="p-6">
                        <p className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-2">Total reviews</p>
                        <div className="text-4xl font-black text-gray-900">{summary.totalReviews}</div>
                        <p className="mt-2 text-sm text-gray-500">Including hidden items</p>
                    </DashboardCard>
                    <DashboardCard className="p-6">
                        <p className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-2">5-star reviews</p>
                        <div className="text-4xl font-black text-emerald-600">{summary.ratingBreakdown?.[5] || 0}</div>
                        <p className="mt-2 text-sm text-gray-500">Top-rated feedback</p>
                    </DashboardCard>
                </div>

                <DashboardCard title="Review Filters" className="p-6">
                    <form onSubmit={applyFilters} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                            <input
                                type="text"
                                value={filters.keyword}
                                onChange={(event) => setFilters((current) => ({ ...current, keyword: event.target.value }))}
                                placeholder="Product, comment, or title"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                                value={filters.status}
                                onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <option value="">All</option>
                                <option value="Published">Published</option>
                                <option value="Hidden">Hidden</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                            <select
                                value={filters.rating}
                                onChange={(event) => setFilters((current) => ({ ...current, rating: event.target.value }))}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <option value="">All</option>
                                <option value="5">5 stars</option>
                                <option value="4">4 stars</option>
                                <option value="3">3 stars</option>
                                <option value="2">2 stars</option>
                                <option value="1">1 star</option>
                            </select>
                        </div>
                        <div className="flex items-end gap-3">
                            <Button type="submit" className="w-full">Apply Filters</Button>
                            <Button
                                type="button"
                                className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                                onClick={async () => {
                                    setFilters({ keyword: '', status: '', rating: '' });
                                    setPage(1);
                                    await fetchReviews();
                                }}
                            >
                                Reset
                            </Button>
                        </div>
                    </form>
                </DashboardCard>

                <DashboardCard title="Customer Reviews" className="p-6">
                    {loading ? (
                        <div className="py-10 text-center text-gray-500">Loading reviews...</div>
                    ) : reviews.length === 0 ? (
                        <div className="py-10 text-center text-gray-500">
                            <Icon path="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.192-2.058-.573-3.016z" className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p className="font-medium text-gray-700">No reviews found</p>
                            <p className="text-sm text-gray-500 mt-1">Try adjusting the filters.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reviews.map((review) => (
                                <article key={review._id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between mb-4 pb-4 border-b border-gray-100">
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-semibold">
                                                    {review.customer?.name?.[0]?.toUpperCase() || 'C'}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{review.customer?.name || 'Customer'}</p>
                                                    <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
                                                </div>
                                                <span className={`ml-auto lg:ml-4 px-2.5 py-1 rounded-full text-xs font-semibold ${review.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                                                    {review.status}
                                                </span>
                                            </div>
                                            {review.title && <h4 className="text-sm font-semibold text-gray-800 mb-1">{review.title}</h4>}
                                            {review.comment && <p className="text-sm text-gray-700 italic mt-2">Order feedback: "{review.comment}"</p>}
                                        </div>

                                        <div className="shrink-0 flex flex-col items-start lg:items-end gap-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500 font-medium">Overall Rating:</span>
                                                <StarRating rating={review.overallRating || 0} />
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <Button
                                                    onClick={() => toggleStatus(review)}
                                                    disabled={busyId === review._id}
                                                    className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 px-4 py-2 text-xs"
                                                >
                                                    {review.status === 'Published' ? 'Hide' : 'Publish'}
                                                </Button>
                                                <Button
                                                    onClick={() => handleDelete(review._id)}
                                                    disabled={busyId === review._id}
                                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-xs"
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pl-2 sm:pl-12">
                                        {review.items?.map((item, idx) => (
                                            <div key={idx} className="bg-gray-50 rounded-lg p-4">
                                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                                    <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white border border-gray-200 text-gray-700">
                                                        {item.product?.name || 'Product'}
                                                    </span>
                                                    <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white border border-gray-200 text-gray-700">
                                                        {item.vendor?.shopName || item.vendor?.name || 'Vendor'}
                                                    </span>
                                                    <div className="ml-auto">
                                                        <StarRating rating={item.rating || 0} size="sm" />
                                                    </div>
                                                </div>
                                                {item.comment ? (
                                                    <p className="text-sm text-gray-700 mt-2 leading-relaxed">{item.comment}</p>
                                                ) : (
                                                    <p className="text-sm text-gray-400 italic mt-2">No comment provided</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                            <Button
                                onClick={() => setPage((current) => Math.max(1, current - 1))}
                                disabled={page === 1}
                                className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                            >
                                Previous
                            </Button>
                            <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
                            <Button
                                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                                disabled={page === totalPages}
                                className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </DashboardCard>
            </div>
        </DashboardLayout>
    );
};

export default AdminReviewsPage;