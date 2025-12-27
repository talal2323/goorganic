'use client'

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { DashboardCard, Button, Icon } from '@/components/common/UIComponents';
import { getMyProducts, createProduct, updateProduct, deleteProduct } from '@/utils/productApi';
import { getCategories } from '@/utils/categoryApi';
import { uploadProductImage } from '@/utils/uploadApi';
import { showToast } from '@/utils/toast';

const VendorProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        images: []
    });
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [uploading, setUploading] = useState(false);

    // Reset to page 1 when search keyword changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchKeyword]);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [searchKeyword, currentPage]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await getMyProducts();
            // Filter by search keyword on client side since API might not support it
            let filteredProducts = data.products || [];
            if (searchKeyword) {
                filteredProducts = filteredProducts.filter(p =>
                    p.name.toLowerCase().includes(searchKeyword.toLowerCase())
                );
            }
            setProducts(filteredProducts);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            showToast.error(error.response?.data?.message || 'Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await getCategories();
            // Categories API returns array directly, not nested in object
            setCategories(Array.isArray(data) ? data : (data.categories || []));
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            // Append new files to existing ones instead of replacing
            setImageFiles(prev => [...prev, ...files]);

            const previews = [];
            files.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    previews.push(reader.result);
                    if (previews.length === files.length) {
                        // Append new previews to existing ones
                        setImagePreviews(prev => [...prev, ...previews]);
                    }
                };
                reader.readAsDataURL(file);
            });
        }

        // Reset the input value so the same file can be selected again if needed
        e.target.value = '';
    };

    const handleRemoveImage = (index) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const uploadImages = async () => {
        if (!imageFiles || imageFiles.length === 0) return [];

        try {
            setUploading(true);
            const uploadedImages = [];

            for (const file of imageFiles) {
                // Check file size (10MB limit)
                const maxSize = 10 * 1024 * 1024; // 10MB in bytes
                if (file.size > maxSize) {
                    showToast.error(`File "${file.name}" is larger than 10MB. Please compress it.`);
                    continue; // Skip this file
                }

                const formData = new FormData();
                formData.append('image', file);

                const data = await uploadProductImage(formData);

                uploadedImages.push({ public_id: data.public_id, url: data.url });
            }

            return uploadedImages;
        } catch (error) {
            showToast.error('Failed to upload images');
            throw error;
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            // Upload images if new ones selected, otherwise use existing
            let imagesData = formData.images;
            if (imageFiles.length > 0) {
                imagesData = await uploadImages();
            }

            const productData = {
                name: formData.name,
                description: formData.description,
                price: Number(formData.price),
                category: formData.category,
                stock: Number(formData.stock),
                images: imagesData
            };

            if (editingProduct) {
                // Update existing product
                await updateProduct(editingProduct._id, productData);
                showToast.success('Product updated successfully');
            } else {
                // Create new product
                await createProduct(productData);
                showToast.success('Product created successfully');
            }

            resetForm();
            fetchProducts();
        } catch (error) {
            showToast.error(error.response?.data?.message || 'Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category?._id || product.category,
            stock: product.stock,
            images: product.images || []
        });
        setImageFiles([]);
        setImagePreviews(product.images?.map(img => img.url) || []);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            await deleteProduct(id);
            showToast.success('Product deleted successfully');
            fetchProducts();
        } catch (error) {
            showToast.error(error.response?.data?.message || 'Failed to delete product');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            category: '',
            stock: '',
            images: []
        });
        setImageFiles([]);
        setImagePreviews([]);
        setEditingProduct(null);
        setShowModal(false);
    };

    const statusColors = {
        Active: 'bg-green-100 text-green-800',
        Unlisted: 'bg-gray-100 text-gray-800',
        'Out of Stock': 'bg-red-100 text-red-800',
        'Pending Review': 'bg-yellow-100 text-yellow-800',
    }

    return (
        <DashboardLayout title="Product Listings" userRole="vendor">
            <DashboardCard title="Products" className="!p-0 overflow-hidden">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b border-gray-200 gap-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
                        <h3 className="text-xl font-semibold text-gray-800">My Products ({products.length})</h3>
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
                        />
                    </div>
                    <Button className="text-sm px-4 py-2" onClick={() => setShowModal(true)}>
                        <Icon path="M12 4v16m8-8H4" className="w-4 h-4 mr-1" color="white" />
                        Add Product
                    </Button>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading products...</div>
                ) : products.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No products found. Click "Add Product" to create your first product.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {['Image', 'Name', 'Category', 'Stock', 'Price', 'Status', 'Actions'].map(header => (
                                        <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {products.map(product => (
                                    <tr key={product._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <img
                                                src={product.images?.[0]?.url || 'https://placehold.co/40x40/E9F5E9/164A26?text=No+Img'}
                                                alt={product.name}
                                                className="h-10 w-10 rounded-md object-cover"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            <div className="max-w-xs truncate">{product.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {product.category?.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex items-center">
                                                <span className={product.stock <= 3 ? 'text-orange-600 font-semibold' : 'text-gray-500'}>
                                                    {product.stock}
                                                </span>
                                                {product.stock > 0 && product.stock <= 3 && (
                                                    <Icon path="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" className="w-4 h-4 ml-2 text-orange-600" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            Rs. {product.price}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[product.status] || 'bg-gray-100 text-gray-800'}`}>
                                                    {product.status || 'Active'}
                                                </span>
                                                {product.status === 'Unlisted' && product.unlistReason && (
                                                    <button
                                                        onClick={() => alert(`Unlisting Reason:\n\n${product.unlistReason}\n\nTo request reactivation, please contact support or email goorganic.co.pk@gmail.com with your product ID and details of changes made.`)}
                                                        className="mt-1 text-xs text-blue-600 hover:text-blue-800 underline text-left"
                                                    >
                                                        View Reason
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-900 mr-3">
                                                Edit
                                            </button>
                                            <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:text-red-900">
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="mt-6 flex justify-center items-center space-x-2">
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
            </DashboardCard>

            {/* Add/Edit Product Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-gray-900">
                                {editingProduct ? 'Edit Product' : 'Add New Product'}
                            </h3>
                            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                                <Icon path="M6 18L18 6M6 6l12 12" className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
                                    placeholder="e.g., Organic Almond Butter"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                                <textarea
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
                                    placeholder="Describe your product..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs.) *</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                                <select
                                    required
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
                                >
                                    <option value="">Select a category</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Images (Select multiple)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
                                />
                                {imagePreviews.length > 0 && (
                                    <div className="mt-2 grid grid-cols-4 gap-2">
                                        {imagePreviews.map((preview, index) => (
                                            <div key={index} className="relative">
                                                <img src={preview} alt={`Preview ${index + 1}`} className="h-24 w-24 object-cover rounded-lg" />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage(index)}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button
                                    type="button"
                                    onClick={resetForm}
                                    className="bg-gray-200 text-gray-800 hover:bg-gray-300"
                                    primary={false}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading || uploading}
                                >
                                    {uploading ? 'Uploading...' : loading ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default VendorProducts;

