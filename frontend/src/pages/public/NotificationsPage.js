import React from 'react';
import { useAppContext } from '../../context/AppContext';

const NotificationsPage = () => {
    const { state } = useAppContext();
    const notifications = state.notifications || [
        { id: 1, title: 'Order Shipped', body: 'Your order #12345 has been shipped.' },
        { id: 2, title: 'New Vendor', body: 'A new vendor joined in your city.' }
    ];

    return (
        <div className="bg-gray-50 py-8">
            <main className="max-w-4xl mx-auto px-4">
                <h1 className="text-2xl font-bold mb-4">Notifications</h1>
                <div className="space-y-4">
                    {notifications.map(n => (
                        <div key={n.id} className="bg-white p-4 rounded shadow-sm">
                            <h3 className="font-semibold">{n.title}</h3>
                            <p className="text-gray-600">{n.body}</p>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default NotificationsPage;
