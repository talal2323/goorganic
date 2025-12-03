'use client'

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { DashboardCard, Button, Icon } from '@/components/common/UIComponents';
import { getSubscriptionPlans, getSubscriptionUsage, requestSubscriptionUpgrade, cancelSubscription } from '@/utils/subscriptionApi';
import { showToast } from '@/utils/toast';

const VendorSubscriptions = () => {
    const [loading, setLoading] = useState(true);
    const [plans, setPlans] = useState([]);
    const [currentPlan, setCurrentPlan] = useState(null);
    const [usage, setUsage] = useState(null);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [upgrading, setUpgrading] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    // Fetch available plans and current usage
    useEffect(() => {
        fetchPlansAndUsage();
    }, []);

    const fetchPlansAndUsage = async () => {
        try {
            setLoading(true);

            // Fetch available plans
            const plansData = await getSubscriptionPlans();

            // Handle different possible response structures
            let parsedPlans = [];
            if (plansData.plans) {
                parsedPlans = plansData.plans;
            } else if (Array.isArray(plansData)) {
                parsedPlans = plansData;
            } else if (plansData.data) {
                parsedPlans = plansData.data;
            }

            setPlans(parsedPlans);

            // Fetch current usage/subscription info
            const usageData = await getSubscriptionUsage();
            setUsage(usageData);
            setCurrentPlan(usageData.planName || 'free');
        } catch (error) {
            console.error('Error fetching subscription data:', error);
            console.error('Error details:', error.response);
            showToast.error(error.response?.data?.message || 'Failed to load subscription data');
        } finally {
            setLoading(false);
        }
    };

    const handleUpgrade = (plan) => {
        setSelectedPlan(plan);
        setShowUpgradeModal(true);
    };

    const confirmUpgrade = async () => {
        if (!selectedPlan) return;

        try {
            setUpgrading(true);
            const response = await requestSubscriptionUpgrade(selectedPlan.name);
            showToast.success(response.message || 'Upgrade request sent to admin successfully!');
            setShowUpgradeModal(false);
        } catch (error) {
            showToast.error(error.response?.data?.message || 'Failed to send upgrade request');
        } finally {
            setUpgrading(false);
        }
    };

    const handleCancelSubscription = () => {
        setShowCancelModal(true);
    };

    const confirmCancel = async () => {
        try {
            setCancelling(true);
            const response = await cancelSubscription();
            showToast.success(response.message || 'Subscription cancelled successfully!');
            setShowCancelModal(false);
            // Refresh data
            await fetchPlansAndUsage();
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to cancel subscription';
            showToast.error(errorMsg);
            if (error.response?.data?.productCount && error.response?.data?.maxAllowed) {
                showToast.warning(`You have ${error.response.data.productCount} products. Maximum allowed: ${error.response.data.maxAllowed}`);
            }
        } finally {
            setCancelling(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <DashboardLayout title="Subscriptions" userRole="vendor">
                <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">Loading subscription details...</div>
                </div>
            </DashboardLayout>
        );
    }

    const isFreePlan = currentPlan === 'free';
    const isPaidPlan = currentPlan === 'paid';
    const currentPlanData = plans.find(p => p.name === currentPlan);

    return (
        <DashboardLayout title="Subscriptions" userRole="vendor">
            <DashboardCard title="Manage Your Subscription">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Current Plan Card */}
                    <div className={`md:col-span-1 rounded-xl p-6 border-2 shadow-lg ${isPaidPlan ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-300'
                        }`}>
                        <h3 className="text-lg font-bold text-gray-800">Current Plan</h3>
                        <p className={`text-4xl font-extrabold mt-2 mb-4 ${isPaidPlan ? 'text-green-600' : 'text-gray-600'
                            }`}>
                            {currentPlan?.toUpperCase() || 'FREE'}
                        </p>
                        {currentPlanData && (
                            <>
                                <p className="text-sm text-gray-600">PKR {currentPlanData.price.toLocaleString()} / month</p>
                                {usage?.endDate && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Expires: {formatDate(usage.endDate)}
                                    </p>
                                )}
                            </>
                        )}
                        {isFreePlan && (
                            <p className="text-sm text-gray-600">Free Forever</p>
                        )}

                        {/* Usage Stats */}
                        {usage && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-xs text-gray-600 mb-2">Product Usage</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold">
                                        {usage.productCount || 0} / {usage.productLimit || currentPlanData?.productLimit || 0}
                                    </span>
                                    <span className="text-xs text-gray-500">Products</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                    <div
                                        className={`h-2 rounded-full ${isPaidPlan ? 'bg-green-500' : 'bg-gray-500'
                                            }`}
                                        style={{
                                            width: `${Math.min(100, ((usage.productCount || 0) / (usage.productLimit || 1)) * 100)}%`
                                        }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        {/* Cancel Subscription Button for Paid Plans */}
                        {isPaidPlan && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <Button
                                    onClick={handleCancelSubscription}
                                    primary={false}
                                    className="w-full text-red-600 border-red-300 hover:bg-red-50"
                                >
                                    Cancel Subscription
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Features & Available Plans */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Current Plan Features */}
                        {currentPlanData && (
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Current Plan Features</h3>
                                <ul className="grid grid-cols-2 gap-4 text-sm text-gray-700 mt-4">
                                    <li className="flex items-center">
                                        <Icon path="M5 13l4 4L19 7" className="w-4 h-4 mr-2 text-green-600" />
                                        {currentPlanData.productLimit} Product Listings
                                    </li>
                                    {currentPlanData.features?.map((feature, idx) => (
                                        <li key={idx} className="flex items-center">
                                            <Icon path="M5 13l4 4L19 7" className="w-4 h-4 mr-2 text-green-600" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Available Plans */}
                        {isFreePlan && (
                            <div className="pt-4 border-t">
                                <h4 className="font-semibold text-gray-800 mb-4">Upgrade Your Plan</h4>
                                <div className="grid grid-cols-1 gap-4">
                                    {plans
                                        .filter(plan => plan.name !== currentPlan)
                                        .map((plan) => (
                                            <div
                                                key={plan._id}
                                                className="border-2 border-green-500 rounded-lg p-4 bg-green-50"
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h5 className="text-lg font-bold text-gray-800 capitalize">
                                                            {plan.name} Plan
                                                        </h5>
                                                        <p className="text-2xl font-bold text-green-600 mt-1">
                                                            PKR {plan.price.toLocaleString()}
                                                            <span className="text-sm font-normal text-gray-500"> / month</span>
                                                        </p>
                                                    </div>
                                                    <Button
                                                        onClick={() => handleUpgrade(plan)}
                                                        className="px-4 py-2"
                                                    >
                                                        Upgrade Now
                                                    </Button>
                                                </div>
                                                <ul className="space-y-1 text-sm text-gray-700">
                                                    <li className="flex items-center">
                                                        <Icon path="M5 13l4 4L19 7" className="w-4 h-4 mr-2 text-green-600" />
                                                        {plan.productLimit} Products
                                                    </li>
                                                    {plan.features?.map((feature, idx) => (
                                                        <li key={idx} className="flex items-center">
                                                            <Icon path="M5 13l4 4L19 7" className="w-4 h-4 mr-2 text-green-600" />
                                                            {feature}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DashboardCard>

            {/* Upgrade Modal */}
            {showUpgradeModal && selectedPlan && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold mb-4">Upgrade to {selectedPlan.name} Plan</h3>
                        <div className="mb-4">
                            <p className="text-gray-600 mb-2">You are upgrading to:</p>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-2xl font-bold text-green-600">
                                    PKR {selectedPlan.price.toLocaleString()}
                                    <span className="text-sm font-normal text-gray-500"> / month</span>
                                </p>
                                <ul className="mt-3 space-y-1 text-sm text-gray-700">
                                    <li>✓ {selectedPlan.productLimit} Products</li>
                                    {selectedPlan.features?.map((feature, idx) => (
                                        <li key={idx}>✓ {feature}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Click the button below to send an upgrade request to the administrator.
                            You will be notified once your request is processed.
                        </p>
                        <div className="flex gap-3">
                            <Button
                                onClick={() => setShowUpgradeModal(false)}
                                primary={false}
                                className="flex-1"
                                disabled={upgrading}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={confirmUpgrade}
                                className="flex-1"
                                disabled={upgrading}
                            >
                                {upgrading ? 'Sending Request...' : 'Request Upgrade'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Subscription Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold mb-4 text-red-600">Cancel Subscription</h3>
                        <div className="mb-4">
                            <p className="text-gray-700 mb-3">
                                Are you sure you want to cancel your <span className="font-bold">{currentPlan?.toUpperCase()}</span> subscription?
                            </p>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-3">
                                <p className="text-sm text-yellow-800 font-medium mb-2">⚠️ Important:</p>
                                <ul className="text-sm text-yellow-700 space-y-1">
                                    <li>• You will be downgraded to the FREE plan</li>
                                    <li>• Product limit will be reduced to {plans.find(p => p.name === 'free')?.productLimit || 8} products</li>
                                    <li>• Premium features will be disabled</li>
                                    <li>• You can upgrade again anytime</li>
                                </ul>
                            </div>
                            {usage?.productCount > (plans.find(p => p.name === 'free')?.productLimit || 8) && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                                    <p className="text-sm text-red-700">
                                        <strong>Note:</strong> You currently have {usage.productCount} products.
                                        Please reduce to {plans.find(p => p.name === 'free')?.productLimit || 8} or fewer before cancelling.
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <Button
                                onClick={() => setShowCancelModal(false)}
                                primary={false}
                                className="flex-1"
                                disabled={cancelling}
                            >
                                Keep Subscription
                            </Button>
                            <Button
                                onClick={confirmCancel}
                                className="flex-1 bg-red-600 hover:bg-red-700"
                                disabled={cancelling}
                            >
                                {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default VendorSubscriptions;

