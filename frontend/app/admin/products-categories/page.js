'use client'

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { DashboardCard, Button, Icon } from '@/components/common/UIComponents';
import { getAllProductsAdmin, updateProductStatus } from '@/utils/productApi';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/utils/categoryApi';
import { showToast } from '@/utils/toast';

const AdminProductsCategories = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('products'); // 'products' | 'categories'

    // Search state
    const [searchKeyword, setSearchKeyword] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Category modal state
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryName, setCategoryName] = useState('');

    // Unlist reason modal state
    const [showUnlistModal, setShowUnlistModal] = useState(false);
    const [unlistingProductId, setUnlistingProductId] = useState(null);
    const [unlistReason] = useState('');

    // Reset to page 1 when search keyword changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchKeyword]);

    // Fetch data when page or search changes
    useEffect(() => {
        fetchData();
    }, [currentPage, searchKeyword]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [productsData, categoriesData] = await Promise.all([
                getAllProductsAdmin(currentPage, searchKeyword),
                getCategories()
            ]);
            setProducts(productsData.products || []);
            setTotalPages(productsData.totalPages || 1);
            // Categories API returns array directly, not { categories: [] }
            setCategories(Array.isArray(categoriesData) ? categoriesData : (categoriesData.categories || []));
        } catch (error) {
            showToast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    // Product Management
    const handleStatusChange = (productId, newStatus) => {
        if (newStatus === 'Unlisted') {
            // Open modal to ask for reason
            setUnlistingProductId(productId);
            setShowUnlistModal(true);
        } else {
            // Directly update status for Active
            handleUpdateProductStatus(productId, newStatus);
        }
    };

    const handleUpdateProductStatus = async (productId, newStatus, reason = '') => {
        try {
            await updateProductStatus(productId, newStatus, reason);
            showToast.success('Product status updated');
            fetchData();
        } catch (error) {
            showToast.error(error.response?.data?.message || 'Failed to update product status');
        }
    };

    const handleUnlistSubmit = async (e) => {
        e.preventDefault();
        if (!unlistReason.trim()) {
            showToast.error('Please provide a reason for unlisting');
            return;
        }

        await handleUpdateProductStatus(unlistingProductId, 'Unlisted', unlistReason);
        setShowUnlistModal(false);
        setUnlistingProductId(null);
        setUnlistReason('');
    };

    // Category Management
    const handleCategorySubmit = async (e) => {
        e.preventDefault();

        if (!categoryName.trim()) {
            showToast.error('Category name is required');
            return;
        }

        try {
            setLoading(true);
            if (editingCategory) {
                await updateCategory(editingCategory._id, { name: categoryName });
                showToast.success('Category updated successfully');
            } else {
                await createCategory({ name: categoryName });
                showToast.success('Category created successfully');
            }

            resetCategoryForm();
            await fetchData(); // Wait for data to be fetched
        } catch (error) {
            showToast.error(error.response?.data?.message || 'Failed to save category');
            setLoading(false);
        }
    };

    const handleEditCategory = (category) => {
        setEditingCategory(category);
        setCategoryName(category.name);
        setShowCategoryModal(true);
    };

    const handleDeleteCategory = async (id) => {
        if (!confirm('Are you sure you want to delete this category?')) return;

        try {
            setLoading(true);
            await deleteCategory(id);
            showToast.success('Category deleted successfully');
            await fetchData(); // Wait for data to be refetched
        } catch (error) {
            showToast.error(error.response?.data?.message || 'Failed to delete category');
            setLoading(false);
        }
    };

    const resetCategoryForm = () => {
        setCategoryName('');
        setEditingCategory(null);
        setShowCategoryModal(false);
    };

    const statusColors = {
        Active: 'bg-green-100 text-green-800',
        Unlisted: 'bg-gray-100 text-gray-800',
    };

    return (
        <DashboardLayout title="Products & Categories" userRole="admin">
            {/* Tab Navigation */}
            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'products'
                            ? 'border-secondary text-secondary'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Products ({products.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('categories')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'categories'
                            ? 'border-secondary text-secondary'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Categories ({categories.length})
                    </button>
                </nav>
            </div>

            {/* Products Tab */}
            {activeTab === 'products' && (
                <DashboardCard title="All Products" className="!p-0 overflow-hidden">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b border-gray-200 gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Product Management</h3>
                            <p className="text-sm text-gray-500 mt-1">Manage product status and listings</p>
                        </div>
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary w-full sm:w-64"
                        />
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading products...</div>
                    ) : products.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No products found</div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {products.map(product => (
                                            <tr key={product._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <img
                                                            src={product.images?.[0]?.url || 'https://placehold.co/40x40/E9F5E9/164A26?text=No+Img'}
                                                            alt={product.name}
                                                            className="h-10 w-10 rounded object-cover mr-3"
                                                        />
                                                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                                                            {product.name}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {product.vendor?.name || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {product.category?.name || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    Rs. {product.price}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {product.stock}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[product.status] || 'bg-gray-100 text-gray-800'}`}>
                                                        {product.status || 'Active'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <select
                                                        value={product.status || 'Active'}
                                                        onChange={(e) => handleStatusChange(product._id, e.target.value)}
                                                        className="text-sm border border-gray-300 rounded px-2 py-1"
                                                    >
                                                        <option value="Active">Active</option>
                                                        <option value="Unlisted">Unlisted</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {products.length > 0 && (
                                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        Page {currentPage} of {totalPages}
                                    </div>
                                    {totalPages > 1 && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                disabled={currentPage === 1}
                                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Previous
                                            </button>

                                            {/* Page numbers */}
                                            <div className="flex gap-1">
                                                {[...Array(totalPages)].map((_, idx) => {
                                                    const pageNum = idx + 1;
                                                    // Show first page, last page, current page, and pages around current
                                                    if (
                                                        pageNum === 1 ||
                                                        pageNum === totalPages ||
                                                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                                    ) {
                                                        return (
                                                            <button
                                                                key={pageNum}
                                                                onClick={() => setCurrentPage(pageNum)}
                                                                className={`px-4 py-2 text-sm font-medium rounded-lg ${currentPage === pageNum
                                                                    ? 'bg-secondary text-white'
                                                                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                                                    }`}
                                                            >
                                                                {pageNum}
                                                            </button>
                                                        );
                                                    } else if (
                                                        pageNum === currentPage - 2 ||
                                                        pageNum === currentPage + 2
                                                    ) {
                                                        return <span key={pageNum} className="px-2 py-2 text-gray-500">...</span>;
                                                    }
                                                    return null;
                                                })}
                                            </div>

                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                disabled={currentPage === totalPages}
                                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </DashboardCard>
            )}

            {/* Categories Tab */}
            {activeTab === 'categories' && (
                <DashboardCard title="Categories" className="!p-0 overflow-hidden">
                    <div className="flex justify-between items-center p-4 border-b border-gray-200">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Category Management</h3>
                            <p className="text-sm text-gray-500 mt-1">Manage product categories</p>
                        </div>
                        <Button className="text-sm px-4 py-2" onClick={() => setShowCategoryModal(true)}>
                            <Icon path="M12 4v16m8-8H4" className="w-4 h-4 mr-1" color="white" />
                            Add Category
                        </Button>
                    </div>

                    {categories.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No categories found</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {categories.map(category => (
                                        <tr key={category._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{category.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">
                                                    {new Date(category.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleEditCategory(category)}
                                                    className="text-blue-600 hover:text-blue-900 mr-4"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCategory(category._id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </DashboardCard>
            )}

            {/* Category Modal */}
            {showCategoryModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-gray-900">
                                {editingCategory ? 'Edit Category' : 'Add New Category'}
                            </h3>
                            <button onClick={resetCategoryForm} className="text-gray-400 hover:text-gray-600">
                                <Icon path="M6 18L18 6M6 6l12 12" className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCategorySubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={categoryName}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
                                    placeholder="e.g., Dairy & Eggs"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button
                                    type="button"
                                    onClick={resetCategoryForm}
                                    className="bg-gray-200 text-gray-800 hover:bg-gray-300"
                                    primary={false}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {editingCategory ? 'Update Category' : 'Create Category'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Unlist Reason Modal */}
            {showUnlistModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-900">Unlist Product</h3>
                            <p className="text-sm text-gray-500 mt-1">Please provide a reason for unlisting this product. The vendor will be notified via email.</p>
                        </div>

                        <form onSubmit={handleUnlistSubmit} className="p-6">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Unlisting *</label>
                                <textarea
                                    required
                                    value={unlistReason}
                                    onChange={(e) => setUnlistReason(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
                                    placeholder="e.g., Product does not meet quality standards, Violates platform policies, etc."
                                />
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowUnlistModal(false);
                                        setUnlistingProductId(null);
                                        setUnlistReason('');
                                    }}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                    Unlist Product
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default AdminProductsCategories;

