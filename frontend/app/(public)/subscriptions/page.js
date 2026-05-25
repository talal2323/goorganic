'use client'

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/common/UIComponents';
import { getAddresses } from '@/utils/userApi';
import {
    cancelBoxSubscription,
    getMyBoxSubscriptions,
    updateBoxSubscriptionAddress,
} from '@/utils/subscriptionBoxApi';
import { showToast } from '@/utils/toast';

const MySubscriptionsPage = () => {
    const router = useRouter();
    const { state } = useAppContext();

    const [subscriptions, setSubscriptions] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);

    const [editingId, setEditingId] = useState(null);
    const [addressMode, setAddressMode] = useState('saved');
    const [selectedAddressId, setSelectedAddressId] = useState('');
    const [manualAddress, setManualAddress] = useState({ address: '', city: '', postalCode: '', country: 'Pakistan' });
    const [savingAddress, setSavingAddress] = useState(false);

    const defaultAddressId = useMemo(() => {
        const def = (addresses || []).find((a) => a.isDefault);
        return def?._id || '';
    }, [addresses]);

    const fetchAll = async () => {
        try {
            setLoading(true);
            const [subsData, addrData] = await Promise.all([
                getMyBoxSubscriptions(),
                getAddresses().catch(() => []),
            ]);
            setSubscriptions(Array.isArray(subsData) ? subsData : []);
            setAddresses(Array.isArray(addrData) ? addrData : []);
        } catch (error) {
            showToast.error(error.response?.data?.message || 'Failed to load subscriptions');
            setSubscriptions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!state.isLoggedIn) {
            router.push('/auth/login?redirect=/subscriptions');
            return;
        }

        fetchAll();
    }, [state.isLoggedIn]);

    const handleCancel = async (subscriptionId) => {
        if (!confirm('Cancel this subscription? You will stop receiving recurring orders.')) return;

        try {
            await cancelBoxSubscription(subscriptionId);
            showToast.success('Subscription cancelled');
            fetchAll();
        } catch (error) {
            showToast.error(error.response?.data?.message || 'Failed to cancel subscription');
        }
    };

    const startEditAddress = (sub) => {
        setEditingId(sub._id);

        if (addresses.length > 0) {
            setAddressMode('saved');
            setSelectedAddressId(defaultAddressId || addresses[0]._id);
        } else {
            setAddressMode('manual');
            setSelectedAddressId('');
        }

        setManualAddress({
            address: sub.shippingAddress?.address || '',
            city: sub.shippingAddress?.city || '',
            postalCode: sub.shippingAddress?.postalCode || '',
            country: sub.shippingAddress?.country || 'Pakistan',
        });
    };

    const saveAddress = async (subscriptionId) => {
        let payload = {};

        if (addressMode === 'saved') {
            if (!selectedAddressId) {
                showToast.error('Please select an address');
                return;
            }
            payload.addressId = selectedAddressId;
        } else {
            if (!manualAddress.address || !manualAddress.city || !manualAddress.postalCode) {
                showToast.error('Please enter complete address details');
                return;
            }
            payload.shippingAddress = manualAddress;
        }

        try {
            setSavingAddress(true);
            await updateBoxSubscriptionAddress(subscriptionId, payload);
            showToast.success('Address updated');
            setEditingId(null);
            fetchAll();
        } catch (error) {
            showToast.error(error.response?.data?.message || 'Failed to update address');
        } finally {
            setSavingAddress(false);
        }
    };

    if (loading) {
        return <div className="text-center p-8 text-gray-500">Loading subscriptions...</div>;
    }

    return (
        <div className="bg-gray-50 py-8">
            <main className="max-w-4xl mx-auto px-4">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold mb-2">My Subscriptions</h1>
                    <p className="text-sm text-gray-600 mb-6">Manage your subscription boxes (COD only).</p>

                    {subscriptions.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            No subscriptions yet. Browse <button className="text-secondary hover:underline" onClick={() => router.push('/shop')}>subscription boxes</button>.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {subscriptions.map((sub) => {
                                const box = sub.box;
                                const vendorName = box?.vendor?.shopName || box?.vendor?.name || 'Vendor';
                                const isActive = sub.status === 'active';
                                const boxSubtotal = Number(sub.price || 0);
                                const shippingFee = boxSubtotal >= 3000 ? 0 : 200;
                                const totalDue = boxSubtotal + shippingFee;

                                return (
                                    <div key={sub._id} className="border rounded-lg p-4 border-gray-200">
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-gray-900 truncate">{box?.title || 'Subscription Box'}</h3>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                        {isActive ? 'Active' : 'Cancelled'}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {vendorName} • <span className="capitalize">{sub.frequency}</span> • Rs. {totalDue.toLocaleString()}
                                                </p>
                                                {sub.nextDeliveryDate && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Next delivery: {new Date(sub.nextDeliveryDate).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>

                                            {isActive && (
                                                <div className="flex items-center gap-2">
                                                    <Button primary={false} className="px-3 py-2" onClick={() => startEditAddress(sub)}>
                                                        Change Address
                                                    </Button>
                                                    <Button className="bg-red-600 hover:bg-red-700 px-3 py-2" onClick={() => handleCancel(sub._id)}>
                                                        Cancel
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-3 text-sm text-gray-700">
                                            <div className="font-medium">Delivery Address</div>
                                            <div className="text-gray-600">
                                                {sub.shippingAddress?.address || '—'}
                                                {sub.shippingAddress?.city ? `, ${sub.shippingAddress.city}` : ''}
                                                {sub.shippingAddress?.postalCode ? `, ${sub.shippingAddress.postalCode}` : ''}
                                                {sub.shippingAddress?.country ? `, ${sub.shippingAddress.country}` : ''}
                                            </div>
                                        </div>

                                        {editingId === sub._id && (
                                            <div className="mt-4 border-t pt-4">
                                                <div className="text-sm font-medium text-gray-900 mb-2">Update Address</div>

                                                {addresses.length > 0 && (
                                                    <div className="mb-3">
                                                        <select
                                                            value={addressMode === 'saved' ? selectedAddressId : 'manual'}
                                                            onChange={(e) => {
                                                                if (e.target.value === 'manual') {
                                                                    setAddressMode('manual');
                                                                    setSelectedAddressId('');
                                                                } else {
                                                                    setAddressMode('saved');
                                                                    setSelectedAddressId(e.target.value);
                                                                }
                                                            }}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
                                                        >
                                                            {addresses.map((a) => (
                                                                <option key={a._id} value={a._id}>
                                                                    {a.label || 'Address'} - {a.city}
                                                                </option>
                                                            ))}
                                                            <option value="manual">Enter a new address</option>
                                                        </select>
                                                    </div>
                                                )}

                                                {(addresses.length === 0 || addressMode === 'manual') && (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        <input
                                                            value={manualAddress.address}
                                                            onChange={(e) => setManualAddress((p) => ({ ...p, address: e.target.value }))}
                                                            placeholder="Address"
                                                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary sm:col-span-2"
                                                        />
                                                        <input
                                                            value={manualAddress.city}
                                                            onChange={(e) => setManualAddress((p) => ({ ...p, city: e.target.value }))}
                                                            placeholder="City"
                                                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
                                                        />
                                                        <input
                                                            value={manualAddress.postalCode}
                                                            onChange={(e) => setManualAddress((p) => ({ ...p, postalCode: e.target.value }))}
                                                            placeholder="Postal Code"
                                                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
                                                        />
                                                        <input
                                                            value={manualAddress.country}
                                                            onChange={(e) => setManualAddress((p) => ({ ...p, country: e.target.value }))}
                                                            placeholder="Country"
                                                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary sm:col-span-2"
                                                        />
                                                    </div>
                                                )}

                                                <div className="mt-4 flex items-center gap-2">
                                                    <Button className="px-4 py-2" onClick={() => saveAddress(sub._id)} disabled={savingAddress}>
                                                        {savingAddress ? 'Saving...' : 'Save Address'}
                                                    </Button>
                                                    <Button primary={false} className="px-4 py-2" onClick={() => setEditingId(null)}>
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MySubscriptionsPage;
