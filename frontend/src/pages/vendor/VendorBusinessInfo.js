import React from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { DashboardCard, Button, Icon } from '@/components/common/UIComponents';

const VendorBusinessInfo = () => {
    return (
        <DashboardLayout title="Business Information" userRole="vendor">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Store Profile Form */}
                <DashboardCard title="Store Profile">
                    <form className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Store Name</label>
                            <input type="text" className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-secondary focus:border-secondary" defaultValue="Green Valley Farms" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 h-24 focus:ring-secondary focus:border-secondary" defaultValue="Dedicated to providing 100% certified organic produce directly from our fields." />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                            <input type="email" className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-secondary focus:border-secondary" defaultValue="greenvalley@farm.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <input type="tel" className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-secondary focus:border-secondary" defaultValue="+92 3XX XXXXXXX" />
                        </div>
                        <Button onClick={(e) => { e.preventDefault(); console.log('Store Profile Update'); }} className="w-full">Save Changes</Button>
                    </form>
                </DashboardCard>

                {/* Organic Certifications */}
                <DashboardCard title="Organic Certifications">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-green-50">
                            <div className="flex items-center space-x-3">
                                <Icon path="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.192-2.058-.573-3.016z" className="w-6 h-6 text-secondary" color="currentColor" />
                                <div>
                                    <p className="font-medium text-sm text-gray-800">Organic Certification 2025</p>
                                    <p className="text-xs text-gray-500">CertifiedBodyName.pdf (Expires 12/2025)</p>
                                </div>
                            </div>
                            <button type="button" className="text-primary text-sm hover:underline" onClick={(e) => { e.preventDefault(); /* view cert */ }}>View</button>
                        </div>

                        <div className="flex items-center justify-center h-16 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-secondary transition duration-200">
                            <Icon path="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" className="w-5 h-5 text-secondary" />
                            <span className="ml-2 text-sm text-gray-600">Add New Certification</span>
                        </div>
                    </div>
                </DashboardCard>
            </div>
        </DashboardLayout>
    );
};

export default VendorBusinessInfo;
