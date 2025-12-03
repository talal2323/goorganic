'use client'

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { DashboardCard, Button } from '@/components/common/UIComponents';
import { COLORS } from '@/utils/config';
import { getAllSubscriptionPlans, createSubscriptionPlan, updateSubscriptionPlan, deleteSubscriptionPlan } from '@/utils/subscriptionApi';
import { showToast } from '@/utils/toast';

const AdminSubscriptionsControl = () => {
    const [loading, setLoading] = useState(true);
    const [plans, setPlans] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        productLimit: '',
        features: []
    });
    const [featureInput, setFeatureInput] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const data = await getAllSubscriptionPlans();

            // Handle different possible response structures
            let plansData = [];
            if (data.plans) {
                plansData = data.plans;
            } else if (Array.isArray(data)) {
                plansData = data;
            } else if (data.data) {
                plansData = data.data;
            }

            setPlans(plansData);
        } catch (error) {
            console.error('Error fetching plans:', error);
            showToast.error(error.response?.data?.message || 'Failed to load subscription plans');
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setModalMode('create');
        setFormData({
            name: '',
            price: '',
            productLimit: '',
            features: []
        });
        setSelectedPlan(null);
        setShowModal(true);
    };

    const openEditModal = (plan) => {
        setModalMode('edit');
        setSelectedPlan(plan);
        setFormData({
            name: plan.name,
            price: plan.price,
            productLimit: plan.productLimit,
            features: [...(plan.features || [])]
        });
        setShowModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const addFeature = () => {
        if (featureInput.trim()) {
            setFormData(prev => ({
                ...prev,
                features: [...prev.features, featureInput.trim()]
            }));
            setFeatureInput('');
        }
    };

    const removeFeature = (index) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }));
    };

    const handleSave = async () => {
        try {
            // Validation
            if (!formData.name || !formData.price || !formData.productLimit) {
                showToast.error('Please fill all required fields');
                return;
            }

            setSaving(true);

            const payload = {
                name: formData.name,
                price: Number(formData.price),
                productLimit: Number(formData.productLimit),
                features: formData.features
            };

            if (modalMode === 'create') {
                await createSubscriptionPlan(payload);
                showToast.success('Subscription plan created successfully');
            } else {
                await updateSubscriptionPlan(selectedPlan._id, payload);
                showToast.success('Subscription plan updated successfully');
            }

            setShowModal(false);
            fetchPlans();
        } catch (error) {
            console.error('Error saving plan:', error);
            showToast.error(error.response?.data?.message || 'Failed to save subscription plan');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (planId) => {
        if (!confirm('Are you sure you want to delete this subscription plan?')) return;

        try {
            await deleteSubscriptionPlan(planId);
            showToast.success('Subscription plan deleted successfully');
            fetchPlans();
        } catch (error) {
            console.error('Error deleting plan:', error);
            showToast.error(error.response?.data?.message || 'Failed to delete subscription plan');
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Subscriptions Control" userRole="admin">
                <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">Loading subscription plans...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Subscriptions Control" userRole="admin">
            <DashboardCard title="Subscription Plans Control">
                <div className="mb-6">
                    <Button onClick={openCreateModal}>
                        + Create New Plan
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <div
                            key={plan._id}
                            className="border-2 rounded-xl p-6 shadow-md relative"
                            style={{ borderColor: plan.name === 'paid' ? COLORS.secondary : COLORS.primary }}
                        >
                            <div className="absolute top-3 right-3">
                                <span className={`px-2 py-1 text-xs rounded-full ${plan.name === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                    {plan.name?.toUpperCase()}
                                </span>
                            </div>

                            <h3
                                className="text-2xl font-bold capitalize"
                                style={{ color: plan.name === 'paid' ? COLORS.secondary : COLORS.primary }}
                            >
                                {plan.name} Plan
                            </h3>
                            <p className="text-4xl font-extrabold mt-2">PKR {plan.price.toLocaleString()}</p>
                            <p className="text-sm text-gray-500 mb-4">/ month</p>

                            <ul className="space-y-2 text-sm text-gray-700 mb-4">
                                <li>
                                    <span className="font-semibold">Product Limit:</span> {plan.productLimit}
                                </li>
                                {plan.features?.length > 0 && (
                                    <>
                                        <li className="font-semibold mt-3">Features:</li>
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="pl-4">• {feature}</li>
                                        ))}
                                    </>
                                )}
                            </ul>

                            <div className="flex gap-2 mt-6">
                                <Button
                                    primary={false}
                                    className="flex-1 text-sm"
                                    onClick={() => openEditModal(plan)}
                                >
                                    Edit
                                </Button>
                                <button
                                    onClick={() => handleDelete(plan._id)}
                                    className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}

                    {plans.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            No subscription plans found. Create your first plan!
                        </div>
                    )}
                </div>
            </DashboardCard>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">
                            {modalMode === 'create' ? 'Create New Plan' : 'Edit Plan'}
                        </h3>

                        <div className="space-y-4">
                            {/* Plan Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Plan Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g., paid, premium, basic"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    disabled={modalMode === 'edit'}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Common values: "free", "paid", "premium"
                                </p>
                            </div>

                            {/* Price */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Price (PKR) *
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    placeholder="5000"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                            </div>

                            {/* Product Limit */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Product Limit *
                                </label>
                                <input
                                    type="number"
                                    name="productLimit"
                                    value={formData.productLimit}
                                    onChange={handleInputChange}
                                    placeholder="100"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Maximum number of products vendor can list
                                </p>
                            </div>

                            {/* Features */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Features
                                </label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={featureInput}
                                        onChange={(e) => setFeatureInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                                        placeholder="Add feature (e.g., Advanced Analytics)"
                                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                                    />
                                    <Button onClick={addFeature} type="button">
                                        Add
                                    </Button>
                                </div>
                                {formData.features.length > 0 && (
                                    <ul className="space-y-2">
                                        {formData.features.map((feature, idx) => (
                                            <li
                                                key={idx}
                                                className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded"
                                            >
                                                <span className="text-sm">{feature}</span>
                                                <button
                                                    onClick={() => removeFeature(idx)}
                                                    className="text-red-600 hover:text-red-800 text-sm"
                                                >
                                                    Remove
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <Button
                                onClick={() => setShowModal(false)}
                                primary={false}
                                className="flex-1"
                                disabled={saving}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                className="flex-1"
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : (modalMode === 'create' ? 'Create Plan' : 'Update Plan')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default AdminSubscriptionsControl;

