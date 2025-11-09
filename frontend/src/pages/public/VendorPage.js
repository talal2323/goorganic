import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Button, Icon, StarRating } from '../../components/common/UIComponents';

const VendorPage = () => {
  const { dispatch } = useAppContext();
  const [selectedCategory, setSelectedCategory] = React.useState('All');

  // Mock vendor data
  const vendor = {
    name: "Green Valley Farms",
    rating: 4.5,
    totalReviews: 128,
    since: "2023",
    location: "Karachi, Sindh",
    description: "We are a certified organic farm specializing in fresh vegetables, fruits, and herbs. Our farming practices are sustainable and eco-friendly, ensuring the highest quality produce for our customers.",
    certifications: ["Organic Certified", "ISO 9001:2015", "FSSAI Certified"],
    coverImage: "https://placehold.co/1200x300/DBE9DB/175017?text=Green+Valley+Farms",
    profileImage: "https://placehold.co/150x150/175017/FFFFFF?text=GVF"
  };

  const categories = ['All', 'Vegetables', 'Fruits', 'Herbs', 'Seasonal'];

  const products = [
    {
      id: 1,
      name: "Organic Spinach",
      category: "Vegetables",
      price: "Rs. 60/bunch",
      description: "Fresh, locally grown organic spinach",
      image: "https://placehold.co/200x200/175017/FFFFFF?text=Spinach"
    },
    {
      id: 2,
      name: "Fresh Tomatoes",
      category: "Vegetables",
      price: "Rs. 80/kg",
      description: "Naturally ripened organic tomatoes",
      image: "https://placehold.co/200x200/175017/FFFFFF?text=Tomatoes"
    },
    {
      id: 3,
      name: "Organic Mangoes",
      category: "Fruits",
      price: "Rs. 200/kg",
      description: "Sweet and juicy Alphonso mangoes",
      image: "https://placehold.co/200x200/175017/FFFFFF?text=Mangoes"
    },
    {
      id: 4,
      name: "Fresh Mint",
      category: "Herbs",
      price: "Rs. 30/bunch",
      description: "Aromatic mint leaves",
      image: "https://placehold.co/200x200/175017/FFFFFF?text=Mint"
    }
  ];

  const filteredProducts = products.filter(product =>
    selectedCategory === 'All' || product.category === selectedCategory
  );

  return (
    <div className="bg-gray-50">
      <main>
        {/* Vendor Cover Image */}
        <div className="relative h-[300px] w-full">
          <img
            src={vendor.coverImage}
            alt={vendor.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Vendor Profile Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-20 pb-20">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0">
                {/* Profile Image */}
                <div className="flex-shrink-0">
                  <img
                    src={vendor.profileImage}
                    alt={vendor.name}
                    className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                  />
                </div>

                {/* Vendor Info */}
                <div className="md:ml-6 flex-grow">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">{vendor.name}</h1>
                      <div className="flex items-center mt-1">
                        <StarRating rating={vendor.rating} />
                        <span className="ml-2 text-sm text-gray-600">
                          ({vendor.totalReviews} reviews)
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={() => dispatch({ type: 'SET_PAGE', payload: 'Chat' })}
                      className="mt-4 md:mt-0"
                    >
                      <div className="flex items-center">
                        <Icon path="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" className="w-5 h-5 mr-2" />
                        Chat with Vendor
                      </div>
                    </Button>
                  </div>

                  {/* Additional Info */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Location</span>
                      <p className="font-medium">{vendor.location}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Member Since</span>
                      <p className="font-medium">{vendor.since}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Certifications</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {vendor.certifications.map((cert, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800"
                          >
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vendor Description */}
              <div className="mt-6 border-t pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">About Us</h2>
                <p className="text-gray-600">{vendor.description}</p>
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="mb-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Products</h2>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-8">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full transition-colors ${selectedCategory === category
                      ? 'bg-[#175017] text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                    <p className="text-[#175017] font-bold mt-2">{product.price}</p>
                    <Button className="w-full mt-3">Add to Cart</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VendorPage;