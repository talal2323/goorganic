'use client'

import React, { useMemo, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button, Icon, StarRating } from '@/components/common/UIComponents';
import { COLORS } from '@/utils/config';

const ProductDetailPage = () => {
    const { state, dispatch } = useAppContext();
    const { selectedProduct } = state;

    const [qty, setQty] = useState(1);
    const inc = () => setQty(q => Math.min(99, q + 1));
    const dec = () => setQty(q => Math.max(1, q - 1));

    const handleAddToCart = () => {
        dispatch({ type: 'ADD_TO_CART', payload: { ...selectedProduct, qty } });
        dispatch({ type: 'SET_CART_OPEN', payload: true });
    };

    const displayPrice = useMemo(() => {
        if (typeof selectedProduct?.price === 'string') return selectedProduct.price;
        if (typeof selectedProduct?.price === 'number') return `Rs. ${selectedProduct.price}${selectedProduct.priceUnit ? ` ${selectedProduct.priceUnit}` : ''}`;
        return 'Price unavailable';
    }, [selectedProduct?.price, selectedProduct?.priceUnit]);

    const displayVendor = selectedProduct?.vendor || 'GOorganic Featured';
    const displayRating = selectedProduct?.rating || 4.6;
    const displayCategory = selectedProduct?.category || 'Organic Produce';
    const sku = useMemo(() => `SKU-${String(selectedProduct?.id ?? selectedProduct?.name).toString().replace(/\s+/g, '').slice(0, 12).toUpperCase()}`, [selectedProduct?.id, selectedProduct?.name]);
    const highlights = useMemo(() => (
        selectedProduct?.highlights || [
            'Certified organic and pesticide-free',
            'Locally sourced for peak freshness',
            'Sustainably grown and responsibly packed',
            'Quality-checked by verified vendors'
        ]
    ), [selectedProduct?.highlights]);

    const nutrition = useMemo(() => {
        const base = { calories: 'Low', protein: 'Good', fiber: 'High', fat: 'Low' };
        if (/lentil|pulse/i.test(selectedProduct?.name || '')) return { calories: 'Moderate', protein: 'High', fiber: 'High', fat: 'Low' };
        if (/honey/i.test(selectedProduct?.name || '')) return { calories: 'High', protein: 'Trace', fiber: 'None', fat: 'None' };
        return base;
    }, [selectedProduct?.name]);

    if (!selectedProduct) {
        return (
            <div className="bg-gray-50">
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
                    <h2 className="text-2xl font-semibold mb-4">Product not found</h2>
                    <Button onClick={() => dispatch({ type: 'SET_PAGE', payload: 'Shop' })}>
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
                        onClick={() => dispatch({ type: 'SET_PAGE', payload: 'Shop' })}
                        className="text-sm font-medium text-primary hover:text-secondary flex items-center"
                    >
                        <Icon path="M10 19l-7-7m0 0l7-7m-7 7h18" className="w-4 h-4 mr-2" />
                        Back to Shop
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        <div className="p-4">
                            <img
                                src={selectedProduct.img || 'https://placehold.co/600x600/E9F5E9/164A26?text=Product'}
                                alt={selectedProduct.name}
                                className="w-full h-full object-cover rounded-lg min-h-[300px]"
                            />
                        </div>

                        <div className="p-6 flex flex-col justify-center">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h1>

                            <div className="flex items-center mb-4 space-x-4">
                                <div className="flex items-center">
                                    <StarRating rating={displayRating} />
                                    <span className="ml-2 text-sm text-gray-600">({displayRating} rating)</span>
                                </div>
                                <button
                                    onClick={() => dispatch({ type: 'SET_PAGE', payload: 'Vendor' })}
                                    className="text-sm text-primary hover:underline flex items-center"
                                >
                                    <Icon path="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.192-2.058-.573-3.016z" className="w-4 h-4 mr-1" />
                                    {displayVendor}
                                </button>
                            </div>

                            <p className="text-gray-600 text-base mb-6">{selectedProduct.longDesc || 'Grown and processed to high organic standards. Carefully handled to preserve freshness and nutrients.'}</p>

                            <div className="flex items-center justify-between mb-6">
                                <span className="text-3xl font-bold" style={{ color: COLORS.secondary }}>{displayPrice}</span>
                                <div className="flex items-center space-x-3">
                                    <button onClick={dec} className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50">-</button>
                                    <span className="min-w-[2ch] text-center font-semibold">{qty}</span>
                                    <button onClick={inc} className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50">+</button>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Highlights</h3>
                                <ul className="list-disc list-inside text-gray-600 space-y-1">
                                    {highlights.map((h, i) => (<li key={i}>{h}</li>))}
                                </ul>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                <div className="p-3 rounded-lg bg-gray-50"><div className="text-xs text-gray-500">Category</div><div className="font-medium text-gray-800">{displayCategory}</div></div>
                                <div className="p-3 rounded-lg bg-gray-50"><div className="text-xs text-gray-500">Vendor</div><div className="font-medium text-gray-800">{displayVendor}</div></div>
                                <div className="p-3 rounded-lg bg-gray-50"><div className="text-xs text-gray-500">SKU</div><div className="font-medium text-gray-800">{sku}</div></div>
                                <div className="p-3 rounded-lg bg-gray-50"><div className="text-xs text-gray-500">Availability</div><div className="font-medium text-green-700">In stock · Delivery in 2-4 days</div></div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Nutrition facts (approx.)</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                                    <div className="p-3 rounded-lg bg-gray-50"><div className="text-gray-500">Calories</div><div className="font-medium">{nutrition.calories}</div></div>
                                    <div className="p-3 rounded-lg bg-gray-50"><div className="text-gray-500">Protein</div><div className="font-medium">{nutrition.protein}</div></div>
                                    <div className="p-3 rounded-lg bg-gray-50"><div className="text-gray-500">Fiber</div><div className="font-medium">{nutrition.fiber}</div></div>
                                    <div className="p-3 rounded-lg bg-gray-50"><div className="text-gray-500">Fat</div><div className="font-medium">{nutrition.fat}</div></div>
                                </div>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-sm font-semibold text-gray-800 mb-2">Tags</h3>
                                <div className="flex flex-wrap gap-2">{[displayCategory, 'Organic', 'Natural'].filter(Boolean).map((t, i) => (<span key={i} className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">#{t}</span>))}</div>
                            </div>

                            <Button onClick={handleAddToCart} className="w-full"><Icon path="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" className="w-5 h-5 mr-2" />Add {qty} to Cart</Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProductDetailPage;
