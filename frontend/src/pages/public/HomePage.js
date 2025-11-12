'use client'

import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button, Icon, VerificationBadge } from '@/components/common/UIComponents';
import { COLORS } from '@/utils/config';

const features = [
    { title: '100% Organic', desc: 'All products are certified organic and sustainably sourced from top-tier vendors.', iconPath: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.192-2.058-.573-3.016z' },
    { title: 'Fast Delivery', desc: 'Fresh products delivered quickly with eco-friendly packaging solutions.', iconPath: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13-.8 5m0 0H21m-6 4a2 2 0 11-4 0 2 2 0 014 0z' },
    { title: 'Verified Vendors', desc: 'All vendors are thoroughly verified and periodically audited to ensure they meet our standards.', iconPath: 'M9 12l2 2 4-4M12 1V3C8.268 3 5 6.268 5 10v.586a1 1 0 01-.293.707l-1 1A1 1 0 003 13v3a1 1 0 001 1h16a1 1 0 001-1v-3a1 1 0 00-.293-.707l-1-1a1 1 0 01-.293-.707V10c0-3.732-3.268-7-7-7z' },
];

const vendorMocks = [
    {
        id: 'gvf1',
        name: 'Green Valley Farms',
        desc: 'Offers a wide range of fresh vegetables, grown using sustainable farming practices.',
        image: 'https://placehold.co/150x100/164A26/FFFFFF?text=Farm',
        img: 'https://placehold.co/150x100/164A26/FFFFFF?text=Farm',
        rating: 4.7,
        location: 'Lahore, PK',
        productCount: 28,
        categories: ['Vegetables', 'Fruits'],
        certifications: ['USDA Organic'],
        joinedDate: '2022-06-15',
        contactInfo: { email: 'contact@greenvalley.pk', phone: '+92 300 000 0000', address: 'Green Valley Street, Lahore' },
    },
    {
        id: 'phn1',
        name: 'PureHarvest Naturals',
        desc: 'Specializes in organic honey and herbal teas sourced from local farms.',
        image: 'https://placehold.co/150x100/164A26/FFFFFF?text=Honey',
        img: 'https://placehold.co/150x100/164A26/FFFFFF?text=Honey',
        rating: 4.8,
        location: 'Islamabad, PK',
        productCount: 16,
        categories: ['Honey & Preserves', 'Beverages'],
        certifications: ['Organic Certified'],
        joinedDate: '2023-03-10',
        contactInfo: { email: 'hello@pureharvest.pk', phone: '+92 311 111 1111', address: 'Harvest Lane, Islamabad' },
    },
    {
        id: 'ffp1',
        name: 'FarmFresh Pulses',
        desc: 'Delivers 100% organic grains and pulses directly from eco-certified farms.',
        image: 'https://placehold.co/150x100/164A26/FFFFFF?text=Pulses',
        img: 'https://placehold.co/150x100/164A26/FFFFFF?text=Pulses',
        rating: 4.6,
        location: 'Karachi, PK',
        productCount: 22,
        categories: ['Pulses', 'Rice & Grains'],
        certifications: ['ISO 22000'],
        joinedDate: '2021-11-01',
        contactInfo: { email: 'support@farmfresh.pk', phone: '+92 322 222 2222', address: 'Pulses Market, Karachi' },
    },
];

const productMocks = [
    { id: 1, name: 'Fresh farm-grown spinach', price: 120, priceUnit: '/ kg', img: 'https://placehold.co/100x100/175017/FFFFFF?text=Spinach' },
    { id: 2, name: 'Organic Honey', price: 950, priceUnit: '/ 500g', img: 'https://placehold.co/100x100/175017/FFFFFF?text=Honey' },
    { id: 3, name: 'Organic Red Lentil', price: 390, priceUnit: '/ kg', img: 'https://placehold.co/100x100/175017/FFFFFF?text=Lentil' },
];

const HomePage = () => {
    const { dispatch } = useAppContext();
    const [isClient, setIsClient] = useState(false);
    const [showVendorButton, setShowVendorButton] = useState(false);

    useEffect(() => {
        setIsClient(true);
        setShowVendorButton(!localStorage.getItem('authToken'));
    }, []);

    const handleAddToCart = (product) => {
        dispatch({ type: 'ADD_TO_CART', payload: { ...product, qty: 1 } });
        dispatch({ type: 'SET_CART_OPEN', payload: true });
    };

    const handleProductNameClick = (product) => {
        const enriched = {
            ...product,
            price: typeof product.price === 'number' ? `Rs. ${product.price}${product.priceUnit ? ` ${product.priceUnit}` : ''}` : product.price,
            longDesc: 'A curated featured product from our verified organic vendors. Freshness and quality you can trust.',
            vendor: 'GOorganic Featured',
            rating: 4.7,
            category: 'Featured'
        };
        dispatch({ type: 'SET_SELECTED_PRODUCT', payload: enriched });
        dispatch({ type: 'SET_PAGE', payload: 'ProductDetail' });
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
                                    <Button className="mt-8 self-start" onClick={() => dispatch({ type: 'SET_PAGE', payload: 'Shop' })}>
                                        Shop Now
                                    </Button>
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
                    <p className="text-gray-600 text-center mb-12">Discover our verified organic vendors and their amazing products</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {vendorMocks.map((vendor, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col items-center text-center p-6 border-t-4 transition duration-300 hover:shadow-xl" style={{ borderColor: COLORS.secondary }}>
                                <img src={vendor.image || vendor.img} alt={vendor.name} className="w-full h-24 object-cover mb-4 rounded-md" />
                                <h3 className="text-xl font-semibold text-gray-800 flex items-center justify-center">
                                    {vendor.name}
                                    <div className="ml-2">
                                        <VerificationBadge />
                                    </div>
                                </h3>
                                <p className="text-sm text-gray-600 mt-2">{vendor.desc}</p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        dispatch({ type: 'SELECT_VENDOR', payload: vendor });
                                        dispatch({ type: 'SET_PAGE', payload: 'VendorDetail' });
                                    }}
                                    className="mt-4 text-xs font-medium hover:underline text-secondary"
                                >
                                    View Profile &rarr;
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Featured Products Section */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">Featured Products</h2>
                    <p className="text-gray-600 text-center mb-12">Hand-picked organic products from our best vendors</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                        {productMocks.map((product) => (
                            <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden transition-shadow hover:shadow-xl">
                                <img src={product.img} alt={product.name} className="w-full h-48 object-cover" />
                                <div className="p-4">
                                    <button
                                        type="button"
                                        onClick={() => handleProductNameClick(product)}
                                        className="text-left text-lg font-semibold text-gray-800 hover:underline"
                                    >
                                        {product.name}
                                    </button>
                                    <p className="text-secondary font-bold mt-1 text-xl">
                                        Rs. {product.price} <span className="text-sm font-normal text-gray-600">{product.priceUnit}</span>
                                    </p>
                                    <Button className="mt-3 w-full" onClick={() => handleAddToCart(product)}>
                                        Add to Cart
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Call to Action Banner (Green Background) */}
                <section style={{ backgroundColor: '#0c2d0cff' }} className="py-16 mt-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                        <h2 className="text-3xl font-bold mb-4">Ready to Go Organic?</h2>
                        <p className="text-gray-200 mb-8">Join thousands of customers who trust GOorganic for their organic product needs.</p>
                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button
                                onClick={() => dispatch({ type: 'SET_PAGE', payload: 'Shop' })}
                                className="bg-white text-gray-900 border-white hover:bg-gray-200"
                                primary={false}
                            >
                                Start Shopping
                            </Button>
                            {isClient && showVendorButton && (
                                <Button
                                    onClick={() => dispatch({ type: 'SET_PAGE', payload: 'VendorRegister' })}
                                    className="bg-black border border-white text-white hover:bg-gray-700"
                                    primary={false}
                                >
                                    Become a Vendor
                                </Button>
                            )}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default HomePage;
