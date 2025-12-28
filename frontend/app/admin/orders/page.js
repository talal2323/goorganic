'use client'

import React from 'react';
import Image from 'next/image';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { DashboardCard } from '@/components/common/UIComponents';
import { getAllOrders, getOrderById } from '@/utils/orderApi';
import { showToast } from '@/utils/toast';

const AdminOrders = () => {
    const [orders, setOrders] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [selectedOrder, setSelectedOrder] = React.useState(null);
    const [selectedSubOrders, setSelectedSubOrders] = React.useState([]);
    const [showModal, setShowModal] = React.useState(false);
    const [loadingDetails, setLoadingDetails] = React.useState(false);

    React.useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await getAllOrders();
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
            showToast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleViewDetails = async (orderId) => {
        try {
            setLoadingDetails(true);
            const data = await getOrderById(orderId);
            setSelectedOrder(data.order);
            setSelectedSubOrders(data.subOrders || []);
            setShowModal(true);
        } catch (error) {
            console.error('Error fetching order details:', error);
            showToast.error('Failed to load order details');
        } finally {
            setLoadingDetails(false);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedOrder(null);
        setSelectedSubOrders([]);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Processing': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'Shipped': return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'Delivered': return 'bg-green-100 text-green-800 border-green-300';
            case 'Cancelled': return 'bg-red-100 text-red-800 border-red-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    return (
        <>
            {/* Order Details Modal */}
            {showModal && selectedOrder && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={closeModal}></div>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                            Order Details
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Order ID: {selectedOrder.orderNumber || `#${selectedOrder._id.slice(-8).toUpperCase()}`}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Placed on: {formatDate(selectedOrder.createdAt)}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                                        onClick={closeModal}
                                    >
                                        <span className="sr-only">Close</span>
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Customer Information */}
                                <div className="mb-6">
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">Customer Information</h4>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-500">Name</p>
                                                <p className="text-gray-900 font-medium">{selectedOrder.customer?.name || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Email</p>
                                                <p className="text-gray-900">{selectedOrder.customer?.email || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Phone</p>
                                                <p className="text-gray-900">{selectedOrder.phoneNumber || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Payment Method</p>
                                                <p className="text-gray-900">{selectedOrder.paymentMethod || 'COD'}</p>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <p className="text-gray-500 mb-1">Shipping Address</p>
                                            <p className="text-gray-900">
                                                {selectedOrder.shippingAddress?.address}<br />
                                                {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.postalCode}<br />
                                                {selectedOrder.shippingAddress?.country}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Sub-Orders by Vendor */}
                                <div className="mb-6">
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">Orders by Vendor</h4>
                                    {selectedSubOrders.length > 0 ? (
                                        <div className="space-y-4">
                                            {selectedSubOrders.map((subOrder, idx) => (
                                                <div key={idx} className="border rounded-lg overflow-hidden">
                                                    <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                {subOrder.vendor?.shopName || subOrder.vendor?.name}
                                                            </p>
                                                            <p className="text-xs text-gray-500">{subOrder.vendor?.email}</p>
                                                        </div>
                                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(subOrder.orderStatus)}`}>
                                                            {subOrder.orderStatus}
                                                        </span>
                                                    </div>
                                                    <div className="p-4">
                                                        <table className="min-w-full">
                                                            <thead>
                                                                <tr className="border-b">
                                                                    <th className="text-left text-xs font-medium text-gray-500 pb-2">Product</th>
                                                                    <th className="text-left text-xs font-medium text-gray-500 pb-2">Qty</th>
                                                                    <th className="text-left text-xs font-medium text-gray-500 pb-2">Price</th>
                                                                    <th className="text-left text-xs font-medium text-gray-500 pb-2">Total</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {subOrder.items?.map((item, itemIdx) => (
                                                                    <tr key={itemIdx} className="border-b last:border-b-0">
                                                                        <td className="py-2">
                                                                            <div className="flex items-center">
                                                                                <div className="relative w-10 h-10 rounded overflow-hidden mr-2">
                                                                                    <Image
                                                                                        src={item.image || '/images/placeholder.jpg'}
                                                                                        alt={item.name}
                                                                                        fill
                                                                                        sizes="40px"
                                                                                        className="object-cover"
                                                                                    />
                                                                                </div>
                                                                                <span className="text-sm text-gray-900">{item.name}</span>
                                                                            </div>
                                                                        </td>
                                                                        <td className="py-2 text-sm text-gray-500">{item.quantity}</td>
                                                                        <td className="py-2 text-sm text-gray-900">Rs. {item.price?.toLocaleString()}</td>
                                                                        <td className="py-2 text-sm font-medium text-gray-900">
                                                                            Rs. {(item.price * item.quantity)?.toLocaleString()}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                        <div className="mt-3 pt-3 border-t flex justify-between items-center">
                                                            <span className="text-sm font-medium text-gray-700">Vendor Subtotal</span>
                                                            <span className="text-base font-bold text-gray-900">Rs. {subOrder.subTotal?.toLocaleString()}</span>
                                                        </div>
                                                        {subOrder.deliveredAt && (
                                                            <p className="text-xs text-gray-500 mt-2">
                                                                Delivered on: {formatDate(subOrder.deliveredAt)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-sm">No vendor orders found</p>
                                    )}
                                </div>

                                {/* Order Total */}
                                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-base font-medium text-gray-900">Total Order Amount</span>
                                        <span className="text-2xl font-bold text-green-600">Rs. {selectedOrder.totalAmount?.toLocaleString()}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-2">
                                        Payment Status: <span className="font-medium">{selectedOrder.paymentStatus || 'Pending'}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                                    onClick={closeModal}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div>
                <DashboardLayout title="Platform Orders" userRole="admin">
                    <DashboardCard title="All Platform Orders" className="!p-0 overflow-hidden">
                        <div className="p-4 border-b">
                            <p className="text-sm text-gray-600">Filter and track all orders placed on the platform.</p>
                        </div>

                        {loading ? (
                            <div className="p-8 text-center text-gray-500">Loading orders...</div>
                        ) : orders.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">No orders found</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            {['Order ID', 'Customer', 'Total Amount', 'Shipping Address', 'Phone', 'Date', 'Actions'].map(header => (
                                                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {orders.map(order => (
                                            <tr key={order._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                                                    {order.orderNumber || `#${order._id.slice(-8).toUpperCase()}`}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <div className="font-medium text-primary">{order.customer?.name || 'N/A'}</div>
                                                    <div className="text-gray-500 text-xs">{order.customer?.email}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                                    Rs. {order.totalAmount?.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {order.shippingAddress?.city}, {order.shippingAddress?.country}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {order.phoneNumber}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {formatDate(order.createdAt)}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <button
                                                        type="button"
                                                        className="text-blue-600 hover:text-blue-800 font-medium"
                                                        onClick={() => handleViewDetails(order._id)}
                                                        disabled={loadingDetails}
                                                    >
                                                        {loadingDetails ? 'Loading...' : 'View Details'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </DashboardCard>
                </DashboardLayout>
            </div>
        </>
    );
};

export default AdminOrders;

