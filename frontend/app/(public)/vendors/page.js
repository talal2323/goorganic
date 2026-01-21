'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAppContext } from '@/context/AppContext';
import { Button, VerificationBadge } from '@/components/common/UIComponents';
import { getVendorsWithPagination } from '@/utils/userApi';
import { showToast } from '@/utils/toast';

const VendorListPage = () => {
    const router = useRouter();
    const { dispatch } = useAppContext();
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchVendors();
    }, [currentPage]);

    const fetchVendors = async () => {
        try {
            setLoading(true);
            const data = await getVendorsWithPagination(currentPage);
            setVendors(data.vendors || []);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            showToast.error(error.response?.data?.message || 'Failed to fetch vendors');
            setVendors([]);
        } finally {
            setLoading(false);
        }
    };

    const handleVendorClick = (vendor) => {
        router.push(`/vendors/${vendor._id}`);
    };

    if (loading) {
        return (
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                <p className="text-gray-500">Loading vendors...</p>
            </main>
        );
    }

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900">Our Verified Vendors</h1>
                <p className="mt-4 text-lg text-gray-600">
                    Discover our network of certified organic vendors, each thoroughly verified.
                </p>
            </div>

            {vendors.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">No vendors found.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {vendors.map((vendor) => (
                            <div key={vendor._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all border border-gray-100">
                                <div className="relative h-56">
                                    <Image
                                        src={vendor.avatar?.url || 'https://placehold.co/800x400/E9F5E9/164A26?text=Vendor+Cover'}
                                        alt={vendor.shopName || vendor.name}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        className="object-cover"
                                        onError={(e) => { e.target.src = 'https://placehold.co/800x400/E9F5E9/164A26?text=Vendor+Cover'; }}
                                    />
                                    <div className="absolute -bottom-12 left-6 w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                                        <Image
                                            src={vendor.avatar?.url || 'https://placehold.co/150x150/E9F5E9/164A26?text=Vendor'}
                                            alt={vendor.shopName || vendor.name}
                                            fill
                                            sizes="96px"
                                            className="object-cover"
                                            onError={(e) => { e.target.src = 'https://placehold.co/150x150/E9F5E9/164A26?text=Vendor'; }}
                                        />
                                    </div>
                                </div>

                                <div className="p-6 pt-16">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3
                                                    className="text-xl font-bold text-gray-900 cursor-pointer hover:text-primary"
                                                    onClick={() => handleVendorClick(vendor)}
                                                >
                                                    {vendor.shopName || vendor.name}
                                                </h3>
                                                {vendor.vendorStatus === 'Approved' && <VerificationBadge />}
                                            </div>
                                            <p className="text-sm text-gray-600">{vendor.name}</p>
                                            {vendor.businessCategory && (
                                                <p className="text-xs text-gray-500 mt-2">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-primary font-medium">
                                                        {vendor.businessCategory}
                                                    </span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {vendor.shopDescription && (
                                        <p className="mt-3 text-sm text-gray-600 line-clamp-3">{vendor.shopDescription}</p>
                                    )}
                                    <div className="flex items-center mt-4">
                                        {vendor.averageRating > 0 && (
                                            <div className="flex items-center text-yellow-500">
                                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                </svg>
                                                <span className="ml-1 text-sm font-medium text-gray-700">{vendor.averageRating.toFixed(1)}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-6">
                                        <button
                                            onClick={() => handleVendorClick(vendor)}
                                            className="w-full py-2.5 px-4 border-2 border-primary text-primary rounded-lg font-medium hover:bg-primary hover:text-white transition-all"
                                        >
                                            View Products
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Controls */}
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
                </>
            )}
        </main>
    );
};

export default VendorListPage;

