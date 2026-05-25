'use client'

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Icon } from '@/components/common/UIComponents';
import { getAddresses } from '@/utils/userApi';
import { getSubscriptionBoxById, subscribeToSubscriptionBox } from '@/utils/subscriptionBoxApi';
import { showToast } from '@/utils/toast';

const SubscriptionBoxSubscribePage = () => {
    const router = useRouter();
    const params = useParams();
    const boxId = params?.id;

    const [box, setBox] = useState(null);
    const [loading, setLoading] = useState(true);

    const [addresses, setAddresses] = useState([]);
    const [addressMode, setAddressMode] = useState('saved'); // 'saved' | 'manual'
    const [selectedAddressId, setSelectedAddressId] = useState('');
    const [manualAddress, setManualAddress] = useState({ address: '', city: '', postalCode: '', country: 'Pakistan' });
    const [phoneNumber, setPhoneNumber] = useState('');

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!boxId) return;

        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
        if (!token) {
            router.replace(`/auth/login?redirect=/subscription-boxes/${boxId}`);
            return;
        }

        const load = async () => {
            try {
                setLoading(true);
                const [boxData, addrData] = await Promise.all([
                    getSubscriptionBoxById(boxId),
                    getAddresses().catch(() => []),
                ]);

                setBox(boxData);
                setAddresses(Array.isArray(addrData) ? addrData : []);

                const addrList = Array.isArray(addrData) ? addrData : [];
                if (addrList.length > 0) {
                    setAddressMode('saved');
                    const defaultAddr = addrList.find((a) => a.isDefault);
                    setSelectedAddressId(defaultAddr?._id || addrList[0]._id);
                } else {
                    setAddressMode('manual');
                    setSelectedAddressId('');
                }
            } catch (error) {
                showToast.error(error.response?.data?.message || 'Failed to load subscription box');
                setBox(null);
            } finally {
                setLoading(false);
            }
        };

        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [boxId]);

    const handleSubmit = async () => {
        if (!boxId) return;

        const safePhone = (phoneNumber || '').trim();
        if (!safePhone) {
            showToast.error('Phone number is required for COD deliveries');
            return;
        }

        let payload = { phoneNumber: safePhone };

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
            setSubmitting(true);
            const data = await subscribeToSubscriptionBox(boxId, payload);
            showToast.success('Subscription created successfully');

            const orderId = data?.firstOrderId;
            if (orderId) {
                router.push(`/order-confirmation?orderId=${orderId}`);
            } else {
                router.push('/subscriptions');
            }
        } catch (error) {
            showToast.error(error.response?.data?.message || 'Failed to subscribe');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-gray-50 py-10">
                <main className="max-w-3xl mx-auto px-4">
                    <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">Loading...</div>
                </main>
            </div>
        );
    }

    if (!box) {
        return (
            <div className="bg-gray-50 py-10">
                <main className="max-w-3xl mx-auto px-4">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center gap-2 text-gray-800">
                            <Icon path="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" className="w-5 h-5" />
                            <h1 className="text-lg font-semibold">Subscription box not available</h1>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">This box may be inactive or removed.</p>
                        <Button className="mt-4" onClick={() => router.push('/shop')}>Back to Shop</Button>
                    </div>
                </main>
            </div>
        );
    }

    const vendorName = box.vendor?.shopName || box.vendor?.name || 'Vendor';
    const boxSubtotal = Number(box.price || 0);
    const shippingFee = boxSubtotal >= 3000 ? 0 : 200;
    const totalDue = boxSubtotal + shippingFee;

    return (
        <div className="bg-gray-50 py-10">
            <main className="max-w-3xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <h1 className="text-2xl font-bold text-gray-900 truncate">{box.title}</h1>
                            <p className="text-sm text-gray-600 mt-1">{box.description}</p>
                            <p className="text-sm text-gray-600 mt-2">
                                {vendorName} • <span className="capitalize">{box.frequency}</span> • Rs. {Number(box.price || 0).toLocaleString()}
                            </p>
                        </div>
                        <Button primary={false} className="px-4 py-2" onClick={() => router.push('/shop')}>Back</Button>
                    </div>

                    {Array.isArray(box.products) && box.products.length > 0 && (
                        <div className="mt-4">
                            <div className="text-sm font-medium text-gray-900">Included Products</div>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {box.products.slice(0, 12).map((p) => (
                                    <span key={p._id} className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                                        {p.name}
                                    </span>
                                ))}
                                {box.products.length > 12 && (
                                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">+{box.products.length - 12} more</span>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="mt-6 border-t pt-6">
                        <h2 className="text-lg font-semibold text-gray-900">Delivery Details (COD)</h2>
                        <p className="text-sm text-gray-600 mt-1">Your first COD order will be created immediately after subscribing.</p>

                        <div className="mt-4 bg-gray-50 rounded-lg p-4 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-700">Subtotal</span>
                                <span className="text-gray-900">Rs. {boxSubtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-gray-700">Shipping Fee</span>
                                <span className="text-gray-900">Rs. {shippingFee.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 font-semibold">
                                <span className="text-gray-900">Total Due (COD)</span>
                                <span className="text-gray-900">Rs. {totalDue.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="03xx-xxxxxxx"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                                />
                            </div>

                            {addresses.length > 0 && (
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
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
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                                    >
                                        {addresses.map((a) => (
                                            <option key={a._id} value={a._id}>
                                                {(a.label || 'Address') + ' - ' + (a.city || '')}
                                            </option>
                                        ))}
                                        <option value="manual">Enter a new address</option>
                                    </select>
                                </div>
                            )}

                            {(addresses.length === 0 || addressMode === 'manual') && (
                                <>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                        <input
                                            value={manualAddress.address}
                                            onChange={(e) => setManualAddress((p) => ({ ...p, address: e.target.value }))}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                                            placeholder="Street / House / Area"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                        <input
                                            value={manualAddress.city}
                                            onChange={(e) => setManualAddress((p) => ({ ...p, city: e.target.value }))}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                                            placeholder="City"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                                        <input
                                            value={manualAddress.postalCode}
                                            onChange={(e) => setManualAddress((p) => ({ ...p, postalCode: e.target.value }))}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                                            placeholder="Postal code"
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                        <input
                                            value={manualAddress.country}
                                            onChange={(e) => setManualAddress((p) => ({ ...p, country: e.target.value }))}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                                            placeholder="Pakistan"
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="mt-6 flex items-center gap-2">
                            <Button className="px-5 py-2" onClick={handleSubmit} disabled={submitting}>
                                {submitting ? 'Subscribing...' : 'Confirm Subscription'}
                            </Button>
                            <Button primary={false} className="px-5 py-2" onClick={() => router.push('/shop')}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SubscriptionBoxSubscribePage;
