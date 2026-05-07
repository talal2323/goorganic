'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { useAppContext, useCart } from '@/context/AppContext';
import { Button, StarRating, VerificationBadge } from '@/components/common/UIComponents';
import { getProductById } from '@/utils/productApi';
import { getProductReviews, deleteOrderReview } from '@/utils/orderReviewApi';
import { showToast } from '@/utils/toast';

const ProductDetailPage = () => {
    const router = useRouter();
    const params = useParams();
    const { state } = useAppContext();
    const { addItemToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [qty, setQty] = useState(1);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [reviews, setReviews] = useState([]);
    const [reviewStats, setReviewStats] = useState({
        averageRating: 0,
        reviewCount: 0,
        ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    });
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [deletingReviewId, setDeletingReviewId] = useState(null);

    const inc = () => setQty((q) => Math.min(product?.stock || 99, q + 1));
    const dec = () => setQty((q) => Math.max(1, q - 1));

    useEffect(() => {
        if (params.id) {
            fetchProduct();
            fetchReviews();
        }
    }, [params.id]);

    const handleDeleteReview = async (reviewId, productId) => {
        if (!confirm('Are you sure you want to delete this review?')) return;

        try {
            setDeletingReviewId(reviewId);
            await deleteOrderReview(reviewId, productId);
            showToast.success('Review deleted successfully');
            fetchReviews();
        } catch (error) {
            showToast.error(error.response?.data?.message || 'Failed to delete review');
        } finally {
            setDeletingReviewId(null);
        }
    };

    const handleEditReview = (reviewId, orderId) => {
        // Navigate to the order review edit page
        router.push(`/orders/${orderId}/review?editReviewId=${reviewId}`);
    };

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const data = await getProductById(params.id);
            setProduct(data);
        } catch (error) {
            showToast.error(error.response?.data?.message || 'Failed to fetch product');
            setProduct(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            setReviewsLoading(true);
            const data = await getProductReviews(params.id);
            setReviews(data.reviews || []);
            setReviewStats({
                averageRating: data.averageRating || 0,
                reviewCount: data.reviewCount || 0,
                ratingBreakdown: data.ratingBreakdown || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            });
        } catch (error) {
            setReviews([]);
            setReviewStats({
                averageRating: 0,
                reviewCount: 0,
                ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            });
        } finally {
            setReviewsLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!state.isLoggedIn) {
            showToast.error('Please log in to add items to cart');
            router.push('/auth/login');
            return;
        }

        try {
            await addItemToCart(product._id, qty);
            showToast.success(`${product.name} added to cart`);
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to add item to cart';
            showToast.error(message);
        }
    };

    if (loading) {
        return (
            <div className="bg-gray-50">
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
                    <p className="text-gray-500">Loading product...</p>
                </main>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="bg-gray-50">
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
                    <h2 className="text-2xl font-semibold mb-4">Product not found</h2>
                    <Button onClick={() => router.push('/shop')}>
                        ← Back to Shop
                    </Button>
                </main>
            </div>
        );
    }

    return (
        <div className="bg-gray-50">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                <div className="mb-6">
                    <button
                        onClick={() => router.push('/shop')}
                        className="text-sm font-medium text-primary hover:text-secondary flex items-center"
                    >
                        ← Back to Shop
                    </button>
                </div>

                {/* Product Details Card */}
                <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        {/* Images */}
                        <div className="p-4 sm:p-6">
                            <div className="relative mb-4 h-96 rounded-2xl overflow-hidden bg-gray-100">
                                <Image
                                    src={product.images?.[selectedImageIndex]?.url || product.images?.[selectedImageIndex] || 'https://placehold.co/600x600/E9F5E9/164A26?text=Product'}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            {product.images && product.images.length > 1 && (
                                <div className="grid grid-cols-4 gap-3">
                                    {product.images.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImageIndex(index)}
                                            className={`relative border-2 rounded-xl overflow-hidden h-20 ${selectedImageIndex === index ? 'border-secondary' : 'border-gray-200 hover:border-gray-400'}`}
                                        >
                                            <Image
                                                src={typeof image === 'string' ? image : image.url}
                                                alt={`${product.name} ${index + 1}`}
                                                fill
                                                sizes="80px"
                                                className="object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
                            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>
                            <p className="text-gray-600 text-base leading-7 mb-6">{product.description}</p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                <div className="p-4 rounded-2xl bg-gray-50">
                                    <div className="text-xs uppercase tracking-wide text-gray-500">Category</div>
                                    <div className="font-medium text-gray-800 mt-1">{product.category?.name || 'N/A'}</div>
                                </div>
                                <div className="p-4 rounded-2xl bg-gray-50">
                                    <div className="text-xs uppercase tracking-wide text-gray-500">Vendor</div>
                                    <div className="font-medium text-gray-800 mt-1 flex items-center gap-2">
                                        {product.vendor?.name || 'N/A'}
                                        {product.vendor?.vendorStatus === 'Approved' && <VerificationBadge />}
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-gray-50">
                                    <div className="text-xs uppercase tracking-wide text-gray-500">Stock</div>
                                    <div className={`font-medium mt-1 ${product.stock > 0 ? 'text-green-700' : 'text-red-600'}`}>
                                        {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-gray-50">
                                    <div className="text-xs uppercase tracking-wide text-gray-500">Average rating</div>
                                    <div className="font-medium text-gray-800 mt-1">
                                        {reviewStats.averageRating > 0 ? `${reviewStats.averageRating.toFixed(1)} / 5` : 'No ratings yet'}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mb-6 py-4 border-t border-b">
                                <span className="text-3xl font-bold text-secondary">Rs. {product.price}</span>
                                <div className="flex items-center space-x-3">
                                    <button onClick={dec} className="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50">−</button>
                                    <span className="min-w-[2ch] text-center font-semibold">{qty}</span>
                                    <button onClick={inc} className="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50">+</button>
                                </div>
                            </div>

                            <Button
                                onClick={handleAddToCart}
                                className="w-full"
                                disabled={product.stock === 0}
                            >
                                {product.stock === 0 ? 'Out of Stock' : `Add ${qty} to Cart`}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <section id="reviews" className="mt-10 mb-10">
                    <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Customer Reviews</h2>
                        <p className="text-sm text-gray-500 mb-6">Individual product ratings from delivered orders</p>

                        {reviewsLoading ? (
                            <div className="py-10 text-center text-gray-500">Loading reviews...</div>
                        ) : reviews.length === 0 ? (
                            <div className="py-10 text-center text-gray-500">No reviews yet for this product. Be the first to review after receiving it in a delivered order!</div>
                        ) : (
                            <div className="space-y-6">
                                {/* Rating Summary */}
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-6 bg-gray-50 rounded-2xl">
                                    <div className="text-center">
                                        <div className="text-4xl font-extrabold text-primary">{reviewStats.averageRating?.toFixed(1) || '0.0'}</div>
                                        <div className="mt-2 flex justify-center">
                                            <StarRating rating={Math.round(reviewStats.averageRating || 0)} />
                                        </div>
                                        <p className="text-sm text-gray-600 mt-2">{reviewStats.reviewCount || 0} rating{reviewStats.reviewCount === 1 ? '' : 's'}</p>
                                    </div>

                                    {/* Rating Breakdown */}
                                    {[5, 4, 3, 2, 1].map((stars) => (
                                        <div key={stars} className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-600">{stars}★</span>
                                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-yellow-400 rounded-full"
                                                    style={{
                                                        width: `${reviewStats.reviewCount > 0 ? (reviewStats.ratingBreakdown[stars] / reviewStats.reviewCount) * 100 : 0}%`,
                                                    }}
                                                />
                                            </div>
                                            <span className="text-sm text-gray-600 w-6 text-right">{reviewStats.ratingBreakdown[stars]}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Reviews List */}
                                <div className="space-y-4 divide-y">
                                    {reviews.map((review) => (
                                        <div key={review._id} className="pt-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-semibold text-sm">
                                                        {review.customerName?.[0]?.toUpperCase() || 'C'}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{review.customerName}</p>
                                                        <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <StarRating rating={review.rating} size="sm" />
                                                </div>
                                            </div>
                                            {review.comment && <p className="text-sm text-gray-700 leading-6 mb-3">{review.comment}</p>}

                                            {/* Edit/Delete buttons - only show if user is the reviewer */}
                                            {state.isLoggedIn && state.user?._id === review.customerId && (
                                                <div className="flex gap-2 mt-3">
                                                    <button
                                                        onClick={() => handleEditReview(review.reviewId, review.orderId)}
                                                        className="text-xs px-3 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteReview(review.reviewId, params.id)}
                                                        disabled={deletingReviewId === review.reviewId}
                                                        className="text-xs px-3 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100 transition disabled:opacity-50"
                                                    >
                                                        {deletingReviewId === review.reviewId ? 'Deleting...' : 'Delete'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                            <p className="text-sm text-blue-900">
                                <strong>💡 How to Review:</strong> After you receive a delivered order containing this product, go to your orders page to review it along with other items from that order.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default ProductDetailPage;
