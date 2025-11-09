'use client'

import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button, Icon, StarRating } from '@/components/common/UIComponents';

const VendorDetailPage = () => {
  const { state, dispatch } = useAppContext();
  const { selectedVendor } = state;

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  const mockProducts = Array.from({ length: 11 }, (_, i) => ({
    id: i + 1,
    name: `Product ${i + 1}`,
    desc: `Description for product ${i + 1}`,
    price: `Rs. ${(i + 1) * 100}`,
    img: `https://placehold.co/200x200/175017/FFFFFF?text=Product+${i + 1}`,
  }));

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = mockProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(mockProducts.length / productsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (!selectedVendor) {
    return (
      <div className="bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Vendor not found</h2>
          <Button onClick={() => dispatch({ type: 'SET_PAGE', payload: 'Home' })}>
            &larr; Back to Home
          </Button>
        </main>
      </div>
    );
  }

  const {
    name,
    description,
    rating = 0,
    location = '',
    certifications = [],
    products = [],
  } = selectedVendor;

  return (
    <div className="bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <button
            onClick={() => dispatch({ type: 'SET_PAGE', payload: 'Home' })}
            className="text-sm font-medium text-primary hover:text-secondary flex items-center"
          >
            <Icon path="M10 19l-7-7m0 0l7-7m-7 7h18" className="w-4 h-4 mr-2" />
            Back to Home
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{name}</h1>
            <div className="flex items-center mb-4 space-x-4">
              <StarRating rating={rating} />
              <span className="ml-2 text-sm text-gray-600">({rating} rating)</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-600">{location}</span>
            </div>
            <p className="text-gray-600 text-base mb-6">{description}</p>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Certifications</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                {certifications.length > 0 ? certifications.map((cert, i) => (
                  <li key={i}>{cert}</li>
                )) : <li>No certifications available</li>}
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Products</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                {products.length > 0 ? products.map((product, i) => (
                  <li key={i}>{product.name}</li>
                )) : <li>No products available</li>}
              </ul>
            </div>
          </div>
        </div>

        <h2 className="text-3xl font-bold mb-6">Vendor Products</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img src={product.img} alt={product.name} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h2 className="text-lg font-semibold">{product.name}</h2>
                <p className="text-sm text-gray-600">{product.desc}</p>
                <p className="text-secondary font-bold mt-2">{product.price}</p>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex justify-center items-center space-x-2">
            <Button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2"
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`px-4 py-2 text-sm font-medium rounded-md border ${currentPage === number
                    ? 'bg-secondary text-white border-secondary'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                  }`}
              >
                {number}
              </button>
            ))}
            <Button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
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