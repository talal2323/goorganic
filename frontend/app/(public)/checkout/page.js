'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/AppContext';
import { Button } from '@/components/common/UIComponents';
import { COLORS } from '@/utils/config';
import { createOrder } from '@/utils/orderApi';
import { getProfile } from '@/utils/userApi';
import { showToast } from '@/utils/toast';

const CheckoutPage = () => {
    const router = useRouter();
    const { cartItems, cartLoading, refreshCart } = useCart();
    const [formData, setFormData] = React.useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        paymentMethod: 'cod'
    });
    const [loading, setLoading] = React.useState(false);

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

        loadUserProfile();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (cartItems.length === 0) {
            showToast.error('Your cart is empty');
            return;
        }

        setLoading(true);
        try {
            const orderData = {
                shippingAddress: {
                    street: formData.address,
                    city: formData.city,
                    postalCode: formData.pincode,
                    country: 'Pakistan'
                },
                phoneNumber: formData.phone
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

    const toNumber = (price) => {
        if (typeof price === 'number' && !isNaN(price)) return price;
        const str = String(price || '').replace(/,/g, '');
        const match = str.match(/\d+(?:\.\d+)?/);
        return match ? parseFloat(match[0]) : 0;
    };

    const subtotal = cartItems.reduce((sum, it) => sum + (toNumber(it.price) * (it.qty || 1)), 0);
    const shipping = subtotal >= 3000 ? 0 : 50;
    const total = subtotal + shipping;

    return (
        <div className="bg-gray-50">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gray-50">
                        <h2 className="text-2xl font-semibold mb-6">Shipping Information</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div><label className="block text-sm font-medium text-gray-700">Full Name</label><input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary" /></div>
                            <div><label className="block text-sm font-medium text-gray-700">Email</label><input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary" /></div>
                            <div><label className="block text-sm font-medium text-gray-700">Phone</label><input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary" /></div>
                            <div><label className="block text-sm font-medium text-gray-700">Address</label><textarea name="address" value={formData.address} onChange={handleInputChange} required rows="3" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary" /></div>
                            <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700">City</label><input type="text" name="city" value={formData.city} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary" /></div><div><label className="block text-sm font-medium text-gray-700">State</label><input type="text" name="state" value={formData.state} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary" /></div></div>
                            <div><label className="block text-sm font-medium text-gray-700">PIN Code</label><input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary" /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label><div className="space-y-2"><label className="flex items-center"><input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod === 'cod'} onChange={handleInputChange} className="focus:ring-secondary h-4 w-4 text-secondary border-gray-300" /><span className="ml-2">Cash on Delivery</span></label><label className="flex items-center opacity-50 cursor-not-allowed"><input type="radio" disabled className="focus:ring-secondary h-4 w-4 text-secondary border-gray-300" /><span className="ml-2">Online Payment (Coming Soon)</span></label></div></div>
                            <Button type="submit" className="w-full" disabled={loading || cartLoading || cartItems.length === 0}>
                                {loading ? 'Placing Order...' : 'Place Order'}
                            </Button>
                        </form>
                    </div>

                    <div>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>
                            {cartLoading ? (
                                <div className="text-center py-8 text-gray-500">Loading cart...</div>
                            ) : cartItems.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">Your cart is empty</div>
                            ) : (
                                <div className="space-y-4">
                                    {cartItems.map(item => (
                                        <div key={item.id} className="flex justify-between items-center py-2 border-b">
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
                                    <div className="pt-4">
                                        <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>Rs. {subtotal.toLocaleString()}</span></div>
                                        <div className="flex justify-between mt-2"><span className="text-gray-600">Shipping</span><span>Rs. {shipping.toLocaleString()}</span></div>
                                        <div className="flex justify-between mt-4 pt-4 border-t font-semibold"><span>Total</span><span style={{ color: COLORS.secondary }}>Rs. {total.toLocaleString()}</span></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 bg-white p-6 rounded-lg shadow-md"><h3 className="font-medium mb-4">Need Help?</h3><div className="space-y-2 text-sm text-gray-600"><p>• Orders are usually delivered within 1-2 days</p><p>• For any queries, contact our support at goorganic.co.pk@gmail.com</p><p>• Free shipping for orders above Rs. 3000</p></div></div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CheckoutPage;

