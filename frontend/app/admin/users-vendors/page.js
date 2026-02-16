'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button, Icon } from '@/components/common/UIComponents';
import { getAllCustomers, suspendUser, unsuspendUser } from '@/utils/userApi';
import { getAllVendorsAdmin, approveVendor, rejectVendor } from '@/utils/vendorApi';
import { showToast } from '@/utils/toast';

const AdminUsersVendors = () => {
    const [activeTab, setActiveTab] = useState('vendors'); // 'vendors' or 'users'
    const [vendors, setVendors] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All'); // All, Pending, Approved, Rejected
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [selectedPdf, setSelectedPdf] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [showSuspendModal, setShowSuspendModal] = useState(false);
    const [suspensionReason, setSuspensionReason] = useState('');

    // Fetch all vendors
    const fetchVendors = async () => {
        try {
            setLoading(true);
            const data = await getAllVendorsAdmin();
            // Backend returns { vendors: [...], page, totalPages }
            setVendors(Array.isArray(data.vendors) ? data.vendors : []);
        } catch (error) {
            console.error('Error fetching vendors:', error);
            showToast.error(error.response?.data?.message || 'Failed to fetch vendors');
            setVendors([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    // Fetch all users (customers)
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await getAllCustomers();
            // Backend returns { customers: [...], page, totalPages }
            setUsers(Array.isArray(data.customers) ? data.customers : []);
        } catch (error) {
            console.error('Error fetching users:', error);
            showToast.error(error.response?.data?.message || 'Failed to fetch users');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'vendors') {
            fetchVendors();
        } else {
            fetchUsers();
        }
    }, [activeTab]);

    // Filter vendors based on status
    const filteredVendors = Array.isArray(vendors) ? vendors.filter(vendor => {
        if (filter === 'All') return true;
        if (filter === 'Suspended') return vendor.isSuspended;
        return vendor.vendorStatus === filter;
    }) : [];

    // Filter users based on status
    const filteredUsers = Array.isArray(users) ? users.filter(user => {
        if (filter === 'All') return true;
        if (filter === 'Suspended') return user.isSuspended;
        return true;
    }) : [];

    // Approve vendor
    const handleApprove = async (vendorId) => {
        if (!confirm('Are you sure you want to approve this vendor?')) return;

        try {
            setActionLoading(true);
            await approveVendor(vendorId);
            showToast.success('Vendor approved successfully! Email notification sent.');
            fetchVendors(); // Refresh list
        } catch (error) {
            showToast.error(error.response?.data?.message || 'Failed to approve vendor');
        } finally {
            setActionLoading(false);
        }
    };

    // Open details modal
    const openDetailsModal = (vendor) => {
        setSelectedVendor(vendor);
        setShowDetailsModal(true);
    };

    // Open reject modal
    const openRejectModal = (vendor) => {
        setSelectedVendor(vendor);
        setRejectionReason('');
        setShowRejectModal(true);
    };

    // Reject vendor
    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            showToast.error('Please provide a rejection reason');
            return;
        }

        try {
            setActionLoading(true);
            await rejectVendor(selectedVendor._id, rejectionReason);
            showToast.success('Vendor rejected. Email notification sent.');
            setShowRejectModal(false);
            setSelectedVendor(null);
            setRejectionReason('');
            fetchVendors(); // Refresh list
        } catch (error) {
            showToast.error(error.response?.data?.message || 'Failed to reject vendor');
        } finally {
            setActionLoading(false);
        }
    };

    // Open suspend modal
    const openSuspendModal = (user) => {
        setSelectedUser(user);
        setSuspensionReason('');
        setShowSuspendModal(true);
    };

    // Handle user suspension
    const handleSuspend = async () => {
        if (!suspensionReason.trim()) {
            showToast.error('Please provide a suspension reason');
            return;
        }

        try {
            setActionLoading(true);
            await suspendUser(selectedUser._id, suspensionReason);

            // Refresh the correct list based on active tab
            if (activeTab === 'vendors') {
                await fetchVendors();
            } else {
                await fetchUsers();
            }

            showToast.success('User suspended successfully. Email notification sent.');
            setShowSuspendModal(false);
            setSelectedUser(null);
            setSuspensionReason('');
        } catch (error) {
            showToast.error(error.response?.data?.message || 'Failed to suspend user');
        } finally {
            setActionLoading(false);
        }
    };

    // Handle user unsuspension
    const handleUnsuspend = async (userId) => {
        if (!confirm('Are you sure you want to unsuspend this user?')) return;

        try {
            setActionLoading(true);
            await unsuspendUser(userId);
            showToast.success('User unsuspended successfully. Email notification sent.');
            // Refresh the correct list based on active tab
            if (activeTab === 'vendors') {
                await fetchVendors();
            } else {
                await fetchUsers();
            }
        } catch (error) {
            showToast.error(error.response?.data?.message || 'Failed to unsuspend user');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <DashboardLayout title="Users & Vendors" userRole="admin">
            <div className="space-y-6">
                {/* Main Tabs - Users vs Vendors */}
                <div className="bg-white rounded-lg shadow p-2">
                    <div className="flex gap-2">
                        <button
                            onClick={() => { setActiveTab('vendors'); setFilter('All'); }}
                            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition ${activeTab === 'vendors'
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Vendors
                        </button>
                        <button
                            onClick={() => { setActiveTab('users'); setFilter('All'); }}
                            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition ${activeTab === 'users'
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Users (Customers)
                        </button>
                    </div>
                </div>

                {/* Vendors Tab Content */}
                {activeTab === 'vendors' && (
                    <>
                        {/* Header with Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
                                <p className="text-sm text-gray-600">Total Vendors</p>
                                <p className="text-2xl font-bold text-gray-800">{vendors.length}</p>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
                                <p className="text-sm text-gray-600">Pending Approval</p>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {vendors.filter(v => v.vendorStatus === 'Pending').length}
                                </p>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
                                <p className="text-sm text-gray-600">Approved</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {vendors.filter(v => v.vendorStatus === 'Approved').length}
                                </p>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
                                <p className="text-sm text-gray-600">Rejected</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {vendors.filter(v => v.vendorStatus === 'Rejected').length}
                                </p>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-orange-500">
                                <p className="text-sm text-gray-600">Suspended</p>
                                <p className="text-2xl font-bold text-orange-600">
                                    {vendors.filter(v => v.isSuspended).length}
                                </p>
                            </div>
                        </div>

                        {/* Filter Tabs */}
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="flex flex-wrap gap-2 mb-4">
                                {['All', 'Pending', 'Approved', 'Rejected', 'Suspended'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setFilter(status)}
                                        className={`px-4 py-2 rounded-lg font-medium transition ${filter === status
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>

                            {/* Vendors Table */}
                            {loading ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">Loading vendors...</p>
                                </div>
                            ) : filteredVendors.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">No vendors found</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor Info</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shop Name</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredVendors.map(vendor => (
                                                <tr key={vendor._id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center">
                                                            <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                                                                {vendor.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="ml-3">
                                                                <p className="text-sm font-medium text-gray-900">{vendor.name}</p>
                                                                <p className="text-xs text-gray-500">{vendor.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-700">
                                                        {vendor.shopName || 'N/A'}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-700">
                                                        {vendor.phoneNumber || 'N/A'}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex flex-col gap-1">
                                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${vendor.vendorStatus === 'Approved'
                                                                ? 'bg-green-100 text-green-800'
                                                                : vendor.vendorStatus === 'Rejected'
                                                                    ? 'bg-red-100 text-red-800'
                                                                    : 'bg-yellow-100 text-yellow-800'
                                                                }`}>
                                                                {vendor.vendorStatus}
                                                            </span>
                                                            {vendor.isSuspended && (
                                                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                                    Suspended
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-500">
                                                        {new Date(vendor.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm space-x-2">
                                                        <button
                                                            onClick={() => openDetailsModal(vendor)}
                                                            className="text-blue-600 hover:text-blue-800 font-medium"
                                                        >
                                                            👁 View Details
                                                        </button>
                                                        {(vendor.vendorStatus === 'Pending' || vendor.vendorStatus === 'Rejected') && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleApprove(vendor._id)}
                                                                    disabled={actionLoading}
                                                                    className="text-green-600 hover:text-green-800 font-medium disabled:opacity-50"
                                                                >
                                                                    ✓ Approve
                                                                </button>
                                                                <button
                                                                    onClick={() => openRejectModal(vendor)}
                                                                    disabled={actionLoading}
                                                                    className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                                                                >
                                                                    ✗ Reject
                                                                </button>
                                                            </>
                                                        )}
                                                        {vendor.vendorStatus === 'Rejected' && vendor.rejectionReason && (
                                                            <button
                                                                onClick={() => alert(`Rejection Reason:\n${vendor.rejectionReason}`)}
                                                                className="text-gray-600 hover:text-gray-800 text-xs"
                                                            >
                                                                View Reason
                                                            </button>
                                                        )}
                                                        {vendor.vendorStatus === 'Approved' && (
                                                            <>
                                                                {vendor.isSuspended ? (
                                                                    <button
                                                                        onClick={() => handleUnsuspend(vendor._id)}
                                                                        disabled={actionLoading}
                                                                        className="text-green-600 hover:text-green-800 font-medium disabled:opacity-50"
                                                                    >
                                                                        ✓ Unsuspend
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedUser(vendor);
                                                                            setSuspensionReason('');
                                                                            setShowSuspendModal(true);
                                                                        }}
                                                                        disabled={actionLoading}
                                                                        className="text-orange-600 hover:text-orange-800 font-medium disabled:opacity-50"
                                                                    >
                                                                        🚫 Suspend
                                                                    </button>
                                                                )}
                                                                {vendor.suspensionReason && (
                                                                    <button
                                                                        onClick={() => alert(`Suspension Reason:\n${vendor.suspensionReason}\n\nSuspended At: ${new Date(vendor.suspendedAt).toLocaleString()}`)}
                                                                        className="text-gray-600 hover:text-gray-800 text-xs"
                                                                    >
                                                                        View Reason
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Users Tab Content */}
                {activeTab === 'users' && (
                    <>
                        {/* Header with Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
                                <p className="text-sm text-gray-600">Total Customers</p>
                                <p className="text-2xl font-bold text-gray-800">{users.length}</p>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-orange-500">
                                <p className="text-sm text-gray-600">Suspended</p>
                                <p className="text-2xl font-bold text-orange-600">
                                    {users.filter(u => u.isSuspended).length}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-4">
                            {/* Filter Tabs */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {['All', 'Suspended'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setFilter(status)}
                                        className={`px-4 py-2 rounded-lg font-medium transition ${filter === status
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>

                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">Customer Users</h3>
                                <p className="text-sm text-gray-600">All registered customers on the platform</p>
                            </div>

                            {loading ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">Loading users...</p>
                                </div>
                            ) : filteredUsers.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">No users found</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User Info</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredUsers.map(user => (
                                                <tr key={user._id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center">
                                                            <div className="w-10 h-10 bg-secondary text-white rounded-full flex items-center justify-center font-bold">
                                                                {user.name?.charAt(0).toUpperCase() || 'U'}
                                                            </div>
                                                            <div className="ml-3">
                                                                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-700">
                                                        {user.email}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-700">
                                                        {user.phoneNumber || '-'}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-500">
                                                        {new Date(user.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        {user.isSuspended ? (
                                                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                                Suspended
                                                            </span>
                                                        ) : (
                                                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                                Active
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm space-x-2">
                                                        {user.isSuspended ? (
                                                            <button
                                                                onClick={() => handleUnsuspend(user._id)}
                                                                disabled={actionLoading}
                                                                className="text-green-600 hover:text-green-800 font-medium disabled:opacity-50"
                                                            >
                                                                ✓ Unsuspend
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => openSuspendModal(user)}
                                                                disabled={actionLoading}
                                                                className="text-orange-600 hover:text-orange-800 font-medium disabled:opacity-50"
                                                            >
                                                                🚫 Suspend
                                                            </button>
                                                        )}
                                                        {user.suspensionReason && (
                                                            <button
                                                                onClick={() => alert(`Suspension Reason:\n${user.suspensionReason}\n\nSuspended At: ${new Date(user.suspendedAt).toLocaleString()}`)}
                                                                className="text-gray-600 hover:text-gray-800 text-xs"
                                                            >
                                                                View Reason
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Vendor Details Modal */}
            {showDetailsModal && selectedVendor && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
                        {/* Modal Header */}
                        <div className="bg-primary text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
                            <h3 className="text-xl font-semibold">Vendor Application Details</h3>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="text-white hover:text-gray-200"
                            >
                                <span className="text-2xl">×</span>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 max-h-[80vh] overflow-y-auto">
                            {/* Status Banner */}
                            <div className={`mb-6 p-4 rounded-lg ${selectedVendor.vendorStatus === 'Approved' ? 'bg-green-50 border border-green-200' :
                                selectedVendor.vendorStatus === 'Rejected' ? 'bg-red-50 border border-red-200' :
                                    'bg-yellow-50 border border-yellow-200'
                                }`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Current Status</p>
                                        <p className={`text-lg font-bold ${selectedVendor.vendorStatus === 'Approved' ? 'text-green-700' :
                                            selectedVendor.vendorStatus === 'Rejected' ? 'text-red-700' :
                                                'text-yellow-700'
                                            }`}>
                                            {selectedVendor.vendorStatus}
                                        </p>
                                    </div>
                                    {(selectedVendor.vendorStatus === 'Pending' || selectedVendor.vendorStatus === 'Rejected') && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setShowDetailsModal(false);
                                                    handleApprove(selectedVendor._id);
                                                }}
                                                disabled={actionLoading}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                            >
                                                ✓ Approve
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowDetailsModal(false);
                                                    openRejectModal(selectedVendor);
                                                }}
                                                disabled={actionLoading}
                                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                            >
                                                ✗ Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {selectedVendor.vendorStatus === 'Rejected' && selectedVendor.rejectionReason && (
                                    <div className="mt-3 pt-3 border-t border-red-200">
                                        <p className="text-sm font-medium text-red-700">Rejection Reason:</p>
                                        <p className="text-sm text-red-600 mt-1">{selectedVendor.rejectionReason}</p>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Personal Information */}
                                <div className="col-span-2">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Personal Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Full Name</p>
                                            <p className="font-medium text-gray-900">{selectedVendor.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Email</p>
                                            <p className="font-medium text-gray-900">{selectedVendor.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Phone Number</p>
                                            <p className="font-medium text-gray-900">{selectedVendor.phoneNumber || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Registration Date</p>
                                            <p className="font-medium text-gray-900">{new Date(selectedVendor.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Business Information */}
                                <div className="col-span-2">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Business Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Shop Name</p>
                                            <p className="font-medium text-gray-900">{selectedVendor.shopName || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Business Category</p>
                                            <p className="font-medium text-gray-900">{selectedVendor.businessCategory || 'N/A'}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-sm text-gray-600">Shop Description</p>
                                            <p className="font-medium text-gray-900">{selectedVendor.shopDescription || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Product Categories</p>
                                            <p className="font-medium text-gray-900">
                                                {selectedVendor.productCategories && selectedVendor.productCategories.length > 0
                                                    ? selectedVendor.productCategories.join(', ')
                                                    : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Shop Address */}
                                <div className="col-span-2">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Shop Address</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600">City</p>
                                            <p className="font-medium text-gray-900">{selectedVendor.shopAddress?.city || 'N/A'}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-sm text-gray-600">Full Address</p>
                                            <p className="font-medium text-gray-900">{selectedVendor.shopAddress?.address || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Shop Images */}
                                {selectedVendor.shopImages && selectedVendor.shopImages.length > 0 && (
                                    <div className="col-span-2">
                                        <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Shop Images</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {selectedVendor.shopImages.map((img, idx) => (
                                                <div key={idx} className="relative w-full h-32 rounded-lg border border-gray-200 overflow-hidden cursor-pointer hover:opacity-80" onClick={() => window.open(img.url, '_blank')}>
                                                    <Image
                                                        src={img.url}
                                                        alt={`Shop ${idx + 1}`}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* CNIC Images */}
                                <div className="col-span-2">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">CNIC Verification</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {selectedVendor.cnic?.front?.url && (
                                            <div>
                                                <p className="text-sm text-gray-600 mb-2">CNIC Front</p>
                                                <div className="relative w-full h-48 border border-gray-300 rounded-lg overflow-hidden cursor-pointer hover:opacity-80" onClick={() => window.open(selectedVendor.cnic.front.url, '_blank')}>
                                                    <Image
                                                        src={selectedVendor.cnic.front.url}
                                                        alt="CNIC Front"
                                                        fill
                                                        className="object-contain"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        {selectedVendor.cnic?.back?.url && (
                                            <div>
                                                <p className="text-sm text-gray-600 mb-2">CNIC Back</p>
                                                <div className="relative w-full h-48 border border-gray-300 rounded-lg overflow-hidden cursor-pointer hover:opacity-80" onClick={() => window.open(selectedVendor.cnic.back.url, '_blank')}>
                                                    <Image
                                                        src={selectedVendor.cnic.back.url}
                                                        alt="CNIC Back"
                                                        fill
                                                        className="object-contain"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        {!selectedVendor.cnic?.front?.url && !selectedVendor.cnic?.back?.url && (
                                            <p className="col-span-2 text-gray-500">No CNIC images uploaded</p>
                                        )}
                                    </div>
                                </div>

                                {/* Subscription Information */}
                                <div className="col-span-2">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Subscription Details</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Current Plan</p>
                                            <p className="font-medium text-gray-900 capitalize">
                                                {selectedVendor.subscription?.plan || 'free'}
                                            </p>
                                        </div>
                                        {selectedVendor.subscription?.startDate && (
                                            <div>
                                                <p className="text-sm text-gray-600">Start Date</p>
                                                <p className="font-medium text-gray-900">
                                                    {new Date(selectedVendor.subscription.startDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                        )}
                                        {selectedVendor.subscription?.expiryDate && (
                                            <div>
                                                <p className="text-sm text-gray-600">Expiry Date</p>
                                                <p className="font-medium text-gray-900">
                                                    {new Date(selectedVendor.subscription.expiryDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Certifications */}
                                {selectedVendor.certifications && selectedVendor.certifications.length > 0 && (
                                    <div className="col-span-2">
                                        <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Certifications</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {selectedVendor.certifications.map((cert, idx) => {
                                                const isPDF = cert.url?.toLowerCase().endsWith('.pdf') || cert.name?.toLowerCase().endsWith('.pdf');
                                                return (
                                                    <div key={idx} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition">
                                                        <p className="text-sm font-medium text-gray-700 mb-2">{cert.name || `Certificate ${idx + 1}`}</p>
                                                        {isPDF ? (
                                                            <div
                                                                className="w-full h-32 bg-red-50 rounded flex flex-col items-center justify-center cursor-pointer hover:bg-red-100 transition border-2 border-red-200"
                                                                onClick={() => {
                                                                    setSelectedPdf({ name: cert.name, url: cert.url });
                                                                    setShowPdfModal(true);
                                                                }}
                                                            >
                                                                <svg className="w-12 h-12 text-red-600 mb-2" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path d="M4 18h12V6h-4V2H4v16zm-2 1V0h10l4 4v16H2v-1z" />
                                                                    <text x="6" y="14" fontSize="6" fill="currentColor" fontWeight="bold">PDF</text>
                                                                </svg>
                                                                <p className="text-xs text-red-700 font-semibold">Click to View PDF</p>
                                                            </div>
                                                        ) : (
                                                            <img
                                                                src={cert.url}
                                                                alt={cert.name}
                                                                className="w-full h-32 object-cover rounded cursor-pointer hover:opacity-80"
                                                                onClick={() => window.open(cert.url, '_blank')}
                                                            />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end">
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PDF Viewer Modal */}
            {showPdfModal && selectedPdf && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[90vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="bg-primary text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
                            <h3 className="text-lg font-semibold">{selectedPdf.name || 'Certificate PDF'}</h3>
                            <button
                                onClick={() => {
                                    setShowPdfModal(false);
                                    setSelectedPdf(null);
                                }}
                                className="text-white hover:text-gray-200"
                            >
                                <span className="text-2xl">×</span>
                            </button>
                        </div>

                        {/* PDF Viewer */}
                        <div className="flex-1 p-4 overflow-hidden">
                            <iframe
                                src={selectedPdf.url}
                                className="w-full h-full border border-gray-300 rounded"
                                title={selectedPdf.name}
                            />
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end">
                            <button
                                onClick={() => {
                                    setShowPdfModal(false);
                                    setSelectedPdf(null);
                                }}
                                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Reject Vendor Application</h3>
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <Icon path="M6 18L18 6M6 6l12 12" className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">
                                Rejecting: <span className="font-medium text-gray-900">{selectedVendor?.name}</span>
                            </p>
                            <p className="text-sm text-gray-600 mb-4">
                                Please provide a reason for rejection. The vendor will receive this via email.
                            </p>

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Rejection Reason <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                rows="4"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="e.g., The provided CNIC image was blurry and unreadable."
                            />
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                disabled={actionLoading}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={actionLoading || !rejectionReason.trim()}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                                {actionLoading ? 'Rejecting...' : 'Reject Vendor'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Suspend User Modal */}
            {showSuspendModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Suspend User</h3>
                            <button
                                onClick={() => setShowSuspendModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <Icon path="M6 18L18 6M6 6l12 12" className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">
                                Suspending: <span className="font-medium text-gray-900">{selectedUser?.name}</span>
                            </p>
                            <p className="text-sm text-gray-600 mb-4">
                                Please provide a reason for suspension. The user will receive this via email and will not be able to login.
                            </p>

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Suspension Reason <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={suspensionReason}
                                onChange={(e) => setSuspensionReason(e.target.value)}
                                rows="4"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="e.g., Multiple violations of community guidelines, inappropriate behavior, etc."
                            />
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowSuspendModal(false)}
                                disabled={actionLoading}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSuspend}
                                disabled={actionLoading || !suspensionReason.trim()}
                                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                            >
                                {actionLoading ? 'Suspending...' : 'Suspend User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default AdminUsersVendors;

