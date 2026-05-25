'use client'

import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { DashboardCard, Button, Icon } from '@/components/common/UIComponents';
import { getMyProducts } from '@/utils/productApi';
import {
    createSubscriptionBox,
    getMySubscriptionBoxes,
    updateSubscriptionBox,
    deleteSubscriptionBox
} from '@/utils/subscriptionBoxApi';
import { showToast } from '@/utils/toast';

const VendorSubscriptionBoxesPage = () => {
    const [boxes, setBoxes] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingBoxId, setEditingBoxId] = useState(null);

    const [productSearch, setProductSearch] = useState('');
    const [productPage, setProductPage] = useState(1);
    const [productTotalPages, setProductTotalPages] = useState(1);
    const [availableProducts, setAvailableProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        frequency: 'weekly',
        products: [],
    });

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const selectedSet = useMemo(() => new Set(formData.products), [formData.products]);

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            price: '',
            frequency: 'weekly',
            products: [],
        });
        setProductSearch('');
        setProductPage(1);
        setProductTotalPages(1);
        setAvailableProducts([]);
        setEditingBoxId(null);
    };

    const fetchBoxes = async () => {
        try {
            setLoading(true);
            const data = await getMySubscriptionBoxes();
            setBoxes(Array.isArray(data) ? data : []);
        } catch (error) {
            showToast.error(error.response?.data?.message || 'Failed to fetch subscription boxes');
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async ({ page = 1, keyword = '', append = false } = {}) => {
        try {
            setProductsLoading(true);
            const data = await getMyProducts(page, keyword);
            const nextProducts = data?.products || [];
            setProductTotalPages(data?.totalPages || 1);
            setProductPage(data?.page || page);
            setAvailableProducts((prev) => (append ? [...prev, ...nextProducts] : nextProducts));
        } catch (error) {
            showToast.error(error.response?.data?.message || 'Failed to fetch products');
        } finally {
            setProductsLoading(false);
        }
    };

    useEffect(() => {
        fetchBoxes();
    }, []);

    useEffect(() => {
        if (!showModal) return;
        fetchProducts({ page: 1, keyword: productSearch, append: false });
    }, [showModal, productSearch]);

    const toggleProduct = (productId) => {
        setFormData((prev) => {
            const id = productId.toString();
            const next = new Set(prev.products.map((p) => p.toString()));
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return { ...prev, products: [...next] };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.description) {
            showToast.error('Title and description are required');
            return;
        }

        if (!formData.price || Number(formData.price) < 0) {
            showToast.error('Please enter a valid price');
            return;
        }

        if (!formData.products.length) {
            showToast.error('Please select at least one product');
            return;
        }

        try {
            setSaving(true);
            const payload = {
                title: formData.title,
                description: formData.description,
                price: Number(formData.price),
                frequency: formData.frequency,
                products: formData.products,
            };

            if (editingBoxId) {
                await updateSubscriptionBox(editingBoxId, payload);
                showToast.success('Subscription box updated');
            } else {
                await createSubscriptionBox(payload);
                showToast.success('Subscription box created');
            }

            setShowModal(false);
            resetForm();
            fetchBoxes();
        } catch (error) {
            showToast.error(error.response?.data?.message || `Failed to ${editingBoxId ? 'update' : 'create'} subscription box`);
        } finally {
            setSaving(false);
        }
    };

    const handleLoadMore = async () => {
        if (productsLoading) return;
        if (productPage >= productTotalPages) return;
        const nextPage = productPage + 1;
        await fetchProducts({ page: nextPage, keyword: productSearch, append: true });
    };

    const handleEdit = (box) => {
        setEditingBoxId(box._id);
        setFormData({
            title: box.title,
            description: box.description,
            price: box.price.toString(),
            frequency: box.frequency,
            products: box.products.map(p => p._id),
        });
        setShowModal(true);
    };

    const handleDelete = async () => {
        const boxId = showDeleteConfirm;
        try {
            setDeleting(true);
            await deleteSubscriptionBox(boxId);
            showToast.success('Subscription box deleted successfully');
            setShowDeleteConfirm(null);
            fetchBoxes();
        } catch (error) {
            showToast.error(error.response?.data?.message || 'Failed to delete subscription box');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <DashboardLayout title="Subscription Boxes" userRole="vendor">
            <DashboardCard title="" className="!p-0 overflow-hidden">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b border-gray-200 gap-4">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800">My Subscription Boxes ({boxes.length})</h3>
                        <p className="text-sm text-gray-500">Create weekly/monthly COD subscription boxes from your inventory.</p>
                    </div>
                    <Button className="text-sm px-4 py-2" onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}>
                        <Icon path="M12 4v16m8-8H4" className="w-4 h-4 mr-1" color="white" />
                        Create Box
                    </Button>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading subscription boxes...</div>
                ) : boxes.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No boxes yet. Click "Create Box" to add your first subscription box.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {['Title', 'Frequency', 'Price', 'Products', 'Actions'].map((header) => (
                                        <th
                                            key={header}
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {boxes.map((box) => (
                                    <tr key={box._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">{box.title}</div>
                                            <div className="text-xs text-gray-500 line-clamp-1 max-w-[420px]">{box.description}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">{box.frequency}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">Rs. {Number(box.price || 0).toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{box.products?.length || 0}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-2">
                                            <button
                                                onClick={() => handleEdit(box)}
                                                className="text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => setShowDeleteConfirm(box._id)}
                                                className="text-red-600 hover:text-red-800 font-medium"
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

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] shadow-xl overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
                            <h3 className="text-lg font-semibold text-gray-800">{editingBoxId ? 'Edit' : 'Create'} Subscription Box</h3>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    resetForm();
                                }}
                                className="p-2 rounded hover:bg-gray-100"
                                aria-label="Close"
                            >
                                <Icon path="M6 18L18 6M6 6l12 12" className="w-5 h-5 text-gray-700" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Title</label>
                                    <input
                                        value={formData.title}
                                        onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
                                        placeholder="e.g., Weekly Fresh Veg Box"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Price (Rs.)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.price}
                                        onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
                                        placeholder="Total per delivery"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Delivery Frequency</label>
                                    <select
                                        value={formData.frequency}
                                        onChange={(e) => setFormData((p) => ({ ...p, frequency: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
                                    >
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                    </select>
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
                                        placeholder="What’s included in this box?"
                                    />
                                </div>
                            </div>

                            <div className="border rounded-lg overflow-hidden">
                                <div className="p-3 border-b bg-gray-50 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                                    <div className="font-medium text-gray-800">Select Products</div>
                                    <input
                                        value={productSearch}
                                        onChange={(e) => setProductSearch(e.target.value)}
                                        placeholder="Search your products..."
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
                                    />
                                </div>

                                <div className="max-h-72 overflow-y-auto divide-y">
                                    {productsLoading && availableProducts.length === 0 ? (
                                        <div className="p-4 text-sm text-gray-500">Loading products...</div>
                                    ) : availableProducts.length === 0 ? (
                                        <div className="p-4 text-sm text-gray-500">No products found.</div>
                                    ) : (
                                        availableProducts.map((p) => {
                                            const disabled = (p.status && p.status !== 'Active') || (typeof p.stock === 'number' && p.stock < 1);
                                            const checked = selectedSet.has(p._id?.toString());
                                            return (
                                                <label key={p._id} className={`flex items-center justify-between p-3 gap-4 ${disabled ? 'opacity-60' : ''}`}>
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={checked}
                                                            onChange={() => toggleProduct(p._id)}
                                                            disabled={disabled}
                                                        />
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">{p.name}</div>
                                                            <div className="text-xs text-gray-500">Rs. {Number(p.price || 0).toLocaleString()} • Stock: {p.stock ?? '-'}</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-gray-600">{p.status || '—'}</div>
                                                </label>
                                            );
                                        })
                                    )}
                                </div>

                                {productPage < productTotalPages && (
                                    <div className="p-3 border-t bg-gray-50 flex justify-center">
                                        <button
                                            type="button"
                                            onClick={handleLoadMore}
                                            disabled={productsLoading}
                                            className="text-sm text-secondary font-medium hover:underline disabled:opacity-60"
                                        >
                                            {productsLoading ? 'Loading...' : 'Load more'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2 flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <Button type="submit" className="text-sm px-4 py-2" disabled={saving}>
                                    {saving ? (editingBoxId ? 'Updating...' : 'Creating...') : (editingBoxId ? 'Update Box' : 'Create Box')}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-sm shadow-xl">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Delete Subscription Box?</h3>
                            <p className="text-sm text-gray-600 mb-6">
                                This action cannot be undone. Are you sure you want to delete this subscription box?
                            </p>
                            <div className="flex items-center justify-end gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(null)}
                                    disabled={deleting}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                                >
                                    {deleting ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default VendorSubscriptionBoxesPage;
