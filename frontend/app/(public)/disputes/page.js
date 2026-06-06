'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAppContext } from '@/context/AppContext';
import { getMyDisputes } from '@/utils/disputeApi';
import { Button } from '@/components/common/UIComponents';

export default function MyDisputesPage() {
    const router = useRouter();
    const { state } = useAppContext();
    const [disputes, setDisputes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!state.isLoggedIn) {
            router.push('/auth/login?redirect=/disputes');
            return;
        }

        const fetchDisputes = async () => {
            try {
                const data = await getMyDisputes();
                setDisputes(data || []);
            } catch (error) {
                console.error('Error fetching disputes:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDisputes();
    }, [state.isLoggedIn, router]);

    if (loading) {
        return (
            <div className="bg-gray-50 min-h-screen py-12 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Disputes</h1>
                    <Button onClick={() => router.push('/orders')} className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50">
                        View Orders
                    </Button>
                </div>

                {disputes.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-medium text-gray-900 mb-2">No Disputes Raised</h2>
                        <p className="text-gray-500 mb-6">You haven't raised any disputes for your orders.</p>
                        <Button onClick={() => router.push('/orders')}>View Order History</Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {disputes.map((dispute) => (
                            <div key={dispute._id} className="bg-white rounded-lg shadow overflow-hidden">
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                    dispute.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                                                    dispute.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {dispute.status}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    Raised on {new Date(dispute.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900">{dispute.subject}</h3>
                                            <p className="text-sm text-gray-600 mt-1">Issue Type: <span className="font-medium text-gray-800">{dispute.issueType}</span></p>
                                        </div>
                                        <div className="text-left md:text-right">
                                            <p className="text-sm text-gray-500">Related Order</p>
                                            <p className="font-semibold text-gray-900">{dispute.order?.orderNumber || dispute.order?._id.slice(-8).toUpperCase()}</p>
                                            <Button onClick={() => router.push(`/order-confirmation?orderId=${dispute.order?._id}`)} className="mt-2 text-xs py-1 px-3 bg-white text-secondary border border-secondary hover:bg-green-50">
                                                View Order
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="md:col-span-2">
                                            <p className="text-sm font-semibold text-gray-700 mb-1">Description</p>
                                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                {dispute.description}
                                            </p>
                                        </div>
                                        {dispute.proofImage?.url && (
                                            <div>
                                                <p className="text-sm font-semibold text-gray-700 mb-1">Proof Image</p>
                                                <div className="relative h-24 w-full rounded-lg overflow-hidden border border-gray-200">
                                                    <Image src={dispute.proofImage.url} alt="Proof" fill sizes="200px" className="object-cover" />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {dispute.resolutionNotes && (
                                        <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-100">
                                            <p className="text-sm font-bold text-blue-900 mb-1">Resolution Update</p>
                                            <p className="text-sm text-blue-800">{dispute.resolutionNotes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
