'use client'

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { DashboardCard, Button, Icon } from '@/components/common/UIComponents';
import { getAllSubscriptionBoxes, adminToggleBoxStatus, adminDeleteSubscriptionBox } from '@/utils/subscriptionBoxApi';
import { showToast } from '@/utils/toast';

const AdminSubscriptionBoxesPage = () => {
    const [boxes, setBoxes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [actionLoading, setActionLoading] = useState({});
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const LIMIT = 20;

    useEffect(() => {
        fetchBoxes();
    }, [currentPage, filterStatus, searchQuery]);

    const fetchBoxes = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: LIMIT,
            };

            if (filterStatus !== 'all') {
                params.status = filterStatus;
            }

            const data = await getAllSubscriptionBoxes(params);
            setBoxes(Array.isArray(data.boxes) ? data.boxes : []);
            setTotalPages(data.pages || 1);
        } catch (error) {
            showToast.error(error.response?.data?.message || 'Failed to fetch subscription boxes');
            setBoxes([]);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (boxId, currentStatus) => {
        try {
            setActionLoading((prev) => ({ ...prev, [boxId]: true }));
            await adminToggleBoxStatus(boxId, !currentStatus);
            showToast.success(`Box ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
            fetchBoxes();
        } catch (error) {
            showToast.error(error.response?.data?.message || 'Failed to update box status');
        } finally {
            setActionLoading((prev) => ({ ...prev, [boxId]: false }));
        }
    };

    const handleDelete = async () => {
        const boxId = showDeleteConfirm;
        try {
            setDeleting(true);
            await adminDeleteSubscriptionBox(boxId);
            showToast.success('Subscription box deleted successfully');
            setShowDeleteConfirm(null);
            fetchBoxes();
        } catch (error) {
            showToast.error(error.response?.data?.message || 'Failed to delete subscription box');
        } finally {
            setDeleting(false);
        }
    };

    const filteredBoxes = boxes.filter((box) =>
        box.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        box.vendor?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        box.vendor?.shopName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout title="Subscription Boxes" userRole="admin">
            <DashboardCard title="" className="!p-0 overflow-hidden">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b border-gray-200 gap-4">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800">Subscription Boxes Management</h3>
                        <p className="text-sm text-gray-500">Manage all vendor-created subscription boxes.</p>
                    </div>
                </div>

                <div className="p-4 border-b border-gray-200 space-y-4">
                    {/* Search and Filters */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Search by box title or vendor name..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                        <div className="flex gap-2">
                            {['all', 'active', 'inactive'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => {
                                        setFilterStatus(status);
                                        setCurrentPage(1);
                                    }}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === status
                                            ? 'bg-secondary text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading subscription boxes...</div>
                ) : filteredBoxes.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No subscription boxes found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {['Title', 'Vendor', 'Frequency', 'Price', 'Products', 'Status', 'Actions'].map(
                                        (header) => (
                                            <th
                                                key={header}
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                {header}
                                            </th>
                                        )
                                    )}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredBoxes.map((box) => (
                                    <tr key={box._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">{box.title}</div>
                                            <div className="text-xs text-gray-500 line-clamp-1 max-w-[300px]">
                                                {box.description}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            <div className="font-medium">
                                                {box.vendor?.shopName || box.vendor?.name}
                                            </div>
                                            <div className="text-xs text-gray-500">{box.vendor?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">
                                            {box.frequency}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                            Rs. {Number(box.price || 0).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {box.products?.length || 0}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${box.isActive
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}
                                            >
                                                {box.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-2">
                                            <button
                                                onClick={() => handleToggleStatus(box._id, box.isActive)}
                                                disabled={actionLoading[box._id]}
                                                className="text-blue-600 hover:text-blue-800 font-medium disabled:opacity-60"
                                            >
                                                {actionLoading[box._id]
                                                    ? 'Updating...'
                                                    : box.isActive
                                                        ? 'Deactivate'
                                                        : 'Activate'}
                                            </button>
                                            <button
                                                onClick={() => setShowDeleteConfirm(box._id)}
                                                className="text-red-600 hover:text-red-800 font-medium"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="mt-8 flex justify-center items-center space-x-2 pb-8">
                        <Button
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            primary={false}
                            className="px-4 py-2"
                        >
                            Previous
                        </Button>
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            let pageNumber;
                            if (totalPages <= 5) {
                                pageNumber = i + 1;
                            } else if (currentPage <= 3) {
                                pageNumber = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNumber = totalPages - 4 + i;
                            } else {
                                pageNumber = currentPage - 2 + i;
                            }
                            return (
                                <button
                                    key={pageNumber}
                                    onClick={() => setCurrentPage(pageNumber)}
                                    className={`px-4 py-2 text-sm font-medium rounded-md border ${currentPage === pageNumber
                                            ? 'bg-secondary text-white border-secondary'
                                            : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                                        }`}
                                >
                                    {pageNumber}
                                </button>
                            );
                        })}
                        <Button
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            primary={false}
                            className="px-4 py-2"
                        >
                            Next
                        </Button>
                    </div>
                )}
            </DashboardCard>

            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-sm shadow-xl">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Delete Subscription Box?</h3>
                            <p className="text-sm text-gray-600 mb-6">
                                This action cannot be undone. Are you sure you want to delete this subscription box?
                            </p>
                            <div className="flex items-center justify-end gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(null)}
                                    disabled={deleting}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                                >
                                    {deleting ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default AdminSubscriptionBoxesPage;
