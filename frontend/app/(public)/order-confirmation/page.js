'use client'

import React, { Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/common/UIComponents';
import { getOrderById } from '@/utils/orderApi';
import { showToast } from '@/utils/toast';
import { COLORS } from '@/utils/config';

function OrderConfirmationContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');

    const [order, setOrder] = React.useState(null);
    const [subOrders, setSubOrders] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

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
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(subOrder.orderStatus)}`}>
                                        {subOrder.orderStatus}
                                    </span>
                                </div>
                                {subOrder.items.map((item, itemIdx) => (
                                    <div key={itemIdx} className="flex items-center gap-4 mb-2">
                                        <div className="relative w-16 h-16 rounded overflow-hidden">
                                            <Image src={item.image || '/images/placeholder.jpg'} alt={item.name} fill sizes="64px" className="object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{item.name}</p>
                                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                        </div>
                                        <p className="font-medium text-gray-900">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    <div className="border-t pt-4">
                        <div className="flex justify-between text-lg font-semibold">
                            <span>Total Amount</span>
                            <span style={{ color: COLORS.secondary }}>Rs. {order.totalAmount.toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">Payment Method: {order.paymentMethod === 'Stripe' ? 'Online Payment (Stripe)' : 'Cash on Delivery'}</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
