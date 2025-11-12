import React from 'react';
import { useAppContext } from '@/context/AppContext';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { DashboardCard, Icon } from '@/components/common/UIComponents';
import VendorStatusBanner from '@/components/vendor/VendorStatusBanner';

const VendorDashboard = () => {
    const { state } = useAppContext();
    const user = state.user || {};
    const vendorStatus = user.vendorStatus;
    const rejectionReason = user.rejectionReason;

    return (
        <DashboardLayout title="Vendor Dashboard" userRole="vendor">
            <div className="space-y-8">
                {/* Vendor Status Banner */}
                <VendorStatusBanner status={vendorStatus} rejectionReason={rejectionReason} />
                {/* Top Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <DashboardCard title="Total Sales">
                        <p className="text-3xl font-extrabold text-primary">PKR 4,500,000</p>
                        <p className="text-sm text-gray-500 mt-2 flex items-center">
                            <Icon path="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" className="w-4 h-4 text-green-500 mr-1" color="currentColor" />
                            +12% vs last month
                        </p>
                    </DashboardCard>
                    <DashboardCard title="Total Orders">
                        <p className="text-3xl font-extrabold text-primary">1,250</p>
                        <p className="text-sm text-gray-500 mt-2 flex items-center">
                            <Icon path="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" className="w-4 h-4 text-green-500 mr-1" color="currentColor" />
                            +8% vs last month
                        </p>
                    </DashboardCard>
                    <DashboardCard title="Total Products">
                        <p className="text-3xl font-extrabold text-primary">145</p>
                        <p className="text-sm text-gray-500 mt-2 flex items-center">
                            <Icon path="M12 9v3m0 0v3m0-3h3m-3 0H9" className="w-4 h-4 text-gray-500 mr-1" color="currentColor" />
                            7 Pending Approval
                        </p>
                    </DashboardCard>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Monthly Sales Overview - Chart Placeholder */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                        <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Monthly Performance</h3>
                        <div className="h-64 flex flex-col items-center justify-center bg-gray-50 rounded-lg border border-gray-200 p-4">
                            <img
                                src="https://placehold.co/800x250/F0FFF0/164A26?text=Sales+and+Traffic+Chart"
                                alt="Monthly Sales Chart"
                                className="w-full h-full object-cover rounded-lg"
                            />
                        </div>
                    </div>

                    {/* Top Products */}
                    <DashboardCard title="Top Selling Products">
                        <ul className="space-y-4">
                            <li className="flex justify-between items-center text-sm">
                                <span className="font-medium">Organic Spinach</span>
                                <span className="text-secondary font-bold">450 units</span>
                            </li>
                            <li className="flex justify-between items-center text-sm">
                                <span className="font-medium">Wild Honey 500g</span>
                                <span className="text-secondary font-bold">320 units</span>
                            </li>
                            <li className="flex justify-between items-center text-sm">
                                <span className="font-medium">Almond Oil 1L</span>
                                <span className="text-secondary font-bold">210 units</span>
                            </li>
                        </ul>
                    </DashboardCard>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default VendorDashboard;
