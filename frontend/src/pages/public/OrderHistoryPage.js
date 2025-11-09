import React from 'react';
import { useAppContext } from '../../context/AppContext';

const OrderHistoryPage = () => {
    const { state } = useAppContext();
    const orders = state.orders || [
        { id: 12345, date: '2024-01-01', total: 1250, status: 'Delivered' },
        { id: 12346, date: '2024-02-15', total: 890, status: 'Shipped' }
    ];

    return (
        <div className="bg-gray-50 py-8">
            <main className="max-w-5xl mx-auto px-4">
                <h1 className="text-2xl font-bold mb-4">Your Orders</h1>
                <div className="space-y-4">
                    {orders.map(o => (
                        <div key={o.id} className="bg-white p-4 rounded shadow-sm flex justify-between items-center">
                            <div>
                                <div className="font-semibold">Order #{o.id}</div>
                                <div className="text-sm text-gray-600">{o.date} • {o.status}</div>
                            </div>
                            <div className="font-medium">Rs. {o.total}</div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default OrderHistoryPage;
