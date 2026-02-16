'use client'

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/common/UIComponents';
import { verifySubscriptionSession } from '@/utils/subscriptionApi';
import { showToast } from '@/utils/toast';

function SuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');

    const [loading, setLoading] = React.useState(true);
    const [success, setSuccess] = React.useState(false);
    const [subscriptionDetails, setSubscriptionDetails] = React.useState(null);

    React.useEffect(() => {
        const verifySession = async () => {
            if (!sessionId) {
                showToast.error('No session ID found');
                setLoading(false);
                return;
            }

            try {
                const data = await verifySubscriptionSession(sessionId);
                setSubscriptionDetails(data);
                setSuccess(true);
                showToast.success('Subscription activated successfully!');
            } catch (error) {
                console.error('Error verifying session:', error);
                showToast.error('Failed to verify subscription');
                setSuccess(false);
            } finally {
                setLoading(false);
            }
        };

        verifySession();
    }, [sessionId]);

    if (loading) {
        return (
            <DashboardLayout title="Subscription Payment" userRole="vendor">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Verifying your subscription...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Subscription Payment" userRole="vendor">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                    {success ? (
                        <>
                            <div className="mb-6">
                                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                                    <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                                <p className="text-lg text-gray-600">Your subscription has been activated</p>
                            </div>

                            {subscriptionDetails && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                                    <p className="text-sm text-gray-600 mb-2">Subscription Plan</p>
                                    <p className="text-2xl font-bold text-green-600 capitalize mb-4">
                                        {subscriptionDetails.planName} Plan
                                    </p>
                                    <p className="text-sm text-gray-600 mb-2">
                                        Status: <span className="font-semibold text-green-600 capitalize">{subscriptionDetails.status}</span>
                                    </p>
                                    {subscriptionDetails.endDate && (
                                        <p className="text-sm text-gray-600">
                                            Valid Until: <span className="font-semibold">{new Date(subscriptionDetails.endDate).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}</span>
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="space-y-3">
                                <p className="text-gray-700">
                                    🎉 Congratulations! Your subscription is now active for 30 days and you can start using all premium features.
                                </p>
                                <p className="text-sm text-gray-500">
                                    Your subscription is valid for 30 days. You will need to manually renew your subscription before it expires.
                                </p>
                            </div>

                            <div className="mt-8 flex gap-4 justify-center">
                                <Button onClick={() => router.push('/vendor/subscriptions')}>
                                    View Subscription
                                </Button>
                                <Button 
                                    onClick={() => router.push('/vendor')}
                                    primary={false}
                                    className="border-gray-300"
                                >
                                    Go to Dashboard
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="mb-6">
                                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                                    <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">Verification Failed</h2>
                                <p className="text-lg text-gray-600">We couldn't verify your subscription</p>
                            </div>

                            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                                <p className="text-red-700">
                                    There was an issue verifying your payment. Please contact support if you were charged.
                                </p>
                            </div>

                            <div className="mt-8">
                                <Button onClick={() => router.push('/vendor/subscriptions')}>
                                    Back to Subscriptions
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

export default function SubscriptionSuccessPage() {
    return (
        <Suspense fallback={
            <DashboardLayout title="Subscription Payment" userRole="vendor">
                <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">Loading...</div>
                </div>
            </DashboardLayout>
        }>
            <SuccessContent />
        </Suspense>
    );
}
