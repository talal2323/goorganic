'use client'

import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Icon, Button } from '@/components/common/UIComponents';

const mockProducts = [
    { id: 1, name: 'Fresh farm-grown spinach', desc: 'Fresh leafy greens from certified organic farms', price: 'Rs. 120 / kg', category: 'Vegetables', img: 'https://placehold.co/200x200/175017/FFFFFF?text=Spinach', vendor: 'Green Valley Farms', vendorId: 'gvf1', rating: 4.5, longDesc: 'Our spinach is grown using 100% organic methods, free from pesticides and chemical fertilizers. Harvested daily for maximum freshness.' },
    { id: 2, name: 'Organic Honey', desc: 'Pure honey from pristine forests', price: 'Rs. 950 / 500g', category: 'Honey & Preserves', img: 'https://placehold.co/200x200/175017/FFFFFF?text=Honey', vendor: 'PureHarvest Naturals', vendorId: 'phn1', rating: 4.8, longDesc: 'A rich, aromatic honey sourced from wild beehives in the Himalayan foothills. It is unprocessed and retains all its natural enzymes.' },
    { id: 3, name: 'Organic Red Lentil', desc: 'Chemical-free pulses sourced directly from farms', price: 'Rs. 390 / kg', category: 'Pulses', img: 'https://placehold.co/200x200/175017/FFFFFF?text=Lentil', vendor: 'FarmFresh Pulses', vendorId: 'ffp1', rating: 4.6, longDesc: 'Our red lentils are unpolished and full of nutrients. They cook quickly and are perfect for healthy, wholesome meals.' },
    { id: 4, name: 'Brown Rice', desc: 'Unpolished brown rice from organic fields', price: 'Rs. 85 / kg', category: 'Rice & Grains', img: 'https://placehold.co/200x200/175017/FFFFFF?text=Rice', vendor: 'Green Valley Farms', vendorId: 'gvf1', rating: 4.3, longDesc: 'Healthy, fiber-rich unpolished brown rice. A great alternative to white rice for a balanced diet.' },
    { id: 5, name: 'Fresh Carrots', desc: 'Naturally grown carrots from local farms', price: 'Rs. 60 / kg', category: 'Vegetables', img: 'https://placehold.co/200x200/175017/FFFFFF?text=Carrots', vendor: 'Green Valley Farms', vendorId: 'gvf1', rating: 4.7, longDesc: 'Sweet, crunchy, and packed with vitamins. These organic carrots are perfect for salads, juices, or cooking.' },
    { id: 6, name: 'Organic Tea', desc: 'Pure and natural tea leaves', price: 'Rs. 250 / 100g', category: 'Beverages', img: 'https://placehold.co/200x200/175017/FFFFFF?text=Tea', vendor: 'PureHarvest Naturals', vendorId: 'phn1', rating: 4.9, longDesc: 'Hand-picked tea leaves from organic estates. This tea offers a refreshing aroma and a smooth, delicate flavor.' },
    { id: 7, name: 'Organic Almonds', desc: 'Premium quality organic almonds', price: 'Rs. 1800 / kg', category: 'Pulses', img: 'https://placehold.co/200x200/175017/FFFFFF?text=Almonds', vendor: 'FarmFresh Pulses', vendorId: 'ffp1', rating: 4.7, longDesc: 'Crisp, nutritious organic almonds, perfect for a healthy snack or as an ingredient in your favorite dishes.' },
    { id: 8, name: 'Fresh Broccoli', desc: 'Crisp organic broccoli heads', price: 'Rs. 150 / pc', category: 'Vegetables', img: 'https://placehold.co/200x200/175017/FFFFFF?text=Broccoli', vendor: 'Green Valley Farms', vendorId: 'gvf1', rating: 4.6, longDesc: 'Vibrant green and packed with nutrients, our organic broccoli is a must-have for any healthy kitchen.' },
    { id: 9, name: 'Organic Turmeric', desc: 'High-curcumin organic turmeric powder', price: 'Rs. 100 / 100g', category: 'Honey & Preserves', img: 'https://placehold.co/200x200/175017/FFFFFF?text=Turmeric', vendor: 'PureHarvest Naturals', vendorId: 'phn1', rating: 4.8, longDesc: 'Ground from the best organic turmeric roots, this powder has a high curcumin content, a vibrant color, and a potent flavor.' },
    { id: 10, name: 'Organic Apples', desc: 'Sweet, crunchy organic apples', price: 'Rs. 300 / kg', category: 'Fruits', img: 'https://placehold.co/200x200/175017/FFFFFF?text=Apples', vendor: 'Green Valley Farms', vendorId: 'gvf1', rating: 4.7, longDesc: 'Juicy and sweet organic apples, sourced from the best orchards. Perfect for a healthy snack.' },
    { id: 11, name: 'Quinoa', desc: 'Organic white quinoa grains', price: 'Rs. 450 / 500g', category: 'Rice & Grains', img: 'https://placehold.co/200x200/175017/FFFFFF?text=Quinoa', vendor: 'FarmFresh Pulses', vendorId: 'ffp1', rating: 4.6, longDesc: 'A complete protein, our organic quinoa is light, fluffy, and easy to cook. A perfect base for salads and meals.' },
];

const categories = [
    'All', 'Vegetables', 'Fruits', 'Rice & Grains', 'Pulses', 'Honey & Preserves', 'Beverages'
];

const ShopPage = () => {
    const { dispatch } = useAppContext();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 10;

    const filteredProducts = mockProducts.filter(product => {
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.desc.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleProductClick = (product) => {
        dispatch({ type: 'SET_SELECTED_PRODUCT', payload: product });
        dispatch({ type: 'SET_PAGE', payload: 'ProductDetail' });
    };

    const handleAddToCart = (e, product) => {
        e.stopPropagation();
        dispatch({ type: 'ADD_TO_CART', payload: { ...product, qty: 1 } });
        dispatch({ type: 'SET_CART_OPEN', payload: true });
    };

    return (
        <div className="bg-gray-50">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0">
                    <div className="relative w-full md:w-72">
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-secondary focus:border-transparent"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentProducts.map((product) => (
                        <div
                            key={product.id}
                            className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-lg"
                        >
                            <img
                                src={product.img}
                                alt={product.name}
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-4">
                                <button
                                    onClick={() => handleProductClick(product)}
                                    className="text-left text-lg font-semibold text-gray-800 hover:underline"
                                >
                                    {product.name}
                                </button>
                                <p className="text-sm text-gray-600 mt-1 truncate">{product.desc}</p>
                                <div className="text-sm text-gray-500 mt-2">
                                    Sold by: <span
                                        className="text-green-700 font-medium cursor-pointer hover:underline"
                                        onClick={() => {
                                            const vendor = {
                                                id: product.vendorId,
                                                name: product.vendor,
                                            };
                                            dispatch({ type: 'SELECT_VENDOR', payload: vendor });
                                            dispatch({ type: 'SET_PAGE', payload: 'VendorDetail' });
                                        }}
                                    >
                                        {product.vendor}
                                    </span>
                                </div>
                                <p className="text-secondary font-bold mt-2">{product.price}</p>
                                <Button
                                    onClick={(e) => handleAddToCart(e, product)}
                                    className="w-full mt-4"
                                >
                                    Add to Cart
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {totalPages > 1 && (
                    <div className="mt-12 flex justify-center items-center space-x-2">
                        <Button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            primary={false}
                            className="px-4 py-2"
                        >
                            Previous
                        </Button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
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
