'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
    const { addItemToCart } = useCart();
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
        <div>
            <main>
                {/* Hero Section - Full Width */}
                <div className="relative w-full h-[600px] overflow-hidden">
                    {/* Background Video */}
                    <div className="absolute inset-0">
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                        >
                            <source src="/videos/Video_for_Organic_Brand_Website.mp4" type="video/mp4" />
                        </video>
                        {/* Dark overlay for better text visibility */}
                        <div className="absolute inset-0 bg-black/30"></div>
                    </div>

                    {/* Glassmorphism Card */}
                    <div className="relative h-full flex items-center justify-center px-4">
                        <div className="backdrop-blur-md bg-white/20 rounded-3xl shadow-2xl p-8 sm:p-12 max-w-2xl border border-white/30">
                            <h1 className="text-5xl sm:text-7xl font-serif font-bold text-white leading-tight text-center">
                                GO<span className="text-green-300">organic</span>
                            </h1>
                            <p className="text-xl mt-4 text-white/90 text-center font-light">
                                Your path to natural living: Fresh, Verified, Sustainable.
                            </p>
                            <div className="flex justify-center mt-8">
                                <Link href="/shop">
                                    <Button className="px-8 py-3 text-lg bg-white text-primary hover:bg-gray-100">
                                        Shop Now
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Why Choose GOorganic Section */}
                <section className="bg-white py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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
                    </div>
                </section>

                {/* Featured Vendors Section */}
                <section className="bg-gray-50 py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">Featured Vendors</h2>
                        <p className="text-gray-600 text-center mb-2">Discover our premium verified organic vendors</p>
                        <p className="text-center mb-12">
                            <span className="inline-flex items-center gap-1.5 bg-yellow-50 border border-yellow-300 text-yellow-700 text-sm font-semibold px-4 py-1.5 rounded-full">
                                ⭐ Earn <span className="text-green-700 font-bold">+20 Bonus Loyalty Points</span> on every order from these vendors!
                            </span>
                        </p>
                        {loading ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500">Loading featured vendors...</p>
                            </div>
                        ) : featuredVendors.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500">No featured vendors available at the moment.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {featuredVendors.slice(0, 6).map((vendor) => (
                                    <div
                                        key={vendor._id}
                                        className="bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-2xl cursor-pointer border border-yellow-200"
                                        onClick={() => handleVendorClick(vendor)}
                                    >
                                        <div className="relative w-full h-56">
                                            <Image
                                                src={vendor.avatar?.url || 'https://placehold.co/800x400/164A26/FFFFFF?text=Vendor'}
                                                alt={vendor.shopName || vendor.name}
                                                fill
                                                className="object-cover"
                                                onError={(e) => { e.target.src = 'https://placehold.co/800x400/164A26/FFFFFF?text=Vendor'; }}
                                            />
                                            {/* Featured Loyalty Badge */}
                                            <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                                                ⭐ +20 Points
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <div className="flex items-center justify-center gap-2 mb-3">
                                                <h3 className="text-xl font-bold text-gray-800">
                                                    {vendor.shopName || vendor.name}
                                                </h3>
                                                <VerificationBadge />
                                            </div>
                                            {vendor.averageRating > 0 && (
                                                <div className="flex items-center justify-center mt-2 mb-1">
                                                    <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                                                    <span className="ml-1 text-sm font-semibold text-gray-700">{vendor.averageRating.toFixed(1)}</span>
                                                    <span className="ml-1 text-xs text-gray-400">({vendor.reviewCount || 0})</span>
                                                </div>
                                            )}
                                            <p className="text-sm text-gray-600 mt-2 line-clamp-3 text-center">
                                                {vendor.shopDescription || 'Premium organic vendor'}
                                            </p>
                                            {vendor.shopAddress?.city && (
                                                <div className="flex items-center justify-center mt-2 text-xs text-gray-500">
                                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    {vendor.shopAddress.city}
                                                </div>
                                            )}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleVendorClick(vendor);
                                                }}
                                                className="mt-4 w-full py-2.5 px-4 border-2 border-primary text-primary rounded-lg font-medium hover:bg-primary hover:text-white transition-all"
                                            >
                                                View Profile
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* Featured Products Section */}
                <section className="bg-white py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {featuredProducts.slice(0, 12).map((product) => (
                                    <div
                                        key={product._id}
                                        className="bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-2xl cursor-pointer border border-gray-100"
                                        onClick={() => handleProductClick(product)}
                                    >
                                        <div className="relative w-full h-56">
                                            <Image
                                                src={product.images?.[0]?.url || 'https://placehold.co/200x200/E9F5E9/164A26?text=Product'}
                                                alt={product.name}
                                                fill
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="p-6">
                                            <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
                                                {product.name}
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{product.description}</p>
                                            {product.vendor?.shopName && (
                                                <p className="text-xs text-gray-500 mt-2">by {product.vendor.shopName}</p>
                                            )}
                                            {product.averageRating > 0 && (
                                                <div className="flex items-center mt-2">
                                                    <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                                                    <span className="ml-1 text-sm font-semibold text-gray-700">{product.averageRating.toFixed(1)}</span>
                                                    <span className="ml-1 text-xs text-gray-400">({product.reviewCount || 0})</span>
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between mt-4">
                                                <p className="text-primary font-bold text-2xl">
                                                    Rs. {product.price}
                                                </p>
                                                {product.stock > 0 ? (
                                                    <span className="text-xs text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full">In Stock</span>
                                                ) : (
                                                    <span className="text-xs text-red-600 font-medium bg-red-50 px-3 py-1 rounded-full">Out of Stock</span>
                                                )}
                                            </div>
                                            <button
                                                className="mt-4 w-full py-2.5 px-4 border-2 border-primary text-primary rounded-lg font-medium hover:bg-primary hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                onClick={(e) => handleAddToCart(e, product)}
                                                disabled={product.stock === 0}
                                            >
                                                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
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
