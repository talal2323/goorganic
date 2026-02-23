'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { getMyOrders, downloadInvoice } from '@/utils/orderApi';
import { showToast } from '@/utils/toast';
import { COLORS } from '@/utils/config';
import { Button } from '@/components/common/UIComponents';

const OrderHistoryPage = () => {
    const router = useRouter();
    const [orders, setOrders] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [downloadingInvoiceId, setDownloadingInvoiceId] = React.useState(null);

    React.useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await getMyOrders();
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

    const handleDownloadInvoice = async (orderId, orderNumber) => {
        try {
            setDownloadingInvoiceId(orderId);
            await downloadInvoice(orderId, orderNumber);
            showToast.success('Invoice downloaded successfully!');
        } catch (error) {
            console.error('Error downloading invoice:', error);
            showToast.error('Failed to download invoice');
        } finally {
            setDownloadingInvoiceId(null);
        }
    };

    return (
        <div className="bg-gray-50 py-8">
            <main className="max-w-5xl mx-auto px-4">
                <h1 className="text-2xl font-bold mb-4">Your Orders</h1>

                {loading ? (
                    <div className="bg-white p-8 rounded shadow-sm text-center text-gray-500">
                        Loading orders...
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white p-8 rounded shadow-sm text-center text-gray-500">
                        No orders yet. Start shopping to place your first order!
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map(order => (
                            <div key={order._id} className="bg-white p-6 rounded shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="font-semibold text-lg">{order.orderNumber || `Order #${order._id.slice(-8).toUpperCase()}`}</div>
                                        <div className="text-sm text-gray-600 mt-1">
                                            Placed on {formatDate(order.createdAt)}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-lg" style={{ color: COLORS.secondary }}>
                                            Rs. {order.totalAmount?.toLocaleString()}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            (incl. Rs. {(order.shippingFee || 0).toLocaleString()} shipping)
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="text-sm text-gray-600">
                                            <p><span className="font-medium">Shipping Address:</span></p>
                                            <p className="mt-1">
                                                {order.shippingAddress?.address}, {order.shippingAddress?.city}
                                                <br />
                                                {order.shippingAddress?.postalCode}, {order.shippingAddress?.country}
                                            </p>
                                            <p className="mt-2">
                                                <span className="font-medium">Phone:</span> {order.phoneNumber}
                                            </p>
                                        </div>
                                        <div className="flex items-end justify-end gap-2">
                                            <Button
                                                onClick={() => handleDownloadInvoice(order._id, order.orderNumber)}
                                                disabled={downloadingInvoiceId === order._id}
                                                className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                                            >
                                                {downloadingInvoiceId === order._id ? 'Downloading...' : '📄 Invoice'}
                                            </Button>
                                            <Button
                                                onClick={() => router.push(`/order-confirmation?orderId=${order._id}`)}
                                                className="bg-secondary hover:bg-secondary/90 text-white"
                                            >
                                                View Details
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default OrderHistoryPage;

