'use client'

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { DashboardCard, Button, Icon } from '@/components/common/UIComponents';
import { getAllFAQs, createFAQ, updateFAQ, deleteFAQ } from '@/utils/faqApi';
import { showToast } from '@/utils/toast';

const AdminFAQs = () => {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingFaq, setEditingFaq] = useState(null);
    const [formData, setFormData] = useState({ question: '', answer: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchFAQs();
    }, []);

    const fetchFAQs = async () => {
        try {
            setLoading(true);
            const data = await getAllFAQs();
            setFaqs(Array.isArray(data) ? data : []);
        } catch (error) {
            showToast.error('Failed to fetch FAQs');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.question.trim() || !formData.answer.trim()) {
            showToast.error('Both question and answer are required');
            return;
        }

        try {
            setSubmitting(true);
            if (editingFaq) {
                await updateFAQ(editingFaq._id, formData);
                showToast.success('FAQ updated successfully');
            } else {
                await createFAQ(formData);
                showToast.success('FAQ created successfully');
            }
            resetForm();
            await fetchFAQs();
        } catch (error) {
            showToast.error(error.response?.data?.message || 'Failed to save FAQ');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (faq) => {
        setEditingFaq(faq);
        setFormData({ question: faq.question, answer: faq.answer });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this FAQ?')) return;

        try {
            await deleteFAQ(id);
            showToast.success('FAQ deleted successfully');
            await fetchFAQs();
        } catch (error) {
            showToast.error(error.response?.data?.message || 'Failed to delete FAQ');
        }
    };

    const resetForm = () => {
        setFormData({ question: '', answer: '' });
        setEditingFaq(null);
        setShowModal(false);
    };

    return (
        <DashboardLayout title="FAQ Management" userRole="admin">
            <DashboardCard title="FAQs" className="!p-0 overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">Manage FAQs</h3>
                        <p className="text-sm text-gray-500 mt-1">Create and manage frequently asked questions</p>
                    </div>
                    <Button className="text-sm px-4 py-2" onClick={() => setShowModal(true)}>
                        <Icon path="M12 4v16m8-8H4" className="w-4 h-4 mr-1" color="white" />
                        Add FAQ
                    </Button>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading FAQs...</div>
                ) : faqs.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No FAQs found. Click "Add FAQ" to create your first FAQ.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Question</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Answer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {faqs.map(faq => (
                                    <tr key={faq._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900 max-w-xs">
                                                {faq.question}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-500 max-w-md line-clamp-2">
                                                {faq.answer}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(faq.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(faq)}
                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(faq._id)}
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

            {/* FAQ Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-gray-900">
                                {editingFaq ? 'Edit FAQ' : 'Add New FAQ'}
                            </h3>
                            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                                <Icon path="M6 18L18 6M6 6l12 12" className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Question <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.question}
                                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
                                    placeholder="e.g., What is your return policy?"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Answer <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    required
                                    value={formData.answer}
                                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                                    rows={6}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
                                    placeholder="Provide a detailed answer..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button
                                    type="button"
                                    onClick={resetForm}
                                    className="bg-gray-200 text-gray-800 hover:bg-gray-300"
                                    primary={false}
                                    disabled={submitting}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? 'Saving...' : (editingFaq ? 'Update FAQ' : 'Create FAQ')}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default AdminFAQs;

