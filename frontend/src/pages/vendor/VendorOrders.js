import React from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { DashboardCard } from '@/components/common/UIComponents';

const VendorOrders = () => {
    const orders = [
        { id: 1001, customer: 'Ali Khan', date: '2025-10-10', total: 4500, status: 'Processing' },
        { id: 1002, customer: 'Sara Ahmad', date: '2025-10-12', total: 1200, status: 'Shipped' },
        { id: 1003, customer: 'Hassan Raza', date: '2025-10-15', total: 7000, status: 'Delivered' },
        { id: 1004, customer: 'Fatima Zafar', date: '2025-10-21', total: 4000, status: 'Delivered' },
        { id: 1005, customer: 'Adam Khan', date: '2025-10-22', total: 3200, status: 'Cancelled' },
    ];

    const statusColors = {
        Processing: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        Shipped: 'bg-blue-100 text-blue-800 border-blue-300',
        Delivered: 'bg-green-100 text-green-800 border-green-300',
        Cancelled: 'bg-red-100 text-red-800 border-red-300',
    }

    return (
        <DashboardLayout title="Orders Management" userRole="vendor">
            <DashboardCard title="Recent Orders" className="!p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {['ID', 'Customer', 'Date', 'Total (PKR)', 'Status', 'Actions'].map(header => (
                                    <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.map(order => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">{order.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customer}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{order.total.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${statusColors[order.status]}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button type="button" className="text-secondary hover:text-primary" onClick={(e) => { e.preventDefault(); console.log(`Viewing details for Order ${order.id}`); }}>View Details</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </DashboardCard>
        </DashboardLayout>
    );
};

export default VendorOrders;
