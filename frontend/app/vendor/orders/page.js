'use client'

import React from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { DashboardCard } from '@/components/common/UIComponents';
import { getVendorOrders } from '@/utils/orderApi';
import { updateOrderStatus } from '@/utils/vendorApi';
import { showToast } from '@/utils/toast';

const VendorOrders = () => {
    const [orders, setOrders] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [updatingOrderId, setUpdatingOrderId] = React.useState(null);
    const [selectedOrder, setSelectedOrder] = React.useState(null);
    const [showModal, setShowModal] = React.useState(false);

    React.useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await getVendorOrders();
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
            showToast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            setUpdatingOrderId(orderId);
            await updateOrderStatus(orderId, newStatus);
            showToast.success(`Order status updated to ${newStatus}`);
            fetchOrders(); // Refresh the list
        } catch (error) {
            console.error('Error updating order status:', error);
            showToast.error('Failed to update order status');
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const statusColors = {
        Processing: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        Shipped: 'bg-blue-100 text-blue-800 border-blue-300',
        Delivered: 'bg-green-100 text-green-800 border-green-300',
        Cancelled: 'bg-red-100 text-red-800 border-red-300',
    };

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedOrder(null);
    };

    return (
        <>
            {/* Order Details Modal */}
            {showModal && selectedOrder && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        {/* Background overlay */}
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={closeModal}></div>

                        {/* Modal panel */}
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                            Order Details
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Order ID: #{selectedOrder._id.slice(-8).toUpperCase()}
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

                                {/* Order Status */}
                                <div className="mb-6">
                                    <span className={`px-4 py-2 inline-flex text-sm leading-5 font-semibold rounded-full border ${statusColors[selectedOrder.orderStatus] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
                                        {selectedOrder.orderStatus}
                                    </span>
                                </div>

                                {/* Customer Information */}
                                <div className="mb-6">
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">Customer Information</h4>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-500">Name</p>
                                                <p className="text-gray-900 font-medium">{selectedOrder.order?.customer?.name || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Email</p>
                                                <p className="text-gray-900">{selectedOrder.order?.customer?.email || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Phone</p>
                                                <p className="text-gray-900">{selectedOrder.order?.phoneNumber || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Order Date</p>
                                                <p className="text-gray-900">{formatDate(selectedOrder.createdAt)}</p>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <p className="text-gray-500 mb-1">Shipping Address</p>
                                            <p className="text-gray-900">
                                                {selectedOrder.order?.shippingAddress?.street}<br />
                                                {selectedOrder.order?.shippingAddress?.city}, {selectedOrder.order?.shippingAddress?.postalCode}<br />
                                                {selectedOrder.order?.shippingAddress?.country}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="mb-6">
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">Order Items</h4>
                                    <div className="border rounded-lg overflow-hidden">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {selectedOrder.items?.map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <img
                                                                    src={item.image || '/images/placeholder.jpg'}
                                                                    alt={item.name}
                                                                    className="w-10 h-10 rounded object-cover mr-3"
                                                                />
                                                                <span className="text-sm text-gray-900">{item.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                            {item.quantity}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                            Rs. {item.price?.toLocaleString()}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            Rs. {(item.price * item.quantity)?.toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Order Total */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-base font-medium text-gray-900">Subtotal</span>
                                        <span className="text-lg font-bold text-secondary">Rs. {selectedOrder.subTotal?.toLocaleString()}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">Payment Method: Cash on Delivery</p>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                                {selectedOrder.orderStatus === 'Processing' && (
                                    <button
                                        type="button"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-secondary text-base font-medium text-white hover:bg-secondary/90 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={() => {
                                            handleUpdateStatus(selectedOrder._id, 'Shipped');
                                            closeModal();
                                        }}
                                        disabled={updatingOrderId === selectedOrder._id}
                                    >
                                        Mark as Shipped
                                    </button>
                                )}
                                {selectedOrder.orderStatus === 'Shipped' && (
                                    <button
                                        type="button"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={() => {
                                            handleUpdateStatus(selectedOrder._id, 'Delivered');
                                            closeModal();
                                        }}
                                        disabled={updatingOrderId === selectedOrder._id}
                                    >
                                        Mark as Delivered
                                    </button>
                                )}
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
                <DashboardLayout title="Orders Management" userRole="vendor">
                    <DashboardCard title="Recent Orders" className="!p-0 overflow-hidden">
                        {loading ? (
                            <div className="p-8 text-center text-gray-500">Loading orders...</div>
                        ) : orders.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">No orders received yet</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            {['Order ID', 'Customer', 'Items', 'Subtotal (PKR)', 'Status', 'Date', 'Actions'].map(header => (
                                                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {orders.map(order => (
                                            <tr key={order._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary font-mono">
                                                    #{order._id.slice(-8).toUpperCase()}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <div className="font-medium text-gray-900">{order.order?.customer?.name || 'N/A'}</div>
                                                    <div className="text-gray-500 text-xs">{order.order?.customer?.email}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {order.items?.length || 0} item(s)
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                    Rs. {order.subTotal?.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${statusColors[order.orderStatus] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
                                                        {order.orderStatus}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(order.createdAt)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <button
                                                        type="button"
                                                        className="text-blue-600 hover:text-blue-800 mr-3 font-medium"
                                                        onClick={() => handleViewDetails(order)}
                                                    >
                                                        View Details
                                                    </button>
                                                    {order.orderStatus === 'Processing' && (
                                                        <button
                                                            type="button"
                                                            className="text-secondary hover:text-primary mr-2 disabled:opacity-50"
                                                            onClick={() => handleUpdateStatus(order._id, 'Shipped')}
                                                            disabled={updatingOrderId === order._id}
                                                        >
                                                            Mark Shipped
                                                        </button>
                                                    )}
                                                    {order.orderStatus === 'Shipped' && (
                                                        <button
                                                            type="button"
                                                            className="text-secondary hover:text-primary disabled:opacity-50"
                                                            onClick={() => handleUpdateStatus(order._id, 'Delivered')}
                                                            disabled={updatingOrderId === order._id}
                                                        >
                                                            Mark Delivered
                                                        </button>
                                                    )}
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

export default VendorOrders;

