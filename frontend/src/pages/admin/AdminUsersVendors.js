import React from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { DashboardCard, Button } from '@/components/common/UIComponents';

const AdminUsersVendors = () => {
    return (
        <DashboardLayout title="Users & Vendors" userRole="admin">
            <DashboardCard title="Users & Vendors Management" className="!p-0 overflow-hidden">
                <div className="p-4 flex justify-between items-center border-b">
                    <p className="text-sm text-gray-600">Active users and pending vendor approvals overview.</p>
                    <Button className="text-sm px-4 py-2" onClick={() => console.log('Opening Add User Modal')}>Add New User</Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {['ID', 'Name', 'Role', 'Status', 'Joined', 'Actions'].map(header => (
                                    <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {[{ id: 1, name: 'Vendor A', role: 'Vendor', status: 'Active', date: '2023-01-01' }, { id: 2, name: 'User B', role: 'Customer', status: 'Active', date: '2024-05-15' }, { id: 3, name: 'Vendor C', role: 'Vendor', status: 'Pending', date: '2025-09-01' }].map(user => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-900">{user.id}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-primary">{user.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{user.role}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{user.date}</td>
                                    <td className="px-6 py-4 text-sm font-medium space-x-2">
                                        <button type="button" className="text-secondary hover:text-primary" onClick={(e) => { e.preventDefault(); console.log(`Viewing ${user.id}`); }}>View</button>
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

export default AdminUsersVendors;
