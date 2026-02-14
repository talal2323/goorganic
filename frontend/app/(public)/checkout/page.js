'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/AppContext';
import { Button } from '@/components/common/UIComponents';
import { COLORS } from '@/utils/config';
import { createOrder } from '@/utils/orderApi';
import { getProfile, getAddresses } from '@/utils/userApi';
import { showToast } from '@/utils/toast';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { createPaymentIntent } from '@/utils/paymentApi';
import StripeCheckoutForm from '@/components/common/StripeCheckoutForm';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const CheckoutPage = () => {
    const router = useRouter();
    const { cartItems, cartLoading, refreshCart } = useCart();
    const [formData, setFormData] = React.useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        paymentMethod: 'cod'
    });
    const [loading, setLoading] = React.useState(false);
    const [savedAddresses, setSavedAddresses] = React.useState([]);
    const [selectedAddressId, setSelectedAddressId] = React.useState('');
    const [saveAddress, setSaveAddress] = React.useState(false);
    const [addressLabel, setAddressLabel] = React.useState('');
    const [clientSecret, setClientSecret] = React.useState('');
    const [paymentIntentId, setPaymentIntentId] = React.useState('');

    // Calculate cart totals
    const toNumber = (price) => {
        if (typeof price === 'number' && !isNaN(price)) return price;
        const str = String(price || '').replace(/,/g, '');
        const match = str.match(/\d+(?:\.\d+)?/);
        return match ? parseFloat(match[0]) : 0;
    };

    const subtotal = cartItems.reduce((sum, it) => sum + (toNumber(it.price) * (it.qty || 1)), 0);
    const shipping = subtotal >= 3000 ? 0 : 200;
    const total = subtotal + shipping;

    // Refresh cart and load user profile on mount
    React.useEffect(() => {
        refreshCart();

        // Auto-populate user data from profile
        const loadUserProfile = async () => {
            try {
                const profile = await getProfile();
                if (profile) {
                    setFormData(prev => ({
                        ...prev,
                        fullName: profile.name || '',
                        email: profile.email || ''
                    }));
                }
            } catch (error) {
                console.error('Error loading profile:', error);
                // Continue without auto-population
            }
        };

        // Load saved addresses
        const loadSavedAddresses = async () => {
            try {
                const addresses = await getAddresses();
                setSavedAddresses(addresses || []);

                // Auto-select default address if exists
                const defaultAddr = addresses?.find(addr => addr.isDefault);
                if (defaultAddr) {
                    setSelectedAddressId(defaultAddr._id);
                    setFormData(prev => ({
                        ...prev,
                        address: defaultAddr.address,
                        city: defaultAddr.city,
                        postalCode: defaultAddr.postalCode
                    }));
                }
            } catch (error) {
                console.error('Error loading addresses:', error);
            }
        };

        loadUserProfile();
        loadSavedAddresses();
    }, []);

    // Create payment intent when payment method is Stripe
    React.useEffect(() => {
        const initializeStripePayment = async () => {
            if (formData.paymentMethod === 'stripe' && total > 0) {
                try {
                    const { clientSecret, paymentIntentId: piId } = await createPaymentIntent(total);
                    setClientSecret(clientSecret);
                    setPaymentIntentId(piId);
                } catch (error) {
                    console.error('Error initializing Stripe payment:', error);
                    showToast.error('Failed to initialize payment. Please try again.');
                }
            }
        };

        initializeStripePayment();
    }, [formData.paymentMethod, total]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddressSelect = (e) => {
        const addressId = e.target.value;
        setSelectedAddressId(addressId);

        if (addressId === 'new') {
            // Clear form for new address entry
            setFormData(prev => ({
                ...prev,
                address: '',
                city: '',
                postalCode: ''
            }));
            setSaveAddress(false);
            setAddressLabel('');
        } else if (addressId) {
            // Auto-fill with selected address
            const selectedAddr = savedAddresses.find(addr => addr._id === addressId);
            if (selectedAddr) {
                setFormData(prev => ({
                    ...prev,
                    address: selectedAddr.address,
                    city: selectedAddr.city,
                    postalCode: selectedAddr.postalCode
                }));
                setSaveAddress(false);
                setAddressLabel('');
            }
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        if (cartItems.length === 0) {
            showToast.error('Your cart is empty');
            return;
        }

        // Validate required fields
        if (!formData.fullName || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.postalCode) {
            showToast.error('Please fill in all required fields');
            return;
        }

        // Validate address label if saving
        if (saveAddress && !addressLabel.trim()) {
            showToast.error('Please enter a label for this address');
            return;
        }

        // For Stripe payment, the form submission is handled by StripeCheckoutForm
        if (formData.paymentMethod === 'stripe') {
            return;
        }

        // Handle COD payment
        setLoading(true);
        try {
            const orderData = {
                shippingAddress: {
                    address: formData.address,
                    city: formData.city,
                    postalCode: formData.postalCode,
                    country: 'Pakistan'
                },
                phoneNumber: formData.phone,
                saveAddress: saveAddress,
                addressLabel: saveAddress ? addressLabel : undefined,
                paymentMethod: 'COD',
            };

            const order = await createOrder(orderData);
            showToast.success('Order placed successfully!');

            // Refresh cart to clear items after successful order
            await refreshCart();

            // Navigate to order confirmation with order ID
            router.push(`/order-confirmation?orderId=${order._id}`);
        } catch (error) {
            console.error('Error creating order:', error);
            const message = error.response?.data?.message || 'Failed to create order. Please try again.';
            showToast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleStripePaymentSuccess = async (paymentIntentId) => {
        // Validate form before creating order
        if (!formData.fullName || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.postalCode) {
            showToast.error('Please fill in all required shipping information');
            return;
        }

        if (saveAddress && !addressLabel.trim()) {
            showToast.error('Please enter a label for this address');
            return;
        }

        setLoading(true);
        try {
            const orderData = {
                shippingAddress: {
                    address: formData.address,
                    city: formData.city,
                    postalCode: formData.postalCode,
                    country: 'Pakistan'
                },
                phoneNumber: formData.phone,
                saveAddress: saveAddress,
                addressLabel: saveAddress ? addressLabel : undefined,
                paymentMethod: 'Stripe',
                paymentIntentId: paymentIntentId,
            };

            const order = await createOrder(orderData);
            showToast.success('Payment successful! Order placed.');

            // Refresh cart to clear items after successful order
            await refreshCart();

            // Navigate to order confirmation with order ID
            router.push(`/order-confirmation?orderId=${order._id}`);
        } catch (error) {
            console.error('Error creating order after payment:', error);
            const message = error.response?.data?.message || 'Payment was successful but failed to create order. Please contact support.';
            showToast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleStripePaymentError = (errorMessage) => {
        showToast.error(errorMessage);
    };

    // Group items by vendor
    const groupedByVendor = React.useMemo(() => {
        const groups = {};
        cartItems.forEach(item => {
            const vendorId = item.vendorId || 'unknown';
            const vendorName = item.vendorName || item.shopName || 'Unknown Vendor';

            if (!groups[vendorId]) {
                groups[vendorId] = {
                    vendorId,
                    vendorName,
                    items: []
                };
            }
            groups[vendorId].items.push(item);
        });
        return Object.values(groups);
    }, [cartItems]);

    return (
        <div className="bg-gray-50">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gray-50">
                        <h2 className="text-2xl font-semibold mb-6">Shipping Information</h2>
                        <div className="space-y-4">
                            <div><label className="block text-sm font-medium text-gray-700">Full Name</label><input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 sm:text-sm transition duration-150 ease-in-out" /></div>
                            <div><label className="block text-sm font-medium text-gray-700">Email</label><input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 sm:text-sm transition duration-150 ease-in-out" /></div>
                            <div><label className="block text-sm font-medium text-gray-700">Phone</label><input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 sm:text-sm transition duration-150 ease-in-out" /></div>

                            {/* Saved Addresses Selector */}
                            {savedAddresses.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Select Address</label>
                                    <select
                                        value={selectedAddressId}
                                        onChange={handleAddressSelect}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 sm:text-sm transition duration-150 ease-in-out"
                                    >
                                        <option value="new">+ Enter New Address</option>
                                        {savedAddresses.map(addr => (
                                            <option key={addr._id} value={addr._id}>
                                                {addr.label} - {addr.address}, {addr.city}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div><label className="block text-sm font-medium text-gray-700">Address</label><textarea name="address" value={formData.address} onChange={handleInputChange} required rows="3" className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 sm:text-sm transition duration-150 ease-in-out" /></div>
                            <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700">City</label><input type="text" name="city" value={formData.city} onChange={handleInputChange} required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 sm:text-sm transition duration-150 ease-in-out" /></div><div><label className="block text-sm font-medium text-gray-700">Postal Code</label><input type="text" name="postalCode" value={formData.postalCode} onChange={handleInputChange} required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 sm:text-sm transition duration-150 ease-in-out" /></div></div>

                            {/* Save Address Checkbox - show when entering new address OR when no saved addresses exist */}
                            {(selectedAddressId === 'new' || savedAddresses.length === 0) && (
                                <div className="space-y-2">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={saveAddress}
                                            onChange={(e) => setSaveAddress(e.target.checked)}
                                            className="h-4 w-4 text-secondary border-gray-300 rounded focus:ring-secondary"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Save this address for future orders</span>
                                    </label>
                                    {saveAddress && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Address Label</label>
                                            <input
                                                type="text"
                                                value={addressLabel}
                                                onChange={(e) => setAddressLabel(e.target.value)}
                                                placeholder="e.g., Home, Office"
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 sm:text-sm transition duration-150 ease-in-out"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                                <div className="space-y-2">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="cod"
                                            checked={formData.paymentMethod === 'cod'}
                                            onChange={handleInputChange}
                                            className="focus:ring-secondary h-4 w-4 text-secondary border-gray-300"
                                        />
                                        <span className="ml-2">Cash on Delivery</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="stripe"
                                            checked={formData.paymentMethod === 'stripe'}
                                            onChange={handleInputChange}
                                            className="focus:ring-secondary h-4 w-4 text-secondary border-gray-300"
                                        />
                                        <span className="ml-2">💳 Pay with Card (Stripe)</span>
                                    </label>
                                </div>
                            </div>

                            {formData.paymentMethod === 'cod' && (
                                <Button type="button" onClick={handleSubmit} className="w-full" disabled={loading || cartLoading || cartItems.length === 0}>
                                    {loading ? 'Placing Order...' : 'Place Order'}
                                </Button>
                            )}

                            {formData.paymentMethod === 'stripe' && clientSecret && (
                                <Elements stripe={stripePromise} options={{ clientSecret }}>
                                    <StripeCheckoutForm
                                        onSuccess={handleStripePaymentSuccess}
                                        onError={handleStripePaymentError}
                                        amount={total}
                                        loading={loading}
                                        setLoading={setLoading}
                                        formData={formData}
                                        saveAddress={saveAddress}
                                        addressLabel={addressLabel}
                                    />
                                </Elements>
                            )}

                            {formData.paymentMethod === 'stripe' && !clientSecret && (
                                <div className="text-center py-4 text-gray-500">
                                    Loading payment form...
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>
                            {cartLoading ? (
                                <div className="text-center py-8 text-gray-500">Loading cart...</div>
                            ) : cartItems.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">Your cart is empty</div>
                            ) : (
                                <div className="space-y-6">
                                    {groupedByVendor.map(group => (
                                        <div key={group.vendorId} className="border-b pb-4 last:border-b-0">
                                            <div className="flex items-center space-x-2 mb-3 bg-gray-50 p-2 rounded">
                                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                <span className="font-semibold text-gray-700">{group.vendorName}</span>
                                            </div>
                                            {group.items.map(item => (
                                                <div key={item.id} className="flex justify-between items-center py-2 pl-7">
                                                    <div>
                                                        <h3 className="font-medium">{item.name}</h3>
                                                        <p className="text-sm text-gray-500">Quantity: {item.qty || 1}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm text-gray-500">{`Rs. ${toNumber(item.price).toLocaleString()}`} x {item.qty || 1}</p>
                                                        <p className="font-medium">{`Rs. ${(toNumber(item.price) * (item.qty || 1)).toLocaleString()}`}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                    <div className="pt-4">
                                        <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>Rs. {subtotal.toLocaleString()}</span></div>
                                        <div className="flex justify-between mt-2"><span className="text-gray-600">Shipping</span><span>Rs. {shipping.toLocaleString()}</span></div>
                                        <div className="flex justify-between mt-4 pt-4 border-t font-semibold"><span>Total</span><span style={{ color: COLORS.secondary }}>Rs. {total.toLocaleString()}</span></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 bg-white p-6 rounded-lg shadow-md"><h3 className="font-medium mb-4">Need Help?</h3><div className="space-y-2 text-sm text-gray-600"><p>• For any queries, contact our support at goorganic.co.pk@gmail.com</p><p>• Free shipping for orders above Rs. 3000</p></div></div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CheckoutPage;

