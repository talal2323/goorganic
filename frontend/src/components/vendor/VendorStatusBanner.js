'use client'

import React from 'react';
import { Icon } from '@/components/common/UIComponents';

const VendorStatusBanner = ({ status, rejectionReason }) => {
    if (!status || status === 'Approved') return null;

    const isPending = status === 'Pending';
    const isRejected = status === 'Rejected';

    return (
        <div className={`p-4 sm:p-6 mb-6 rounded-lg border-2 ${isPending ? 'bg-yellow-50 border-yellow-400' : 'bg-red-50 border-red-400'
            }`}>
            <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 ${isPending ? 'text-yellow-600' : 'text-red-600'}`}>
                    <Icon
                        path={isPending
                            ? "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            : "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                        }
                        className="w-6 h-6 sm:w-8 sm:h-8"
                    />
                </div>
                <div className="flex-1">
                    <h3 className={`text-lg sm:text-xl font-bold mb-2 ${isPending ? 'text-yellow-800' : 'text-red-800'
                        }`}>
                        {isPending ? '⏳ Vendor Account Pending Approval' : '❌ Vendor Application Rejected'}
                    </h3>

                    {isPending && (
                        <div className="space-y-2 text-sm sm:text-base text-yellow-700">
                            <p className="font-medium">
                                Your vendor account is currently under review by our admin team.
                            </p>
                            <p>
                                You can view your dashboard and update your business information, but you won't be able to:
                            </p>
                            <ul className="list-disc list-inside ml-4 space-y-1">
                                <li>Create or manage products</li>
                                <li>View or process orders</li>
                                <li>Access analytics and reports</li>
                            </ul>
                            <p className="mt-3 font-medium">
                                💡 Please wait for admin approval. You'll receive an email notification once your account is approved.
                            </p>
                        </div>
                    )}

                    {isRejected && (
                        <div className="space-y-2 text-sm sm:text-base text-red-700">
                            <p className="font-medium">
                                Unfortunately, your vendor application was not approved at this time.
                            </p>
                            {rejectionReason && (
                                <div className="bg-red-100 border border-red-300 rounded p-3 my-2">
                                    <p className="font-semibold mb-1">Reason for rejection:</p>
                                    <p className="text-red-800">{rejectionReason}</p>
                                </div>
                            )}
                            <p>
                                You can update your business information and profile to address the issues mentioned above. Once updated, please contact our support team at <a href="mailto:goorganic.co.pk@gmail.com" className="underline font-medium">goorganic.co.pk@gmail.com</a> to request a re-review of your application.
                            </p>
                            <p className="mt-3 font-medium">
                                ⚠️ Until your account is approved, you cannot create products or process orders.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VendorStatusBanner;
