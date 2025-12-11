'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext, useCart } from '@/context/AppContext';
import { Icon, Button } from '@/components/common/UIComponents';
import { getProducts } from '@/utils/productApi';
import { getCategories } from '@/utils/categoryApi';
import { showToast } from '@/utils/toast';

// Product Card Component with Image Slider
const ProductCard = ({ product, onProductClick, onAddToCart }) => {
    const router = useRouter();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const hasMultipleImages = product.images && product.images.length > 1;

    // Auto-play slider
    useEffect(() => {
        if (!hasMultipleImages) return;

        const interval = setInterval(() => {
            setCurrentImageIndex((prev) =>
                prev === product.images.length - 1 ? 0 : prev + 1
            );
        }, 3000); // Change image every 3 seconds

        return () => clearInterval(interval);
    }, [hasMultipleImages, product.images?.length]);

    const handleVendorClick = (e) => {
        e.stopPropagation();
        if (product.vendor?._id) {
            router.push(`/vendors/${product.vendor._id}`);
        }
    };

    return (
        <div
            className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-lg cursor-pointer"
            onClick={() => onProductClick(product)}
        >
            <div className="relative group overflow-hidden h-48">
                {/* Render all images with crossfade effect */}
                {product.images?.map((image, index) => (
                    <img
                        key={index}
                        src={image.url || 'https://placehold.co/200x200/E9F5E9/164A26?text=No+Image'}
                        alt={`${product.name} - ${index + 1}`}
                        className={`absolute inset-0 w-full h-48 object-cover transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                            }`}
                    />
                ))}
                {!product.images?.length && (
                    <img
                        src="https://placehold.co/200x200/E9F5E9/164A26?text=No+Image"
                        alt={product.name}
                        className="w-full h-48 object-cover"
                    />
                )}

                {hasMultipleImages && (
                    <>
                        {/* Previous Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setCurrentImageIndex((prev) =>
                                    prev === 0 ? product.images.length - 1 : prev - 1
                                );
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-70"
                        >
                            <Icon path="M15 19l-7-7 7-7" className="w-4 h-4" />
                        </button>

                        {/* Next Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setCurrentImageIndex((prev) =>
                                    prev === product.images.length - 1 ? 0 : prev + 1
                                );
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-70"
                        >
                            <Icon path="M9 5l7 7-7 7" className="w-4 h-4" />
                        </button>

                        {/* Dots Indicator */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                            {product.images.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentImageIndex(index);
                                    }}
                                    className={`w-2 h-2 rounded-full transition-all ${currentImageIndex === index
                                        ? 'bg-white w-4'
                                        : 'bg-white bg-opacity-50'
                                        }`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 hover:text-secondary">
                    {product.name}
                </h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>

                {/* Vendor Information */}
                {product.vendor && (
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                        <Icon path="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1" className="w-3 h-3 mr-1" />
                        <span>Sold by </span>
                        <button
                            onClick={handleVendorClick}
                            className="ml-1 text-secondary hover:text-secondary-dark font-medium hover:underline"
                        >
                            {product.vendor.shopName || product.vendor.name}
                        </button>
                    </div>
                )}

                <div className="flex items-center justify-between mt-3">
                    <p className="text-secondary font-bold text-lg">Rs. {product.price}</p>
                    {product.ratings > 0 && (
                        <div className="flex items-center text-yellow-500">
                            <Icon path="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" className="w-4 h-4 fill-current" />
                            <span className="ml-1 text-sm text-gray-700">{product.ratings.toFixed(1)}</span>
                        </div>
                    )}
                </div>

                {/* Low Stock Warning */}
                {product.stock > 0 && product.stock <= 3 && (
                    <div className="mt-2 flex items-center text-xs text-orange-600 font-medium">
                        <Icon path="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" className="w-3 h-3 mr-1" />
                        <span>Only {product.stock} left in stock!</span>
                    </div>
                )}

                <Button
                    onClick={(e) => onAddToCart(e, product)}
                    className="w-full mt-4"
                    disabled={product.stock === 0}
                >
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
            </div>
        </div>
    );
};

const ShopPage = () => {
    const router = useRouter();
    const { dispatch, state } = useAppContext();
    const { addItemToCart, openCart } = useCart();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [currentPage, selectedCategory, searchQuery]);

    const fetchCategories = async () => {
        try {
            const data = await getCategories();
            // Categories API returns array directly
            const categoryList = Array.isArray(data) ? data : (data.categories || []);
            setCategories(['All', ...categoryList.map(cat => cat.name)]);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage
            };

            if (searchQuery) params.keyword = searchQuery;
            if (selectedCategory && selectedCategory !== 'All') {
                // Find category ID from name
                const categoriesData = await getCategories();
                // Categories API returns array directly
                const categoryList = Array.isArray(categoriesData) ? categoriesData : (categoriesData.categories || []);
                const category = categoryList.find(cat => cat.name === selectedCategory);
                if (category) params.category = category._id;
            }

            const data = await getProducts(params);
            setProducts(data.products || []);
            setTotalPages(data.totalPages || 1);
            setTotalProducts(data.totalProducts || 0);
        } catch (error) {
            showToast.error(error.response?.data?.message || 'Failed to fetch products');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleProductClick = (product) => {
        dispatch({ type: 'SET_SELECTED_PRODUCT', payload: product });
        router.push(`/products/${product._id}`);
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

    return (
        <div className="bg-gray-50">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Shop Organic Products</h1>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0">
                    <div className="relative w-full md:w-72">
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-secondary focus:border-transparent"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                        <Icon
                            path="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            className="w-5 h-5 absolute right-3 top-2.5 text-gray-400"
                        />
                    </div>

                    <div className="flex flex-wrap justify-center gap-2">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => {
                                    setSelectedCategory(category);
                                    setCurrentPage(1);
                                }}
                                className={`px-4 py-2 text-sm rounded-full transition-colors ${selectedCategory === category
                                    ? 'bg-secondary text-white font-bold'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Loading products...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No products found. Try adjusting your filters.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product) => (
                            <ProductCard
                                key={product._id}
                                product={product}
                                onProductClick={handleProductClick}
                                onAddToCart={handleAddToCart}
                            />
                        ))}
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="mt-12 flex justify-center items-center space-x-2">
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

export default ShopPage;

