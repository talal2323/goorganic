'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { useAppContext, useCart } from '@/context/AppContext';
import { Button, Icon, StarRating, VerificationBadge } from '@/components/common/UIComponents';
import { getVendorByIdUser } from '@/utils/userApi';
import { getProducts } from '@/utils/productApi';
import { showToast } from '@/utils/toast';

const VendorDetailPage = () => {
    const router = useRouter();
    const params = useParams();
    const { dispatch, state } = useAppContext();
    const { addItemToCart } = useCart();

    const [vendor, setVendor] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [productCategories, setProductCategories] = useState([]);

    useEffect(() => {
        if (params.id) {
            fetchVendor();
            fetchVendorProducts();
        }
    }, [params.id, currentPage]);

    const fetchVendor = async () => {
        try {
            const data = await getVendorByIdUser(params.id);
            setVendor(data);
        } catch (error) {
            showToast.error(error.response?.data?.message || 'Failed to fetch vendor');
            setVendor(null);
        }
    };

    const fetchVendorProducts = async () => {
        try {
            setLoading(true);
            const data = await getProducts({ page: currentPage, vendor: params.id });
            setProducts(data.products || []);
            setTotalPages(data.totalPages || 1);

            // Extract unique categories from all vendor's products
            if (data.products && data.products.length > 0) {
                const categories = [...new Set(data.products.map(p => p.category?.name).filter(Boolean))];
                setProductCategories(categories);
            }
        } catch (error) {
            showToast.error(error.response?.data?.message || 'Failed to fetch products');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStartChat = () => {
        const vendorId = params?.id;
        if (!vendorId) {
            showToast.error('Vendor is unavailable for chat');
            return;
        }

        const chatRoute = `/chat/${vendorId}`;

        if (!state?.isLoggedIn) {
            router.push(`/auth/login?redirect=${encodeURIComponent(chatRoute)}`);
            return;
        }

        router.push(chatRoute);
    };

    const handleAddToCart = async (e, product) => {
        e.stopPropagation();
        if (!state?.isLoggedIn) {
            showToast.error('Please log in to add items to cart');
            router.push('/auth/login');
            return;
        }
        try {
            await addItemToCart(product._id, 1);
            showToast.success(`${product.name} added to cart`);
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to add item to cart';
            showToast.error(message);
        }
    };

    if (loading && !vendor) {
        return (
            <div className="bg-gray-50">
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
                    <p className="text-gray-500">Loading vendor...</p>
                </main>
            </div>
        );
    }

    if (!vendor) {
        return (
            <div className="bg-gray-50">
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
                    <h2 className="text-2xl font-semibold mb-4">Vendor not found</h2>
                    <Button onClick={() => router.push('/')}>
                        &larr; Back to Home
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
                        onClick={() => router.push('/vendors')}
                        className="text-sm font-medium text-primary hover:text-secondary flex items-center"
                    >
                        <Icon path="M10 19l-7-7m0 0l7-7m-7 7h18" className="w-4 h-4 mr-2" />
                        Back to Vendors
                    </button>
                </div>

                {/* Vendor Profile Section */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
                    {/* Cover Image */}
                    <div className="relative h-64 bg-gradient-to-r from-green-600 to-green-800">
                        <Image
                            src={vendor.shopImages?.[0]?.url || vendor.avatar?.url || 'https://placehold.co/1200x300/E9F5E9/164A26?text=Vendor+Cover'}
                            alt="Cover"
                            fill
                            className="object-cover"
                            onError={(e) => { e.target.src = 'https://placehold.co/1200x300/E9F5E9/164A26?text=Vendor+Cover'; }}
                        />
                        {/* Profile Picture */}
                        <div className="absolute -bottom-16 left-8">
                            <div className="relative w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                                <Image
                                    src={vendor.avatar?.url || 'https://placehold.co/200x200/E9F5E9/164A26?text=Vendor'}
                                    alt={vendor.shopName || vendor.name}
                                    fill
                                    className="object-cover"
                                    onError={(e) => { e.target.src = 'https://placehold.co/200x200/E9F5E9/164A26?text=Vendor'; }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Vendor Information */}
                    <div className="pt-20 px-8 pb-8">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-3xl font-bold text-gray-900">
                                        {vendor.shopName || vendor.name}
                                    </h1>
                                    {vendor.vendorStatus === 'Approved' && (
                                        <VerificationBadge />
                                    )}
                                </div>
                                <p className="text-lg text-gray-600 mb-2">{vendor.name}</p>
                                {vendor.businessCategory && (
                                    <p className="text-sm text-gray-500 mb-4">
                                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700">
                                            {vendor.businessCategory}
                                        </span>
                                    </p>
                                )}

                                {/* Rating and Reviews */}
                                {vendor.averageRating > 0 && (
                                    <div className="flex items-center mb-4">
                                        <div className="flex items-center text-yellow-500">
                                            <Icon path="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" className="w-5 h-5 fill-current" />
                                            <span className="ml-2 text-lg font-semibold text-gray-900">{vendor.averageRating.toFixed(1)}</span>
                                        </div>
                                        <span className="ml-2 text-gray-600">({vendor.reviewCount || 0} reviews)</span>
                                    </div>
                                )}
                            </div>
                            <div className="mt-4 md:mt-0 md:ml-6">
                                <Button onClick={handleStartChat} className="w-full md:w-auto">
                                    <Icon path="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-3 3-3-3z" className="w-4 h-4 mr-2" />
                                    Chat with Vendor
                                </Button>
                            </div>
                        </div>

                        {/* Business Description */}
                        {vendor.shopDescription && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
                                <p className="text-gray-700 leading-relaxed">
                                    {vendor.shopDescription}
                                </p>
                            </div>
                        )}

                        {/* Product Categories */}
                        {productCategories.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Product Categories</h3>
                                <div className="flex flex-wrap gap-2">
                                    {productCategories.map((category, index) => (
                                        <span key={index} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                                            {category}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Location */}
                        {vendor.shopAddress?.city && (
                            <div className="mb-6">
                                <div className="flex items-start">
                                    <Icon path="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Location</p>
                                        <p className="text-gray-900">{vendor.shopAddress.city}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Certifications */}
                        {vendor.certifications && vendor.certifications.length > 0 && (
                            <div className="pt-6 border-t border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Certifications</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {vendor.certifications.map((cert, index) => {
                                        const isPDF = cert.url?.toLowerCase().endsWith('.pdf');
                                        return (
                                            <div
                                                key={index}
                                                className="border-2 border-gray-200 rounded-lg p-4 hover:border-secondary transition-colors cursor-pointer bg-white"
                                                onClick={() => window.open(cert.url, '_blank')}
                                            >
                                                {isPDF ? (
                                                    <div className="flex flex-col items-center justify-center h-32">
                                                        <svg className="w-12 h-12 text-red-500 mb-2" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                                        </svg>
                                                        <p className="text-sm text-gray-700 font-medium text-center">
                                                            {cert.name || 'Certificate'}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="relative w-full h-32">
                                                            <Image
                                                                src={cert.url}
                                                                alt={cert.name || `Certification ${index + 1}`}
                                                                fill
                                                                className="object-cover rounded-md"
                                                            />
                                                        </div>
                                                        {cert.name && (
                                                            <p className="text-sm text-gray-700 mt-2 text-center font-medium">{cert.name}</p>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Products Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-3xl font-bold text-gray-900">Products</h2>
                        <span className="text-gray-600">{products.length > 0 ? `${products.length} products` : ''}</span>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">Loading products...</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-lg shadow-md">
                            <Icon path="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">No products available yet</p>
                            <p className="text-gray-400 text-sm mt-2">This vendor hasn't listed any products.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {products.map((product) => (
                                <div
                                    key={product._id}
                                    className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-2xl transition-all border border-gray-100"
                                    onClick={() => router.push(`/products/${product._id}`)}
                                >
                                    <div className="relative h-56">
                                        <Image
                                            src={product.images?.[0]?.url || 'https://placehold.co/200x200/E9F5E9/164A26?text=No+Image'}
                                            alt={product.name}
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="p-6">
                                        <h2 className="text-lg font-semibold text-gray-900">{product.name}</h2>
                                        <p className="text-sm text-gray-600 line-clamp-2 mt-2">{product.description}</p>
                                        {product.averageRating > 0 && (
                                            <div className="flex items-center mt-2">
                                                <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                                                <span className="ml-1 text-sm font-semibold text-gray-700">{product.averageRating.toFixed(1)}</span>
                                                <span className="ml-1 text-xs text-gray-400">({product.reviewCount || 0})</span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between mt-4">
                                            <p className="text-primary font-bold text-2xl">Rs. {product.price}</p>
                                            {product.stock > 0 ? (
                                                <span className="text-xs text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full">In Stock</span>
                                            ) : (
                                                <span className="text-xs text-red-600 font-medium bg-red-50 px-3 py-1 rounded-full">Out of Stock</span>
                                            )}
                                        </div>
                                        {product.stock > 0 && product.stock <= 3 && (
                                            <div className="mt-2 flex items-center text-xs text-orange-600 font-medium">
                                                <Icon path="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" className="w-3 h-3 mr-1" />
                                                <span>Only {product.stock} left in stock!</span>
                                            </div>
                                        )}
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

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-8 flex justify-center items-center space-x-2">
                        <Button
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            primary={false}
                            className="px-4 py-2"
                        >
                            Previous
                        </Button>
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            let pageNumber;
                            if (totalPages <= 5) {
                                pageNumber = i + 1;
                            } else if (currentPage <= 3) {
                                pageNumber = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNumber = totalPages - 4 + i;
                            } else {
                                pageNumber = currentPage - 2 + i;
                            }
                            return (
                                <button
                                    key={pageNumber}
                                    onClick={() => setCurrentPage(pageNumber)}
                                    className={`px-4 py-2 text-sm font-medium rounded-md border ${currentPage === pageNumber
                                        ? 'bg-secondary text-white border-secondary'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                                        }`}
                                >
                                    {pageNumber}
                                </button>
                            );
                        })}
                        <Button
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            primary={false}
                            className="px-4 py-2"
                        >
                            Next
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default VendorDetailPage;