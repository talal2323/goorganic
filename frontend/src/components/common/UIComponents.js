'use client'

import React, { useState } from 'react';
import Image from 'next/image';
import { useAppContext } from '@/context/AppContext';
// Assuming COLORS is in a config file. If not, we can hardcode them.
// import { COLORS } from '@/utils/config';
const COLORS = {
  primary: '#164A26',
  secondary: '#4CAF50',
};

export const Icon = ({ path, className = "w-5 h-5", color = 'currentColor' }) => (
  <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={path}></path>
  </svg>
);

// --- THIS IS THE MISSING COMPONENT ---
export const VerificationBadge = () => (
  <div className="relative group flex items-center">
    <Icon path="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.192-2.058-.573-3.016z" className="w-5 h-5 text-green-600" color="currentColor" />
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      Verified
    </div>
  </div>
);
// ----------------------------------------

export const Logo = ({ className = 'text-2xl', color = COLORS.primary, src, alt = 'GOorganic', onClick }) => {
  const [imgFailed, setImgFailed] = useState(false);

  if (src && !imgFailed) {
    return (
      <div className={`relative ${className}`} onClick={onClick} style={{ cursor: onClick ? 'pointer' : undefined }}>
        <Image
          src={src}
          alt={alt}
          width={150}
          height={50}
          className="w-full h-full object-contain"
          onError={() => setImgFailed(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`font-bold ${className}`}
      style={{ color }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      GO<span style={{ color: COLORS.secondary }}>organic</span>
    </div>
  );
};


export const Button = ({ children, onClick, primary = true, className = '', disabled = false, type = 'button' }) => {
  const darkGreen = '#175017'; // Using the hardcoded color from your example
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        px-6 py-2 font-semibold text-sm rounded-lg shadow-md transition duration-200 
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
        flex items-center justify-center
        ${primary
          ? 'text-white hover:bg-opacity-90'
          : 'text-primary bg-transparent border border-primary hover:bg-primary hover:text-white'
        }
        ${className}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      style={primary ? { backgroundColor: darkGreen } : {}}
    >
      {children}
    </button>
  );
};

export const DashboardCard = ({ title, children, className = 'p-6' }) => (
  <div className={`bg-white rounded-xl shadow-lg ${className}`}>
    {title && <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">{title}</h3>}
    {children}
  </div>
);

// --- ADDING STAR RATING (from previous error) ---
export const StarRating = ({ rating }) => (
  <div className="flex items-center text-yellow-500">
    {[...Array(5)].map((_, i) => (
      <Icon
        key={i}
        path="M11.049 2.222a.75.75 0 00-.707 0l-5.385 2.146a.75.75 0 00-.401.678v11.754a.75.75 0 00.401.678l5.385 2.146a.75.75 0 00.707 0l5.385-2.146a.75.75 0 00.401-.678V5.046a.75.75 0 00-.401-.678l-5.385-2.146z"
        className="w-4 h-4 fill-current"
        color={i < Math.round(rating) ? 'currentColor' : 'gray'} // Use gray for unfilled
      />
    ))}
  </div>
);

// --- ADDING PRODUCT CARD (from compiler hint) ---
export const ProductCard = ({ product }) => {
  const router = useRouter();
  const { dispatch } = useAppContext();

  const handleProductClick = () => {
    dispatch({ type: 'SET_SELECTED_PRODUCT', payload: product });
    router.push(`/products/${product.id}`);
  };

  return (
    <div
      className="bg-white rounded-xl shadow-lg overflow-hidden transition-shadow hover:shadow-xl hover:scale-[1.02] duration-300 cursor-pointer"
      onClick={handleProductClick}
    >
      <div className="relative w-full h-48">
        <Image
          src={product.img || 'https://placehold.co/300x200/E9F5E9/164A26?text=Product'}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
        <p className="text-sm text-gray-500 mb-2">{product.vendor}</p>
        <div className="flex justify-between items-center">
          <p className="text-green-700 font-bold text-xl">Rs. {product.price}</p>
          <Button
            className="text-xs px-3 py-1"
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click
              dispatch({ type: 'ADD_TO_CART', payload: product });
            }}
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

// Add a reusable Input component
export const Input = ({ id, type = 'text', value, onChange, placeholder, required = false, className = '' }) => (
  <input
    id={id}
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    required={required}
    className={`w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${className}`}
  />
);

