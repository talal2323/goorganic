'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppContext, useCart } from '@/context/AppContext';
import { Button, Icon, VerificationBadge } from '@/components/common/UIComponents';
import { COLORS } from '@/utils/config';
import { getFeaturedProducts } from '@/utils/productApi';
import { getFeaturedVendors } from '@/utils/userApi';
import { showToast } from '@/utils/toast';

const features = [
    { title: '100% Organic', desc: 'All products are certified organic and sustainably sourced from top-tier vendors.', iconPath: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.192-2.058-.573-3.016z' },
    { title: 'Fast Delivery', desc: 'Fresh products delivered quickly with eco-friendly packaging solutions.', iconPath: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13-.8 5m0 0H21m-6 4a2 2 0 11-4 0 2 2 0 014 0z' },
    { title: 'Verified Vendors', desc: 'All vendors are thoroughly verified and periodically audited to ensure they meet our standards.', iconPath: 'M9 12l2 2 4-4M12 1V3C8.268 3 5 6.268 5 10v.586a1 1 0 01-.293.707l-1 1A1 1 0 003 13v3a1 1 0 001 1h16a1 1 0 001-1v-3a1 1 0 00-.293-.707l-1-1a1 1 0 01-.293-.707V10c0-3.732-3.268-7-7-7z' },
];

export default function Home() {
    const router = useRouter();
    const { state } = useAppContext();
    const { addItemToCart, openCart } = useCart();
    const [isClient, setIsClient] = useState(false);
    const [showVendorButton, setShowVendorButton] = useState(false);
    const [featuredVendors, setFeaturedVendors] = useState([]);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setIsClient(true);
        setShowVendorButton(!localStorage.getItem('authToken'));
        fetchFeaturedData();
    }, []);

    const fetchFeaturedData = async () => {
        try {
            setLoading(true);
            const [vendors, products] = await Promise.all([
                getFeaturedVendors(),
                getFeaturedProducts()
            ]);
            setFeaturedVendors(vendors || []);
            setFeaturedProducts(products || []);
        } catch (error) {
            console.error('Failed to fetch featured data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async (e, product) => {
        e.stopPropagation();

        // Check if user is logged in
        if (!state.isLoggedIn) {
            showToast.error('Please log in to add items to cart');
            router.push('/auth/login');
            return;
        }

        try {
            await addItemToCart(product._id, 1);
            showToast.success(`${product.name} added to cart`);
            openCart();
        } catch (error) {
            console.error('Error adding to cart:', error);
            const message = error.response?.data?.message || error.message || 'Failed to add item to cart';
            showToast.error(message);
        }
    };

    const handleProductClick = (product) => {
        router.push(`/products/${product._id}`);
    };

    const handleVendorClick = (vendor) => {
        router.push(`/vendors/${vendor._id}`);
    };

    return (
        <div className="bg-gray-50">
            <main>
                {/* Hero Section */}
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20">
                    <div className="relative overflow-hidden rounded-xl h-[450px] bg-gray-100 shadow-2xl">
                        <div className="absolute inset-0 flex">
                            <div className="w-1/2 bg-gray-200 hidden sm:block"></div>
                            <div className="w-1/2 w-full" style={{ backgroundColor: '#DBE9DB' }}></div>
                        </div>

                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-full flex">
                                <div className="w-full sm:w-1/2 p-6 sm:p-12 flex flex-col justify-center">
                                    <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
                                        GO<span style={{ color: COLORS.secondary }}>organic</span>
                                    </h1>
                                    <p className="text-lg mt-2 text-gray-700">
                                        Your path to natural living: Fresh, Verified, Sustainable.
                                    </p>
                                    <Link href="/shop">
                                        <Button className="mt-8 self-start">
                                            Shop Now
                                        </Button>
                                    </Link>
                                </div>
                                <div className="w-2/2 hidden sm:flex items-center justify-center p-4">
                                    <img
                                        src="/images/hero.png"
                                        alt="Organic products"
                                        className="object-cover rounded-lg shadow-2xl"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Why Choose GOorganic Section */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Why Choose GOorganic?</h2>
                    <p className="text-gray-600 mb-12">Your trusted gateway to verified organic vendors and fresh, authentic products.</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="flex flex-col items-center p-4 bg-white rounded-xl shadow-md">
                                <div className="rounded-full p-3 mb-4 bg-secondary">
                                    <Icon path={feature.iconPath} className="w-8 h-8 text-white" color="white" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                                <p className="text-sm text-gray-600">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Featured Vendors Section */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">Featured Vendors</h2>
                    <p className="text-gray-600 text-center mb-12">Discover our premium verified organic vendors</p>
                    {loading ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">Loading featured vendors...</p>
                        </div>
                    ) : featuredVendors.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No featured vendors available at the moment.</p>
                        </div>
                    ) : (
                        <div className="flex flex-wrap justify-center gap-8">
                            {featuredVendors.slice(0, 6).map((vendor) => (
                                <div
                                    key={vendor._id}
                                    className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col items-center text-center p-6 transition duration-300 hover:shadow-xl cursor-pointer w-full max-w-sm"
                                    onClick={() => handleVendorClick(vendor)}
                                >
                                    <img
                                        src={vendor.avatar?.url || 'https://placehold.co/150x100/164A26/FFFFFF?text=Vendor'}
                                        alt={vendor.shopName || vendor.name}
                                        className="w-full h-24 object-cover mb-4 rounded-md"
                                        onError={(e) => { e.target.src = 'https://placehold.co/150x100/164A26/FFFFFF?text=Vendor'; }}
                                    />
                                    <h3 className="text-xl font-semibold text-gray-800 flex items-center justify-center">
                                        {vendor.shopName || vendor.name}
                                        <div className="ml-2">
                                            <VerificationBadge />
                                        </div>
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                        {vendor.shopDescription || 'Premium organic vendor'}
                                    </p>
                                    {vendor.shopAddress?.city && (
                                        <p className="text-xs text-gray-500 mt-1">{vendor.shopAddress.city}</p>
                                    )}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleVendorClick(vendor);
                                        }}
                                        className="mt-4 text-xs font-medium hover:underline text-secondary"
                                    >
                                        View Profile &rarr;
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Featured Products Section */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">Featured Products</h2>
                    <p className="text-gray-600 text-center mb-12">Hand-picked organic products from our premium vendors</p>
                    {loading ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">Loading featured products...</p>
                        </div>
                    ) : featuredProducts.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No featured products available at the moment.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredProducts.slice(0, 12).map((product) => (
                                <div
                                    key={product._id}
                                    className="bg-white rounded-xl shadow-md overflow-hidden transition-shadow hover:shadow-xl cursor-pointer"
                                    onClick={() => handleProductClick(product)}
                                >
                                    <img
                                        src={product.images?.[0]?.url || 'https://placehold.co/200x200/E9F5E9/164A26?text=Product'}
                                        alt={product.name}
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
                                            {product.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
                                        {product.vendor?.shopName && (
                                            <p className="text-xs text-gray-500 mt-1">by {product.vendor.shopName}</p>
                                        )}
                                        <div className="flex items-center justify-between mt-3">
                                            <p className="text-secondary font-bold text-xl">
                                                Rs. {product.price}
                                            </p>
                                            {product.stock > 0 ? (
                                                <span className="text-xs text-green-600 font-medium">In Stock</span>
                                            ) : (
                                                <span className="text-xs text-red-600 font-medium">Out of Stock</span>
                                            )}
                                        </div>
                                        <Button
                                            className="mt-3 w-full"
                                            onClick={(e) => handleAddToCart(e, product)}
                                            disabled={product.stock === 0}
                                        >
                                            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Call to Action Banner (Green Background) */}
                <section style={{ backgroundColor: '#0c2d0cff' }} className="py-16 mt-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                        <h2 className="text-3xl font-bold mb-4">Ready to Go Organic?</h2>
                        <p className="text-gray-200 mb-8">Join thousands of customers who trust GOorganic for their organic product needs.</p>
                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/shop">
                                <Button
                                    className="bg-white text-gray-900 border-white hover:bg-gray-200"
                                    primary={false}
                                >
                                    Start Shopping
                                </Button>
                            </Link>
                            {isClient && showVendorButton && (
                                <Link href="/auth/vendor-register">
                                    <Button
                                        className="bg-black border border-white text-white hover:bg-gray-700"
                                        primary={false}
                                    >
                                        Become a Vendor
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
