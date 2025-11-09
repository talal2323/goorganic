import React from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { DashboardCard, Button, Icon } from '@/components/common/UIComponents';

const VendorProducts = () => {
    const products = [
        { id: 1, name: 'Organic Spinach', category: 'Vegetable', stock: '20 KG', price: '120 / KG', img: 'https://placehold.co/40x40/E9F5E9/164A26?text=S', status: 'Active' },
        { id: 2, name: 'Cow Milk', category: 'Dairy', stock: '10 L', price: '280 / L', img: 'https://placehold.co/40x40/E9F5E9/164A26?text=M', status: 'Out of Stock' },
        { id: 3, name: 'Almond Oil', category: 'Oil', stock: '5 L', price: '1,900 / L', img: 'https://placehold.co/40x40/E9F5E9/164A26?text=O', status: 'Pending Review' },
    ];

    const statusColors = {
        Active: 'bg-green-100 text-green-800',
        'Out of Stock': 'bg-red-100 text-red-800',
        'Pending Review': 'bg-yellow-100 text-yellow-800',
    }

    return (
        <DashboardLayout title="Product Listings" userRole="vendor">
            <DashboardCard title="Products" className="!p-0 overflow-hidden">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2 sm:mb-0">My Products ({products.length})</h3>
                    <Button className="text-sm px-4 py-2" onClick={() => console.log('Opening Add Product Modal')}>
                        <Icon path="M12 4v16m8-8H4" className="w-4 h-4 mr-1" color="white" />
                        Add Product
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {['ID', 'Name', 'Category', 'Stock', 'Price', 'Image', 'Status', 'Actions'].map(header => (
                                    <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {products.map(product => (
                                <tr key={product.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rs. {product.price}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <img src={product.img} alt={product.name} className="h-10 w-10 rounded-md object-cover" />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[product.status]}`}>
                                            {product.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button type="button" className="text-primary hover:text-secondary mr-2" onClick={(e) => { e.preventDefault(); console.log(`Editing Product ${product.id}`); }}>Edit</button>
                                        <button type="button" className="text-red-600 hover:text-red-900" onClick={(e) => { e.preventDefault(); console.log(`Deleting Product ${product.id}`); }}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </DashboardCard>
        </DashboardLayout>
    );
};

export default VendorProducts;
