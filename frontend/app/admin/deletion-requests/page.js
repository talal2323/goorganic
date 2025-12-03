'use client'

import { useState, useEffect } from 'react';
import { getDeletionRequests, approveDeletion, rejectDeletion } from '@/utils/userApi';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { showToast } from '@/utils/toast';

const DeletionRequestsPage = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const data = await getDeletionRequests();
            setRequests(data);
            setLoading(false);
        } catch (error) {
            showToast.error('Failed to load deletion requests');
            setLoading(false);
        }
    };

    const handleApprove = async (userId, userName) => {
        const confirmMsg = `Are you sure you want to DELETE the account of "${userName}"?\n\nThis will:\n- Mark account as deleted\n- Prevent user from logging in\n- Send notification to user\n\nType "CONFIRM" to proceed:`;

        const confirmation = prompt(confirmMsg);

        if (confirmation !== 'CONFIRM') {
            showToast.error('Deletion cancelled - confirmation required');
            return;
        }

        try {
            await approveDeletion(userId);
            showToast.success('Account deleted successfully. User has been notified.');
            fetchRequests(); // Refresh list
        } catch (error) {
            showToast.error(error.response?.data?.message || 'Failed to delete account');
        }
    };

    const handleReject = async (userId, userName) => {
        const rejectionReason = prompt(`Reject deletion request for "${userName}".\n\nReason (will be sent to user):`);

        if (!rejectionReason) {
            showToast.error('Rejection reason required');
            return;
        }

        try {
            await rejectDeletion(userId, rejectionReason);
            showToast.success('Deletion request rejected. User has been notified.');
            fetchRequests(); // Refresh list
        } catch (error) {
            showToast.error(error.response?.data?.message || 'Failed to reject request');
        }
    };

    return (
        <DashboardLayout title="Account Deletion Requests" userRole="admin">
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Pending Deletion Requests</h2>
                    <button
                        onClick={fetchRequests}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                    >
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        <p className="mt-2 text-gray-600">Loading...</p>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="mt-2">No pending deletion requests</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {requests.map((req) => (
                                    <tr key={req._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{req.name}</div>
                                            <div className="text-sm text-gray-500">{req.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                {req.roles?.join(', ') || 'customer'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(req.deletionRequestDate).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                                            <div className="line-clamp-2" title={req.deletionReason}>
                                                {req.deletionReason}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => handleApprove(req._id, req.name)}
                                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
                                            >
                                                Approve Delete
                                            </button>
                                            <button
                                                onClick={() => handleReject(req._id, req.name)}
                                                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition"
                                            >
                                                Reject
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default DeletionRequestsPage;

