'use client'

import React from 'react';
import { Button } from '@/components/common/UIComponents';
import { useAppContext } from '@/context/AppContext';

const OrderConfirmationPage = () => {
    const { state } = useAppContext();
    const order = state.lastOrder || { id: Math.floor(Math.random() * 100000), total: '0' };

    return (
        <div className="bg-gray-50 min-h-screen flex items-center">
            <main className="max-w-3xl mx-auto p-8 bg-white rounded-lg shadow-md text-center">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Thank you for your order!</h1>
                    <p className="text-gray-600">Your order <span className="font-medium">#{order.id}</span> has been placed successfully.</p>
                </div>
                <div className="mb-6">
                    <p className="text-gray-700">We will send you a confirmation email with the order details and tracking information shortly.</p>
                </div>
                <div className="flex items-center justify-center gap-4">
                    <Button onClick={() => window.location.assign('/')}>Continue Shopping</Button>
                    <Button onClick={() => window.location.assign('/orders')} className="bg-transparent border">View Orders</Button>
                </div>
            </main>
        </div>
    );
};

export default OrderConfirmationPage;
