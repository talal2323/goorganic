'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAppContext, useCart } from '@/context/AppContext';
import { Icon, Button } from '@/components/common/UIComponents';
import { getProducts } from '@/utils/productApi';
import { getCategories } from '@/utils/categoryApi';
import { getSubscriptionBoxes } from '@/utils/subscriptionBoxApi';
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
            className="bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-2xl cursor-pointer border border-gray-100"
            onClick={() => onProductClick(product)}
        >
            <div className="relative group overflow-hidden h-56">
                {/* Render all images with crossfade effect */}
                {product.images?.map((image, index) => (
                    <Image
                        key={index}
                        src={image.url || 'https://placehold.co/200x200/E9F5E9/164A26?text=No+Image'}
                        alt={`${product.name} - ${index + 1}`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className={`object-cover transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                            }`}
                    />
                ))}
                {!product.images?.length && (
                    <Image
                        src="https://placehold.co/200x200/E9F5E9/164A26?text=No+Image"
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
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
            <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 hover:text-secondary">
                    {product.name}
                </h3>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{product.description}</p>

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

                <div className="flex items-center justify-between mt-4">
                    <p className="text-primary font-bold text-2xl">Rs. {product.price}</p>
                    {product.averageRating > 0 && (
                        <div className="flex items-center text-yellow-500">
                            <Icon path="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" className="w-4 h-4 fill-current" />
                            <span className="ml-1 text-sm text-gray-700">{product.averageRating.toFixed(1)}</span>
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

                <button
                    className="mt-4 w-full py-2.5 px-4 border-2 border-primary text-primary rounded-lg font-medium hover:bg-primary hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={(e) => onAddToCart(e, product)}
                    disabled={product.stock === 0}
                >
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        </div>
    );
};

// Subscription Box Card Component
const SubscriptionBoxCard = ({ box, onBoxClick, onSubscribe }) => {
    const router = useRouter();

    const handleVendorClick = (e) => {
        e.stopPropagation();
        if (box.vendor?._id) {
            router.push(`/vendors/${box.vendor._id}`);
        }
    };

    return (
        <div
            className="bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-2xl border border-gray-100"
        >
            <div className="relative h-56 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                <div className="text-center px-6">
                    <Icon path="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" className="w-16 h-16 mx-auto text-secondary mb-2" />
                    <p className="text-xs text-gray-500">Recurring Subscription</p>
                </div>
            </div>
            <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 hover:text-secondary">
                    {box.title}
                </h3>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{box.description}</p>

                {/* Vendor Information */}
                {box.vendor && (
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                        <Icon path="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1" className="w-3 h-3 mr-1" />
                        <span>Sold by </span>
                        <button
                            onClick={handleVendorClick}
                            className="ml-1 text-secondary hover:text-secondary-dark font-medium hover:underline"
                        >
                            {box.vendor.shopName || box.vendor.name}
                        </button>
                    </div>
                )}

                {/* Frequency Badge */}
                <div className="mt-3 flex items-center gap-2">
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full capitalize">
                        {box.frequency}
                    </span>
                    <span className="text-xs text-gray-500">{box.products?.length || 0} products</span>
                </div>

                <div className="flex items-center justify-between mt-4">
                    <p className="text-primary font-bold text-2xl">Rs. {box.price}</p>
                </div>

                <button
                    className="mt-4 w-full py-2.5 px-4 border-2 border-primary text-primary rounded-lg font-medium hover:bg-primary hover:text-white transition-all"
                    onClick={(e) => {
                        e.stopPropagation();
                        onSubscribe(e, box);
                    }}
                >
                    Subscribe Now
                </button>
            </div>
        </div>
    );
};

const ShopPage = () => {
    const router = useRouter();
    const { dispatch, state } = useAppContext();
    const { addItemToCart } = useCart();
    const [products, setProducts] = useState([]);
    const [subscriptionBoxes, setSubscriptionBoxes] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [filterOptions, setFilterOptions] = useState([]); // All, categories, Subscription Boxes
    const [selectedFilter, setSelectedFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(10000);

    const handlePriceChange = (type, value) => {
        const numValue = parseInt(value) || 0;
        if (type === 'min') {
            setMinPrice(Math.min(numValue, maxPrice - 100));
        } else {
            setMaxPrice(Math.max(numValue, minPrice + 100));
        }
    };

    const applyPriceFilter = () => {
        setPriceRange({ min: minPrice, max: maxPrice });
        setCurrentPage(1);
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [currentPage, selectedFilter, searchQuery, priceRange]);

    const fetchCategories = async () => {
        try {
            const data = await getCategories();
            // Categories API returns array directly
            const categoryList = Array.isArray(data) ? data : (data.categories || []);
            setAllCategories(categoryList);
            // Build filter options: All, categories, Subscription Boxes
            const options = ['All', ...categoryList.map(cat => cat.name), 'Subscription Boxes'];
            setFilterOptions(options);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);

            const isShowingBoxes = selectedFilter === 'All' || selectedFilter === 'Subscription Boxes';
            const isShowingProducts = selectedFilter === 'All' || (selectedFilter !== 'Subscription Boxes');

            // Fetch products
            if (isShowingProducts) {
                const params = {
                    page: currentPage
                };

                if (searchQuery) params.keyword = searchQuery;

                // If a specific category is selected
                if (selectedFilter !== 'All' && selectedFilter !== 'Subscription Boxes') {
                    const category = allCategories.find(cat => cat.name === selectedFilter);
                    if (category) params.category = category._id;
                }

                if (priceRange.min > 0) params.price_min = priceRange.min;
                if (priceRange.max < 10000) params.price_max = priceRange.max;

                const data = await getProducts(params);
                setProducts(data.products || []);
                setTotalPages(data.totalPages || 1);
                setTotalProducts(data.totalProducts || 0);
            } else {
                setProducts([]);
            }

            // Fetch subscription boxes
            if (isShowingBoxes) {
                try {
                    const boxData = await getSubscriptionBoxes();
                    let boxes = Array.isArray(boxData) ? boxData : (boxData.boxes || []);

                    // Filter by search query if provided
                    if (searchQuery) {
                        boxes = boxes.filter(box =>
                            box.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            box.description.toLowerCase().includes(searchQuery.toLowerCase())
                        );
                    }

                    setSubscriptionBoxes(boxes);
                } catch (error) {
                    console.error('Failed to fetch subscription boxes:', error);
                    setSubscriptionBoxes([]);
                }
            } else {
                setSubscriptionBoxes([]);
            }
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
        } catch (error) {
            console.error('Error adding to cart:', error);
            const message = error.response?.data?.message || error.message || 'Failed to add item to cart';
            showToast.error(message);
        }
    };

    const handleSubscribe = (e, box) => {
        e.stopPropagation();

        // Check if user is logged in
        if (!state.isLoggedIn) {
            showToast.error('Please log in to subscribe');
            router.push('/auth/login');
            return;
        }

        // Redirect to subscription checkout page
        router.push(`/subscription-boxes/${box._id}`);
    };

    return (
        <div className="bg-gray-50">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Shop Organic Products</h1>
                </div>

                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
                    {/* Search Bar */}
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

                    {/* Filters Container */}
                    <div className="flex flex-wrap items-center gap-2 w-full justify-center">
                        {/* Unified Filters */}
                        {filterOptions.map(option => (
                            <button
                                key={option}
                                onClick={() => {
                                    setSelectedFilter(option);
                                    setCurrentPage(1);
                                }}
                                className={`px-4 py-2 text-sm rounded-full transition-colors whitespace-nowrap ${selectedFilter === option
                                        ? 'bg-secondary text-white font-bold'
                                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                    }`}
                            >
                                {option}
                            </button>
                        ))}

                        {/* Price Range Slider - Only show for products */}
                        {selectedFilter !== 'Subscription Boxes' && (
                            <div className="bg-white rounded-lg shadow-sm px-3 py-2 flex flex-col gap-2 min-w-max">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-gray-600 whitespace-nowrap">Price:</span>

                                    {/* Slider Container */}
                                    <div className="relative w-48">
                                        {/* Price Labels */}
                                        <div className="flex justify-between mb-1 text-xs">
                                            <span className="text-gray-600">Rs.{minPrice}</span>
                                            <span className="text-gray-600">Rs.{maxPrice}</span>
                                        </div>

                                        {/* Slider Track */}
                                        <div className="relative h-1 bg-gray-200 rounded-full mb-1">
                                            {/* Green Active Range */}
                                            <div
                                                className="absolute h-1 bg-secondary rounded-full"
                                                style={{
                                                    left: `${(minPrice / 10000) * 100}%`,
                                                    right: `${100 - (maxPrice / 10000) * 100}%`
                                                }}
                                            />
                                        </div>

                                        {/* Min Range Input */}
                                        <input
                                            type="range"
                                            min="0"
                                            max="10000"
                                            step="100"
                                            value={minPrice}
                                            onChange={(e) => handlePriceChange('min', e.target.value)}
                                            onMouseUp={applyPriceFilter}
                                            onTouchEnd={applyPriceFilter}
                                            className="absolute w-full h-1 bg-transparent appearance-none pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-lime-700 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-secondary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gray-100 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-secondary [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow"
                                            style={{ zIndex: minPrice > maxPrice - 1000 ? 5 : 3 }}
                                        />

                                        {/* Max Range Input */}
                                        <input
                                            type="range"
                                            min="0"
                                            max="10000"
                                            step="100"
                                            value={maxPrice}
                                            onChange={(e) => handlePriceChange('max', e.target.value)}
                                            onMouseUp={applyPriceFilter}
                                            onTouchEnd={applyPriceFilter}
                                            className="absolute w-full h-1 bg-transparent appearance-none pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-lime-700 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-secondary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gray-100 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-secondary [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow"
                                            style={{ zIndex: 4 }}
                                        />
                                    </div>
                                </div>

                                {/* Clear Filter Button */}
                                {(minPrice > 0 || maxPrice < 10000) && (
                                    <button
                                        onClick={() => {
                                            setMinPrice(0);
                                            setMaxPrice(10000);
                                            setPriceRange({ min: 0, max: 10000 });
                                            setCurrentPage(1);
                                        }}
                                        className="w-full px-2 py-1 text-xs text-gray-600 hover:text-gray-800 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                                    >
                                        Clear Filter
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Loading...</p>
                    </div>
                ) : (products.length === 0 && subscriptionBoxes.length === 0) ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No items found. Try adjusting your filters.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Display Subscription Boxes */}
                        {subscriptionBoxes.map((box) => (
                            <SubscriptionBoxCard
                                key={box._id}
                                box={box}
                                onSubscribe={handleSubscribe}
                            />
                        ))}

                        {/* Display Products */}
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

                {totalPages > 1 && selectedFilter !== 'Subscription Boxes' && (
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

