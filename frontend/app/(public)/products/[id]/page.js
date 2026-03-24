'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppContext, useCart } from '@/context/AppContext';
import Image from 'next/image';
import { Button, Icon, VerificationBadge } from '@/components/common/UIComponents';
import { getProductById } from '@/utils/productApi';
import { showToast } from '@/utils/toast';

const ProductDetailPage = () => {
    const router = useRouter();
    const params = useParams();
    const { dispatch, state } = useAppContext();
    const { addItemToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [qty, setQty] = useState(1);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    const inc = () => setQty(q => Math.min(product?.stock || 99, q + 1));
    const dec = () => setQty(q => Math.max(1, q - 1));

    useEffect(() => {
        if (params.id) {
            fetchProduct();
        }
    }, [params.id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const data = await getProductById(params.id);
            setProduct(data);
        } catch (error) {
            showToast.error(error.response?.data?.message || 'Failed to fetch product');
            setProduct(null);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        // Check if user is logged in
        if (!state.isLoggedIn) {
            showToast.error('Please log in to add items to cart');
            router.push('/auth/login');
            return;
        }

        try {
            await addItemToCart(product._id, qty);
            showToast.success(`${product.name} added to cart`);
        } catch (error) {
            console.error('Error adding to cart:', error);
            const message = error.response?.data?.message || error.message || 'Failed to add item to cart';
            showToast.error(message);
        }
    };

    if (loading) {
        return (
            <div className="bg-gray-50">
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
                    <p className="text-gray-500">Loading product...</p>
                </main>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="bg-gray-50">
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
                    <h2 className="text-2xl font-semibold mb-4">Product not found</h2>
                    <Button onClick={() => router.push('/shop')}>
                        &larr; Back to Shop
                    </Button>
                </main>
            </div>
        );
    }

    return (
        <div className="bg-gray-50">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-6">
                    <button
                        onClick={() => router.push('/shop')}
                        className="text-sm font-medium text-primary hover:text-secondary flex items-center"
                    >
                        <Icon path="M10 19l-7-7m0 0l7-7m-7 7h18" className="w-4 h-4 mr-2" />
                        Back to Shop
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        <div className="p-4">
                            {/* Main Image */}
                            <div className="relative mb-4 h-96 rounded-lg overflow-hidden">
                                <Image
                                    src={product.images?.[selectedImageIndex]?.url || 'https://placehold.co/600x600/E9F5E9/164A26?text=Product'}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            {/* Thumbnail Gallery */}
                            {product.images && product.images.length > 1 && (
                                <div className="grid grid-cols-4 gap-2">
                                    {product.images.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImageIndex(index)}
                                            className={`relative border-2 rounded-lg overflow-hidden h-20 ${selectedImageIndex === index
                                                ? 'border-secondary'
                                                : 'border-gray-200 hover:border-gray-400'
                                                }`}
                                        >
                                            <Image
                                                src={image.url}
                                                alt={`${product.name} ${index + 1}`}
                                                fill
                                                sizes="80px"
                                                className="object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-6 flex flex-col justify-center">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

                            <div className="flex items-center mb-4 space-x-4">
                                {product.averageRating > 0 && (
                                    <div className="flex items-center text-yellow-500">
                                        <Icon path="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" className="w-5 h-5 fill-current" />
                                        <span className="ml-2 text-sm text-gray-700">{product.averageRating.toFixed(1)}</span>
                                    </div>
                                )}
                                {product.vendor?.name && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => router.push(`/vendors/${product.vendor._id}`)}
                                            className="text-sm text-primary hover:text-secondary transition-colors"
                                        >
                                            {product.vendor.name}
                                        </button>
                                        {product.vendor.vendorStatus === 'Approved' && <VerificationBadge />}
                                    </div>
                                )}
                            </div>

                            <p className="text-gray-600 text-base mb-6">{product.description}</p>

                            <div className="flex items-center justify-between mb-6">
                                <span className="text-3xl font-bold text-secondary">Rs. {product.price}</span>
                                <div className="flex items-center space-x-3">
                                    <button onClick={dec} className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50">-</button>
                                    <span className="min-w-[2ch] text-center font-semibold">{qty}</span>
                                    <button onClick={inc} className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50">+</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                <div className="p-3 rounded-lg bg-gray-50">
                                    <div className="text-xs text-gray-500">Category</div>
                                    <div className="font-medium text-gray-800">{product.category?.name || 'N/A'}</div>
                                </div>
                                <div className="p-3 rounded-lg bg-gray-50">
                                    <div className="text-xs text-gray-500">Vendor</div>
                                    <div className="font-medium text-gray-800">{product.vendor?.name || 'N/A'}</div>
                                </div>
                                <div className="p-3 rounded-lg bg-gray-50">
                                    <div className="text-xs text-gray-500">Stock</div>
                                    <div className={`font-medium ${product.stock > 0 ? 'text-green-700' : 'text-red-600'}`}>
                                        {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={handleAddToCart}
                                className="w-full"
                                disabled={product.stock === 0}
                            >
                                <Icon path="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" className="w-5 h-5 mr-2" />
                                {product.stock === 0 ? 'Out of Stock' : `Add ${qty} to Cart`}
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProductDetailPage;
