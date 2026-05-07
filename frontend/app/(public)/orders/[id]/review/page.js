'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { getOrderById } from '@/utils/orderApi'
import { getOrderReviewEligibility, createOrderReview, updateOrderReview, deleteOrderReview } from '@/utils/orderReviewApi'
import { showToast } from '@/utils/toast'
import { Button, StarRating } from '@/components/common/UIComponents'

export default function OrderReviewPage() {
    const router = useRouter()
    const params = useParams()
    const searchParams = useSearchParams()
    const orderId = params.id
    const editReviewId = searchParams.get('editReviewId')

    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [eligible, setEligible] = useState(false)
    const [checkingEligibility, setCheckingEligibility] = useState(true)
    const [eligibilityInfo, setEligibilityInfo] = useState(null)
    const [itemsState, setItemsState] = useState([])
    const [submitting, setSubmitting] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        if (!orderId) return
        fetchOrder()
    }, [orderId])

    useEffect(() => {
        if (!orderId || !order) return
        checkEligibility()
    }, [orderId, order])

    const fetchOrder = async () => {
        try {
            if (!order) setLoading(true)
            const data = await getOrderById(orderId)
            setOrder(data.order || data)
            // build items state from subOrders
            const initial = []
            const subOrders = (data.order && data.order.subOrders) || data.subOrders || data.order?.subOrders || []
            subOrders.forEach(so => {
                so.items.forEach(item => {
                    initial.push({
                        productId: item.product?._id || item.product,
                        name: item.name,
                        image: item.image,
                        vendorId: so.vendor?._id || so.vendor,
                        subOrderId: so._id,
                        rating: 0,
                        comment: ''
                    })
                })
            })
            setItemsState(initial)
        } catch (err) {
            console.error('fetchOrder error', err)
            showToast.error('Failed to load order')
        } finally {
            setLoading(false)
        }
    }

    const checkEligibility = async () => {
        try {
            const data = await getOrderReviewEligibility(orderId)
            setEligible(Boolean(data.canReview))
            setEligibilityInfo(data)

            // If there's an existing review, populate form with existing ratings
            if (data.existingReview && itemsState.length > 0) {
                setIsEditing(true)
                const updatedItems = itemsState.map(item => {
                    const existingItem = data.existingReview.items.find(
                        ri => (ri.product?._id || ri.product) === item.productId
                    )
                    return {
                        ...item,
                        rating: existingItem?.rating || 0,
                        comment: existingItem?.comment || ''
                    }
                })
                setItemsState(updatedItems)
            }
        } catch (err) {
            console.error('eligibility check failed', err)
            setEligible(false)
            const info = err?.response?.data || { message: err.message || 'Unknown error' }
            setEligibilityInfo({ error: info })
        } finally {
            setCheckingEligibility(false)
        }
    }

    const setItemRating = (index, rating) => {
        setItemsState(prev => prev.map((it, i) => i === index ? { ...it, rating } : it))
    }
    const setItemComment = (index, comment) => {
        setItemsState(prev => prev.map((it, i) => i === index ? { ...it, comment } : it))
    }

    const handleSubmit = async () => {
        if (!eligible && !isEditing) {
            showToast.error('This order is not eligible for reviews')
            return
        }

        // require at least one rating > 0
        if (!itemsState.some(i => i.rating > 0)) {
            showToast.error('Please rate at least one item')
            return
        }

        const payload = {
            items: itemsState.map(i => ({
                product: i.productId,
                vendor: i.vendorId,
                subOrderId: i.subOrderId,
                rating: i.rating,
                comment: i.comment
            })),
            overallRating: Math.round(itemsState.reduce((s, it) => s + it.rating, 0) / Math.max(1, itemsState.length)),
            deliveryRating: 5,
            comment: ''
        }

        try {
            setSubmitting(true)
            const targetReviewId = editReviewId || eligibilityInfo?.existingReview?._id;
            if (isEditing && targetReviewId) {
                await updateOrderReview(targetReviewId, payload)
                showToast.success('Review updated successfully!')
            } else {
                await createOrderReview(orderId, payload)
                showToast.success('Review submitted successfully!')
            }
            router.push(`/products/${itemsState[0]?.productId}`)
        } catch (err) {
            console.error('submit review error', err)
            showToast.error(err.response?.data?.message || 'Failed to submit review')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this entire review?')) return;
        try {
            setDeleting(true);
            await deleteOrderReview(eligibilityInfo?.existingReview?._id);
            showToast.success('Review deleted successfully!');
            router.push('/orders');
        } catch (err) {
            console.error('delete review error', err);
            showToast.error(err.response?.data?.message || 'Failed to delete review');
        } finally {
            setDeleting(false);
        }
    }

    if (loading || checkingEligibility) return <div className="p-8 text-center">Loading...</div>

    if (!eligible) return (
        <div className="p-8 bg-white rounded shadow text-center">
            <h2 className="font-semibold text-lg">Reviews not available</h2>
            <p className="text-sm text-gray-600">Reviews can only be submitted for delivered orders.</p>
            <div className="mt-4 flex flex-col items-center gap-3">
                <Button onClick={() => router.push('/orders')} className="bg-secondary text-white">Back to Orders</Button>
            </div>
        </div>
    )

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <main className="max-w-3xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow p-6">
                    <h1 className="text-xl font-bold mb-4">
                        {isEditing ? 'Edit Review' : 'Write Review'} for Order {order.orderNumber || order._id.slice(-8).toUpperCase()}
                    </h1>

                    <div className="space-y-6">
                        {itemsState.map((it, idx) => (
                            <div key={it.productId + '-' + idx} className="flex gap-4 items-start">
                                <div className="w-16 h-16 relative rounded overflow-hidden bg-gray-100">
                                    {it.image && <img src={it.image} className="object-cover w-full h-full" alt={it.name} />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-medium">{it.name}</div>
                                        </div>
                                        <StarRating rating={it.rating} interactive={true} onRate={(val) => setItemRating(idx, val)} size="md" />
                                    </div>
                                    <textarea
                                        value={it.comment}
                                        onChange={(e) => setItemComment(idx, e.target.value)}
                                        rows={3}
                                        placeholder="Write a short comment (optional)"
                                        className="mt-3 w-full border rounded p-2 text-sm"
                                    />
                                </div>
                            </div>
                        ))}

                        <div className="mt-4 flex gap-3">
                            <Button onClick={handleSubmit} disabled={submitting || deleting} className="bg-secondary text-white">
                                {submitting ? (isEditing ? 'Updating...' : 'Submitting...') : (isEditing ? 'Update Review' : 'Submit Review')}
                            </Button>
                            {isEditing && (
                                <Button onClick={handleDelete} disabled={submitting || deleting} className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100">
                                    {deleting ? 'Deleting...' : 'Delete Review'}
                                </Button>
                            )}
                            <Button onClick={() => router.push('/orders')} className="bg-white border">Cancel</Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
