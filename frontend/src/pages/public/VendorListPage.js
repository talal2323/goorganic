'use client'

import React, { useState } from 'react'; // Import useState
import { useAppContext } from '@/context/AppContext';
// import { Header } from '@/components/layouts/Header'; // <-- REMOVED
// import Footer from '@/components/layouts/Footer'; // <-- REMOVED
import { Button, VerificationBadge } from '@/components/common/UIComponents';

// --- UPDATED: Expanded list for pagination ---
const vendorsList = [
  {
    id: 'gvf1',
    name: "Green Valley Farms",
    rating: 4.5,
    location: "Lahore, Punjab",
    description: "Certified organic farm specializing in fresh vegetables, fruits, and herbs.",
    coverImage: "https://picsum.photos/seed/gvf-cover/800/200",
    profileImage: "https://picsum.photos/seed/gvf-profile/150/150",
  },
  {
    id: 'phn1',
    name: "PureHarvest Naturals",
    rating: 4.8,
    location: "Islamabad, ICT",
    description: "Specializing in organic honey and herbal teas sourced from local farms.",
    coverImage: "https://picsum.photos/seed/phn-cover/800/200",
    profileImage: "https://picsum.photos/seed/phn-profile/150/150",
  },
  {
    id: 'ffp1',
    name: "FarmFresh Pulses",
    rating: 4.6,
    location: "Karachi, Sindh",
    description: "Direct from farm to table - organic pulses, grains, and cereals.",
    coverImage: "https://picsum.photos/seed/ffp-cover/800/200",
    profileImage: "https://picsum.photos/seed/ffp-profile/150/150",
  },
  {
    id: 'gvf2',
    name: "Organic Roots",
    rating: 4.7,
    location: "Rawalpindi, Punjab",
    description: "Family-owned farm providing seasonal organic vegetables.",
    coverImage: "https://picsum.photos/seed/gvf2-cover/800/200",
    profileImage: "https://picsum.photos/seed/gvf2-profile/150/150",
  },
  {
    id: 'phn2',
    name: "Himalayan Essence",
    rating: 4.9,
    location: "Peshawar, Khyber Pakhtunkhwa",
    description: "Pure herbal extracts and essential oils from the Himalayas.",
    coverImage: "https://picsum.photos/seed/phn2-cover/800/200",
    profileImage: "https://picsum.photos/seed/phn2-profile/150/150",
  },
  {
    id: 'ffp2',
    name: "Golden Grains",
    rating: 4.5,
    location: "Quetta, Balochistan",
    description: "Premium quality organic grains and stone-ground flours.",
    coverImage: "https://picsum.photos/seed/ffp2-cover/800/200",
    profileImage: "https://picsum.photos/seed/ffp2-profile/150/150",
  },
  {
    id: 'gvf3',
    name: "Coastal Organics",
    rating: 4.3,
    location: "Multan, Punjab",
    description: "Specializing in organic spices and coconut products.",
    coverImage: "https://picsum.photos/seed/gvf3-cover/800/200",
    profileImage: "https://picsum.photos/seed/gvf3-profile/150/150",
  },
  {
    id: 'phn3',
    name: "Nature's Nectar",
    rating: 4.6,
    location: "Faisalabad, Punjab",
    description: "Artisanal organic honey and natural wellness products.",
    coverImage: "https://picsum.photos/seed/phn3-cover/800/200",
    profileImage: "https://picsum.photos/seed/phn3-profile/150/150",
  },
  {
    id: 'ffp3',
    name: "Punjab Fields",
    rating: 4.8,
    location: "Sialkot, Punjab",
    description: "Authentic organic wheat, basmati rice, and traditional grains.",
    coverImage: "https://picsum.photos/seed/ffp3-cover/800/200",
    profileImage: "https://picsum.photos/seed/ffp3-profile/150/150",
  }
];

const VendorListPage = () => {
  const { dispatch } = useAppContext();
  const [currentPage, setCurrentPage] = useState(1);
  const vendorsPerPage = 6;

  // --- ADDED: Pagination Logic ---
  const indexOfLastVendor = currentPage * vendorsPerPage;
  const indexOfFirstVendor = indexOfLastVendor - vendorsPerPage;
  const currentVendors = vendorsList.slice(indexOfFirstVendor, indexOfLastVendor);
  const totalPages = Math.ceil(vendorsList.length / vendorsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleVendorClick = (vendor) => {
    // Set the selected vendor in global state and navigate to detail page
    dispatch({ type: 'SELECT_VENDOR', payload: vendor });
    dispatch({ type: 'SET_PAGE', payload: 'VendorDetail' });
  };

  return (
    // <div className="bg-gray-50 min-h-screen"> // <-- Container div removed, as Layout provides it
    //  <Header /> // <-- REMOVED

    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900">Our Verified Vendors</h1>
        <p className="mt-4 text-lg text-gray-600">
          Discover our network of certified organic vendors, each thoroughly verified.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* --- UPDATED: Map over currentVendors --- */}
        {currentVendors.map((vendor) => (
          <div key={vendor.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="relative h-48">
              <img src={vendor.coverImage} alt={vendor.name} className="w-full h-full object-cover" />
              <img src={vendor.profileImage} alt={vendor.name} className="absolute -bottom-10 left-6 w-20 h-20 rounded-full border-4 border-white shadow-md" />
            </div>

            <div className="p-6 pt-12">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3
                      className="text-xl font-semibold text-gray-900 cursor-pointer hover:underline"
                      onClick={() => handleVendorClick(vendor)}
                    >
                      {vendor.name}
                    </h3>
                    <VerificationBadge />
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{vendor.location}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-600 line-clamp-2">{vendor.description}</p>
              <div className="mt-6">
                <Button onClick={() => handleVendorClick(vendor)} className="w-full">
                  View Products
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- ADDED: Pagination UI --- */}
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center items-center space-x-2">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-50 disabled:opacity-50 border border-gray-300"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
            <button
              key={number}
              onClick={() => paginate(number)}
              className={`px-4 py-2 text-sm font-medium rounded-md border ${currentPage === number ? 'bg-green-700 text-white border-green-700' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'}`}
            >
              {number}
            </button>
          ))}
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-50 disabled:opacity-50 border border-gray-300"
          >
            Next
          </button>
        </div>
      )}
    </main>

    //  <Footer /> // <-- REMOVED
    // </div> // <-- Container div removed
  );
};

export default VendorListPage;
