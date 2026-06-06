'use client'

import React, { Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/common/UIComponents';
import { getOrderById, downloadInvoice } from '@/utils/orderApi';
import { createDispute } from '@/utils/disputeApi';
import { uploadDisputeProof } from '@/utils/uploadApi';
import { showToast } from '@/utils/toast';
import { COLORS } from '@/utils/config';

function OrderConfirmationContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');

    const [order, setOrder] = React.useState(null);
    const [subOrders, setSubOrders] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [downloadingInvoice, setDownloadingInvoice] = React.useState(false);
    const [activeDisputeSubOrderId, setActiveDisputeSubOrderId] = React.useState(null);
    const [disputeForm, setDisputeForm] = React.useState({ issueType: 'Quality issue', priority: 'Medium', subject: '', description: '', proofImageFile: null, proofImageUrl: null });
    const [submittingDispute, setSubmittingDispute] = React.useState(false);

    React.useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!orderId) {
                showToast.error('Order ID not found');
                setLoading(false);
                return;
            }

            try {
                const data = await getOrderById(orderId);
                setOrder(data.order);
                setSubOrders(data.subOrders || []);
            } catch (error) {
                console.error('Error fetching order:', error);
                showToast.error('Failed to load order details');
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'text-orange-600 bg-orange-100';
            case 'Processing': return 'text-blue-600 bg-blue-100';
            case 'Shipped': return 'text-purple-600 bg-purple-100';
            case 'Delivered': return 'text-green-600 bg-green-100';
            case 'Cancelled': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getOverallStatus = () => {
        if (!subOrders.length) return 'Pending';

        const statuses = subOrders.map(so => so.orderStatus);
        if (statuses.every(s => s === 'Delivered')) return 'Delivered';
        if (statuses.some(s => s === 'Shipped')) return 'Shipped';
        if (statuses.some(s => s === 'Cancelled')) return statuses.every(s => s === 'Cancelled') ? 'Cancelled' : 'Processing';
        if (statuses.some(s => s === 'Processing')) return 'Processing';
        if (statuses.every(s => s === 'Pending')) return 'Pending';
        return 'Pending';
    };

    const handleDownloadInvoice = async () => {
        try {
            setDownloadingInvoice(true);
            await downloadInvoice(order._id, order.orderNumber);
            showToast.success('Invoice downloaded successfully!');
        } catch (error) {
            console.error('Error downloading invoice:', error);
            showToast.error('Failed to download invoice');
        } finally {
            setDownloadingInvoice(false);
        }
    };

    const openDisputeForm = (subOrder) => {
        setActiveDisputeSubOrderId(subOrder._id);
        setDisputeForm({
            issueType: 'Quality issue',
            priority: 'Medium',
            subject: `Issue with ${subOrder.vendor?.shopName || subOrder.vendor?.name || 'this order'}`,
            description: '',
            proofImageFile: null,
            proofImageUrl: null,
        });
    };

    const submitDispute = async (subOrder) => {
        try {
            if (!disputeForm.subject.trim() || !disputeForm.description.trim()) {
                showToast.error('Please add a subject and description');
                return;
            }

            setSubmittingDispute(true);
            let proofImage = null;
            if (disputeForm.proofImageFile) {
                const formData = new FormData();
                formData.append('proof_image_file', disputeForm.proofImageFile);
                const uploadRes = await uploadDisputeProof(formData);
                proofImage = { public_id: uploadRes.public_id, url: uploadRes.url };
            }

            await createDispute(order._id, {
                subOrderId: subOrder._id,
                issueType: disputeForm.issueType,
                priority: disputeForm.priority,
                subject: disputeForm.subject,
                description: disputeForm.description,
                proofImage: proofImage
            });

            showToast.success('Dispute submitted successfully');
            setActiveDisputeSubOrderId(null);
        } catch (error) {
            console.error('Error submitting dispute:', error);
            showToast.error(error.response?.data?.message || 'Failed to submit dispute');
        } finally {
            setSubmittingDispute(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading order details...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-md text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
                    <p className="text-gray-600 mb-6">We couldn't find the order you're looking for.</p>
                    <Button onClick={() => router.push('/')}>Go to Home</Button>
                </div>
            </div>
        );
    }

    const overallStatus = getOverallStatus();

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <main className="max-w-4xl mx-auto px-4">
                {/* Success Header */}
                <div className="bg-white rounded-lg shadow-md p-8 mb-6 text-center">
                    <div className="mb-4">
                        <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
                    <p className="text-gray-600 mb-4">Thank you for your purchase</p>
                    <div className="inline-block bg-gray-100 px-6 py-2 rounded-full">
                        <span className="text-sm text-gray-600">Order Number: </span>
                        <span className="font-bold text-gray-900">{order.orderNumber || `#${order._id.slice(-8).toUpperCase()}`}</span>
                    </div>
                </div>

                {/* Order Status Tracker */}
                <div className="bg-white rounded-lg shadow-md p-8 mb-6">
                    <h2 className="text-xl font-semibold mb-6">Order Status</h2>

                    {overallStatus === 'Cancelled' ? (
                        // Show cancelled status with a different layout
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-4">
                                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-red-600 mb-2">Order Cancelled</h3>
                            <p className="text-gray-600">This order has been cancelled.</p>
                            {subOrders.some(so => so.cancellationReason) && (
                                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 inline-block">
                                    <p className="text-sm font-medium text-red-800 mb-1">Cancellation Reason:</p>
                                    <p className="text-sm text-red-700">{subOrders.find(so => so.cancellationReason)?.cancellationReason}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        // Show normal status flow
                        <div className="flex justify-between items-center mb-4">
                            {['Pending', 'Processing', 'Shipped', 'Delivered'].map((status, index) => {
                                const isActive =
                                    (overallStatus === 'Pending' && index === 0) ||
                                    (overallStatus === 'Processing' && index <= 1) ||
                                    (overallStatus === 'Shipped' && index <= 2) ||
                                    (overallStatus === 'Delivered' && index <= 3);

                                return (
                                    <div key={status} className="flex flex-col items-center flex-1">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${isActive ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                                            }`}>
                                            {status === 'Pending' && (
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            )}
                                            {status === 'Processing' && (
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                            )}
                                            {status === 'Shipped' && (
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                                                </svg>
                                            )}
                                            {status === 'Delivered' && (
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                        <span className={`text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                                            {status}
                                        </span>
                                        {index < 3 && (
                                            <div className={`hidden md:block absolute w-full h-1 top-6 left-1/2 ${(index === 0 && ['Processing', 'Shipped', 'Delivered'].includes(overallStatus)) ? 'bg-green-500' :
                                                (index === 1 && ['Shipped', 'Delivered'].includes(overallStatus)) ? 'bg-green-500' :
                                                    (index === 2 && overallStatus === 'Delivered') ? 'bg-green-500' :
                                                        'bg-gray-200'
                                                }`} style={{ width: 'calc(100% - 3rem)', marginLeft: '1.5rem' }} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Order Details */}
                <div className="bg-white rounded-lg shadow-md p-8 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Order Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Shipping Address</h3>
                            <p className="text-gray-900">{order.shippingAddress.address}</p>
                            <p className="text-gray-900">{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                            <p className="text-gray-900">{order.shippingAddress.country}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Contact Information</h3>
                            <p className="text-gray-900">Phone: {order.phoneNumber}</p>
                            <p className="text-gray-900">Email: {order.customer.email}</p>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="text-sm font-medium text-gray-500 mb-4">Items Ordered</h3>
                        {subOrders.map((subOrder, idx) => (
                            <div key={idx} className="mb-6 pb-6 border-b last:border-b-0">
                                <div className="flex justify-between items-center mb-3">
                                    <p className="text-sm text-gray-600">
                                        Vendor: <span className="font-medium text-gray-900">{subOrder.vendor?.shopName || subOrder.vendor?.name || 'N/A'}</span>
                                    </p>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {subOrder.vendor?._id && (
                                            <Button
                                                onClick={() => router.push(`/chat/${subOrder.vendor._id}`)}
                                                className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                                            >
                                                Chat with Vendor
                                            </Button>
                                        )}
                                        <Button
                                            onClick={() => openDisputeForm(subOrder)}
                                            className="bg-white text-red-700 border border-red-200 hover:bg-red-50"
                                        >
                                            Raise Dispute
                                        </Button>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(subOrder.orderStatus)}`}>
                                            {subOrder.orderStatus}
                                        </span>
                                    </div>
                                </div>
                                {subOrder.orderStatus === 'Delivered' && (
                                    <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                                        <p className="text-xs text-green-800 mr-4">
                                            ✓ <strong>Ready to review!</strong> Click the button to write a review for this order and rate each item.
                                        </p>
                                        <div className="flex-shrink-0">
                                            <Button
                                                onClick={() => router.push(`/orders/${order._id}/review`)}
                                                className="bg-white text-green-700 border border-green-200 hover:bg-green-50 px-3 py-1 text-sm"
                                            >
                                                Write Review
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                {subOrder.items.map((item, itemIdx) => (
                                    <div key={itemIdx} className="flex items-center gap-4 mb-2">
                                        <div className="relative w-16 h-16 rounded overflow-hidden">
                                            <Image src={item.image || '/images/placeholder.jpg'} alt={item.name} fill sizes="64px" className="object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{item.name}</p>
                                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <p className="font-medium text-gray-900">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                                {activeDisputeSubOrderId === subOrder._id && (
                                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <label className="block">
                                                <span className="text-xs font-medium text-gray-700">Issue Type</span>
                                                <select
                                                    value={disputeForm.issueType}
                                                    onChange={(event) => setDisputeForm((current) => ({ ...current, issueType: event.target.value }))}
                                                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                                                >
                                                    <option>Quality issue</option>
                                                    <option>Damaged item</option>
                                                    <option>Wrong item</option>
                                                    <option>Missing item</option>
                                                    <option>Late delivery</option>
                                                    <option>Other</option>
                                                </select>
                                            </label>
                                            <label className="block">
                                                <span className="text-xs font-medium text-gray-700">Priority</span>
                                                <select
                                                    value={disputeForm.priority}
                                                    onChange={(event) => setDisputeForm((current) => ({ ...current, priority: event.target.value }))}
                                                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                                                >
                                                    <option>Low</option>
                                                    <option>Medium</option>
                                                    <option>High</option>
                                                </select>
                                            </label>
                                        </div>
                                        <label className="block mt-3">
                                            <span className="text-xs font-medium text-gray-700">Subject</span>
                                            <input
                                                value={disputeForm.subject}
                                                onChange={(event) => setDisputeForm((current) => ({ ...current, subject: event.target.value }))}
                                                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                                                placeholder="Short summary of the issue"
                                            />
                                        </label>
                                        <label className="block mt-3">
                                            <span className="text-xs font-medium text-gray-700">Description</span>
                                            <textarea
                                                value={disputeForm.description}
                                                onChange={(event) => setDisputeForm((current) => ({ ...current, description: event.target.value }))}
                                                rows={4}
                                                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                                                placeholder="Describe what went wrong, what you expected, and what resolution you want."
                                            />
                                        </label>
                                        <label className="block mt-3">
                                            <span className="text-xs font-medium text-gray-700">Proof Image (Optional)</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(event) => {
                                                    const file = event.target.files[0];
                                                    if (file) {
                                                        const url = URL.createObjectURL(file);
                                                        setDisputeForm((current) => ({ ...current, proofImageFile: file, proofImageUrl: url }));
                                                    }
                                                }}
                                                className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                                            />
                                        </label>
                                        {disputeForm.proofImageUrl && (
                                            <div className="mt-2 relative w-24 h-24 rounded overflow-hidden">
                                                <Image src={disputeForm.proofImageUrl} alt="Proof" fill sizes="96px" className="object-cover" />
                                            </div>
                                        )}
                                        <div className="mt-4 flex flex-wrap gap-3">
                                            <Button
                                                onClick={() => submitDispute(subOrder)}
                                                disabled={submittingDispute}
                                                className="bg-red-600 hover:bg-red-700 text-white"
                                            >
                                                {submittingDispute ? 'Submitting...' : 'Submit Dispute'}
                                            </Button>
                                            <Button
                                                onClick={() => setActiveDisputeSubOrderId(null)}
                                                className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="border-t pt-4">
                        <div className="space-y-2 mb-3">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Subtotal:</span>
                                <span>Rs. {(order.totalAmount - (order.shippingFee || 0) + (order.pointsRedeemed || 0)).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Shipping Fee:</span>
                                <span>Rs. {(order.shippingFee || 0).toLocaleString()}</span>
                            </div>
                            {(order.pointsRedeemed > 0) && (
                                <div className="flex justify-between text-sm text-green-700">
                                    <span>Points Redeemed:</span>
                                    <span>- Rs. {order.pointsRedeemed.toLocaleString()}</span>
                                </div>
                            )}
                            {(order.pointsEarned > 0) && (
                                <div className="flex justify-between text-sm text-green-700 font-medium">
                                    <span>Points Earned:</span>
                                    <span>+ {order.pointsEarned.toLocaleString()} Points</span>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-between text-lg font-semibold border-t pt-3">
                            <span>Total Amount</span>
                            <span style={{ color: COLORS.secondary }}>Rs. {order.totalAmount.toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">Payment Method: {order.paymentMethod === 'Stripe' ? 'Online Payment (Stripe)' : 'Cash on Delivery'}</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                        onClick={handleDownloadInvoice}
                        disabled={downloadingInvoice}
                        className="bg-secondary hover:bg-secondary/90 text-white"
                    >
                        {downloadingInvoice ? 'Downloading...' : '📄 Download Invoice'}
                    </Button>
                    <Button onClick={() => router.push('/')}>Continue Shopping</Button>
                    <Button onClick={() => router.push('/orders')} className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50">
                        View All Orders
                    </Button>
                </div>

                {/* Help Section */}
                <div className="mt-6 text-center text-sm text-gray-600">
                    <p>Need help with your order? Contact us at <a href="mailto:goorganic.co.pk@gmail.com" className="text-secondary hover:underline">goorganic.co.pk@gmail.com</a></p>
                </div>
            </main>
        </div>
    );
}

export default function OrderConfirmationPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 py-12">
                <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <div className="text-gray-600">Loading order details...</div>
                    </div>
                </main>
            </div>
        }>
            <OrderConfirmationContent />
        </Suspense>
    );
}
