import React from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { DashboardCard, Button } from '@/components/common/UIComponents';

const AdminProductsCategories = () => {
    return (
        <DashboardLayout title="Products & Categories" userRole="admin">
            <DashboardCard title="Products & Categories Control">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <DashboardCard title="Product Approval Queue" className="!p-4 border border-gray-100">
                        <ul className="space-y-3 text-sm">
                            {['New Almond Butter', 'Imported Organic Tea', 'Farm Fresh Eggs'].map((product, i) => (
                                <li key={i} className="flex justify-between items-center p-2 rounded-lg bg-yellow-50/50">
                                    <span>{product}</span>
                                    <Button className="text-xs px-3 py-1" onClick={(e) => { e.preventDefault(); console.log(`Approving ${product}`); }}>Review</Button>
                                </li>
                            ))}
                        </ul>
                    </DashboardCard>
                    <DashboardCard title="Manage Categories" className="!p-4 border border-gray-100">
                        <ul className="space-y-3 text-sm">
                            {['Food & Beverages', 'Personal Care', 'Supplements', 'Home Goods'].map((cat, i) => (
                                <li key={i} className="flex justify-between items-center p-2 rounded-lg bg-gray-50">
                                    <span>{cat}</span>
                                    <button type="button" className="text-red-500 text-xs hover:underline" onClick={(e) => { e.preventDefault(); /* Delete action */ }}>
                                        Delete
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-4 flex space-x-2">
                            <input type="text" placeholder="New Category Name" className="flex-1 border border-gray-300 rounded-lg p-2 text-sm" />
                            <Button className="text-sm px-4 py-1.5" onClick={(e) => { e.preventDefault(); console.log('Adding Category'); }}>Add</Button>
                        </div>
                    </DashboardCard>
                </div>
            </DashboardCard>
        </DashboardLayout>
    );
};

export default AdminProductsCategories;
