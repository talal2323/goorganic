import React from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { DashboardCard } from '../../components/common/UIComponents';

const AdminOrders = () => {
    return (
        <DashboardLayout title="Platform Orders" userRole="admin">
            <DashboardCard title="All Platform Orders" className="!p-0 overflow-hidden">
                <div className="p-4 border-b">
                    <p className="text-sm text-gray-600">Filter and track all orders placed on the platform.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {['ID', 'Customer', 'Vendor', 'Total', 'Status', 'Date'].map(header => (
                                    <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {[{ id: 1001, customer: 'User A', vendor: 'Vendor A', total: 4500, status: 'Delivered', date: '2025-10-10' }, { id: 1002, customer: 'User B', vendor: 'Vendor B', total: 1200, status: 'Shipped', date: '2025-10-12' }, { id: 1003, customer: 'User C', vendor: 'Vendor A', total: 7000, status: 'Processing', date: '2025-10-15' }].map(order => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-900">{order.id}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-primary">{order.customer}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{order.vendor}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">Rs. {order.total.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{order.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </DashboardCard>
        </DashboardLayout>
    );
};

export default AdminOrders;
