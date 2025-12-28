'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/common/UIComponents';
import { useAppContext } from '@/context/AppContext';
import { getProfile, updateProfile } from '@/utils/userApi';
import { uploadAvatar, uploadCnic, uploadCertification, uploadShopImage } from '@/utils/uploadApi';
import { addCertification, deleteCertification, addShopImage, deleteShopImage } from '@/utils/vendorApi';
import { showToast } from '@/utils/toast';
import VendorStatusBanner from '@/components/vendor/VendorStatusBanner';

const VendorBusinessInfo = () => {
    const { state } = useAppContext();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('personal');
    const [hasChanges, setHasChanges] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        avatar: { url: '', public_id: '' },
        shopName: '',
        shopDescription: '',
        businessCategory: '',
        productCategories: [],
        shopAddress: { city: '', address: '' },
        shopImages: [],
        cnic: {
            front: { url: '', public_id: '' },
            back: { url: '', public_id: '' }
        },
        certifications: [],
        vendorStatus: '',
        rejectionReason: '',
        isEmailVerified: false
    });

    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingCnic, setUploadingCnic] = useState({ front: false, back: false });
    const [uploadingShopImage, setUploadingShopImage] = useState(false);
    const [uploadingCert, setUploadingCert] = useState(false);
    const [newCertName, setNewCertName] = useState('');
    const [originalData, setOriginalData] = useState(null);

    const categoryOptions = ['Vegetables', 'Fruits', 'Dairy', 'Grains', 'Meat', 'Bakery', 'Beverages', 'Spices', 'Others'];
    const businessCategories = ['Farmer', 'Retailer', 'Distributor'];
    const cities = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala'];

    // Helper function to check if vendor can edit
    const canEdit = () => {
        return formData.vendorStatus === 'Approved' || formData.vendorStatus === 'Rejected';
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await getProfile();
            const profileData = {
                name: data.name || '',
                email: data.email || '',
                phoneNumber: data.phoneNumber || '',
                avatar: data.avatar || { url: '', public_id: '' },
                shopName: data.shopName || '',
                shopDescription: data.shopDescription || '',
                businessCategory: data.businessCategory || '',
                productCategories: data.productCategories || [],
                shopAddress: data.shopAddress || { city: '', address: '' },
                shopImages: data.shopImages || [],
                cnic: data.cnic || { front: { url: '', public_id: '' }, back: { url: '', public_id: '' } },
                certifications: data.certifications || [],
                vendorStatus: data.vendorStatus || 'Pending',
                rejectionReason: data.rejectionReason || '',
                isEmailVerified: data.isEmailVerified || false
            };
            setFormData(profileData);
            setOriginalData(JSON.parse(JSON.stringify(profileData)));
            setHasChanges(false);
        } catch (error) {
            showToast.error(error.response?.data?.message || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        setHasChanges(true);
    };

    const toggleCategory = (category) => {
        setFormData(prev => ({
            ...prev,
            productCategories: prev.productCategories.includes(category)
                ? prev.productCategories.filter(c => c !== category)
                : [...prev.productCategories, category]
        }));
        setHasChanges(true);
    };

    // Certification handlers
    const handleAddCertification = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!newCertName.trim()) {
            showToast.error('Please enter certification name');
            e.target.value = null;
            return;
        }

        // Check file size (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
            showToast.error('File size must be less than 10MB');
            e.target.value = null;
            return;
        }

        try {
            setUploadingCert(true);

            // Step 1: Upload file to get URL and public_id
            const uploadFormData = new FormData();
            uploadFormData.append('certification_file', file);

            const uploadResponse = await uploadCertification(uploadFormData);

            // Step 2: Add certification with URL and public_id
            await addCertification({
                name: newCertName,
                url: uploadResponse.url,
                public_id: uploadResponse.public_id
            });

            showToast.success('Certification added successfully!');
            setNewCertName('');
            e.target.value = null;
            await fetchProfile();
        } catch (error) {
            showToast.error(error.response?.data?.message || 'Failed to upload certification');
            e.target.value = null;
        } finally {
            setUploadingCert(false);
        }
    };

    const handleDeleteCertification = async (certId) => {
        if (!window.confirm('Are you sure you want to delete this certification?')) return;

        try {
            await deleteCertification(certId);
            showToast.success('Certification deleted successfully!');
            await fetchProfile();
        } catch (error) {
            showToast.error(error.response?.data?.message || 'Failed to delete certification');
        }
    };

    // Shop image handlers
    const handleAddShopImage = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
            showToast.error('File size must be less than 10MB');
            e.target.value = null;
            return;
        }

        try {
            setUploadingShopImage(true);

            // Step 1: Upload file to get URL and public_id
            const uploadFormData = new FormData();
            uploadFormData.append('shop_image_file', file);

            const uploadResponse = await uploadShopImage(uploadFormData);

            // Step 2: Add shop image with URL and public_id
            await addShopImage({
                url: uploadResponse.url,
                public_id: uploadResponse.public_id
            });

            showToast.success('Shop image added successfully!');
            e.target.value = null;
            await fetchProfile();
        } catch (error) {
            showToast.error(error.response?.data?.message || 'Failed to upload shop image');
            e.target.value = null;
        } finally {
            setUploadingShopImage(false);
        }
    };

    const handleDeleteShopImage = async (imgId) => {
        if (!window.confirm('Are you sure you want to delete this shop image?')) return;

        try {
            await deleteShopImage(imgId);
            showToast.success('Shop image deleted successfully!');
            await fetchProfile();
        } catch (error) {
            showToast.error(error.response?.data?.message || 'Failed to delete shop image');
        }
    };

    // CNIC handlers
    const handleUploadCnic = async (e, side) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
            showToast.error('File size must be less than 10MB');
            e.target.value = null;
            return;
        }

        try {
            setUploadingCnic(prev => ({ ...prev, [side]: true }));

            // Upload file to get URL and public_id
            const uploadFormData = new FormData();
            uploadFormData.append('cnic_file', file);

            const uploadResponse = await uploadCnic(side, uploadFormData);

            // Update form data with new CNIC image
            setFormData(prev => ({
                ...prev,
                cnic: {
                    ...prev.cnic,
                    [side]: {
                        url: uploadResponse.url,
                        public_id: uploadResponse.public_id
                    }
                }
            }));

            showToast.success(`CNIC ${side} uploaded successfully! Click Save Changes to apply.`);
            setHasChanges(true);
            e.target.value = null;
        } catch (error) {
            showToast.error(error.response?.data?.message || `Failed to upload CNIC ${side}`);
            e.target.value = null;
        } finally {
            setUploadingCnic(prev => ({ ...prev, [side]: false }));
        }
    };

    const handleSavePersonalInfo = async () => {
        if (!formData.name || !formData.phoneNumber) {
            showToast.error('Please fill all required fields');
            return;
        }

        try {
            setSaving(true);
            await updateProfile({
                name: formData.name,
                phoneNumber: formData.phoneNumber,
                avatar: formData.avatar
            });
            showToast.success('Personal information updated successfully!');
            fetchProfile();
        } catch (error) {
            showToast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveBusinessDetails = async () => {
        if (!formData.shopName || !formData.shopDescription) {
            showToast.error('Please fill all required fields');
            return;
        }

        if (!formData.businessCategory) {
            showToast.error('Please select business category');
            return;
        }

        if (formData.productCategories.length === 0) {
            showToast.error('Please select at least one product category');
            return;
        }

        if (!formData.shopAddress.city || !formData.shopAddress.address) {
            showToast.error('Please fill shop address details');
            return;
        }

        try {
            setSaving(true);
            await updateProfile({
                shopName: formData.shopName,
                shopDescription: formData.shopDescription,
                businessCategory: formData.businessCategory,
                productCategories: formData.productCategories,
                shopAddress: formData.shopAddress
            });
            showToast.success('Business details updated successfully!');
            fetchProfile();
        } catch (error) {
            showToast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveDocuments = async () => {
        try {
            setSaving(true);
            // Only send CNIC sides that have changed
            const updateData = {};

            const cnicChanged = JSON.stringify(formData.cnic.front) !== JSON.stringify(originalData?.cnic?.front) ||
                JSON.stringify(formData.cnic.back) !== JSON.stringify(originalData?.cnic?.back);

            if (cnicChanged) {
                updateData.cnic = {};

                // Only send front if it changed
                if (JSON.stringify(formData.cnic.front) !== JSON.stringify(originalData?.cnic?.front)) {
                    updateData.cnic.front = formData.cnic.front;
                }

                // Only send back if it changed
                if (JSON.stringify(formData.cnic.back) !== JSON.stringify(originalData?.cnic?.back)) {
                    updateData.cnic.back = formData.cnic.back;
                }
            }

            if (Object.keys(updateData).length === 0) {
                showToast.info('No changes to save');
                setSaving(false);
                return;
            }

            await updateProfile(updateData);
            showToast.success('Documents updated successfully!');
            fetchProfile();
        } catch (error) {
            showToast.error(error.response?.data?.message || 'Failed to update documents');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Business Information" userRole="vendor">
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">Loading profile...</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Business Information" userRole="vendor">
            <div className="space-y-6">
                <VendorStatusBanner vendorStatus={formData.vendorStatus} rejectionReason={formData.rejectionReason} />

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                            <button
                                onClick={() => setActiveTab('personal')}
                                className={`${activeTab === 'personal'
                                    ? 'border-green-500 text-green-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                Personal Info
                            </button>
                            <button
                                onClick={() => setActiveTab('business')}
                                className={`${activeTab === 'business'
                                    ? 'border-green-500 text-green-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                Business Details
                            </button>
                            <button
                                onClick={() => setActiveTab('documents')}
                                className={`${activeTab === 'documents'
                                    ? 'border-green-500 text-green-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                Documents
                            </button>
                        </nav>
                    </div>

                    {/* Personal Info Tab */}
                    {activeTab === 'personal' && (
                        <>
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email (Read-only)</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            disabled
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                                        <input
                                            type="text"
                                            name="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="border-t border-gray-200 px-6 py-4">
                                <div className="flex justify-end">
                                    <Button
                                        onClick={handleSavePersonalInfo}
                                        disabled={saving || !hasChanges || !canEdit()}
                                        className={`px-6 py-2 rounded-md ${saving || !hasChanges || !canEdit()
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-green-600 hover:bg-green-700'
                                            } text-white`}
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                                {!canEdit() && (
                                    <p className="text-sm text-amber-600 mt-2 text-right">
                                        {formData.vendorStatus === 'Pending'
                                            ? 'You can edit your profile after admin reviews your application'
                                            : 'Profile editing is currently disabled'}
                                    </p>
                                )}
                            </div>
                        </>
                    )}

                    {/* Business Details Tab */}
                    {activeTab === 'business' && (
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Shop Name *</label>
                                    <input
                                        type="text"
                                        name="shopName"
                                        value={formData.shopName}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Category *</label>
                                    <select
                                        name="businessCategory"
                                        value={formData.businessCategory}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="">Select Category</option>
                                        {businessCategories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Shop Description *</label>
                                <textarea
                                    name="shopDescription"
                                    value={formData.shopDescription}
                                    onChange={handleChange}
                                    rows="4"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Product Categories *</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {categoryOptions.map(category => (
                                        <label key={category} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={formData.productCategories.includes(category)}
                                                onChange={() => toggleCategory(category)}
                                                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                            />
                                            <span className="text-sm text-gray-700">{category}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                                    <select
                                        name="shopAddress.city"
                                        value={formData.shopAddress.city}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="">Select City</option>
                                        {cities.map(city => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                                    <input
                                        type="text"
                                        name="shopAddress.address"
                                        value={formData.shopAddress.address}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                            </div>
                            <div className="border-t border-gray-200 px-6 py-4">
                                <div className="flex justify-end">
                                    <Button
                                        onClick={handleSaveBusinessDetails}
                                        disabled={saving || !hasChanges || !canEdit()}
                                        className={`px-6 py-2 rounded-md ${saving || !hasChanges || !canEdit()
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-green-600 hover:bg-green-700'
                                            } text-white`}
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                                {!canEdit() && (
                                    <p className="text-sm text-amber-600 mt-2 text-right">
                                        {formData.vendorStatus === 'Pending'
                                            ? 'You can edit your profile after admin reviews your application'
                                            : 'Profile editing is currently disabled'}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Documents Tab */}
                    {activeTab === 'documents' && (
                        <div className="p-6 space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">CNIC Images</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">CNIC Front <span className="text-xs text-gray-500">(Max 10MB)</span></label>
                                        {formData.cnic.front.url ? (
                                            <div className="space-y-2">
                                                <div className="relative w-full h-48 rounded-md border overflow-hidden">
                                                    <Image
                                                        key={formData.cnic.front.url}
                                                        src={formData.cnic.front.url}
                                                        alt="CNIC Front"
                                                        fill
                                                        className="object-cover"
                                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/E9F5E9/164A26?text=CNIC+Image+Not+Found'; }}
                                                    />
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleUploadCnic(e, 'front')}
                                                    disabled={uploadingCnic.front || !canEdit()}
                                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 disabled:cursor-not-allowed"
                                                />
                                                {uploadingCnic.front && <p className="text-sm text-blue-600">Uploading...</p>}
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <div className="w-full h-48 bg-gray-100 rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center">
                                                    <p className="text-gray-500">No CNIC front image uploaded</p>
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleUploadCnic(e, 'front')}
                                                    disabled={uploadingCnic.front || !canEdit()}
                                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 disabled:cursor-not-allowed"
                                                />
                                                {uploadingCnic.front && <p className="text-sm text-blue-600">Uploading...</p>}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">CNIC Back <span className="text-xs text-gray-500">(Max 10MB)</span></label>
                                        {formData.cnic.back.url ? (
                                            <div className="space-y-2">
                                                <div className="relative w-full h-48 rounded-md border overflow-hidden">
                                                    <Image
                                                        key={formData.cnic.back.url}
                                                        src={formData.cnic.back.url}
                                                        alt="CNIC Back"
                                                        fill
                                                        className="object-cover"
                                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/E9F5E9/164A26?text=CNIC+Image+Not+Found'; }}
                                                    />
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleUploadCnic(e, 'back')}
                                                    disabled={uploadingCnic.back || !canEdit()}
                                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 disabled:cursor-not-allowed"
                                                />
                                                {uploadingCnic.back && <p className="text-sm text-blue-600">Uploading...</p>}
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <div className="w-full h-48 bg-gray-100 rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center">
                                                    <p className="text-gray-500">No CNIC back image uploaded</p>
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleUploadCnic(e, 'back')}
                                                    disabled={uploadingCnic.back || !canEdit()}
                                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 disabled:cursor-not-allowed"
                                                />
                                                {uploadingCnic.back && <p className="text-sm text-blue-600">Uploading...</p>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Certifications</h3>
                                {formData.certifications.length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        {formData.certifications.map((cert, index) => (
                                            <div key={cert._id || index} className="border rounded-lg p-4 flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium text-gray-900">{cert.name}</p>
                                                    <a href={cert.url} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 text-sm">
                                                        View Certificate
                                                    </a>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteCertification(cert._id)}
                                                    disabled={!canEdit()}
                                                    className="text-red-600 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                                                    title="Delete certification"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Add New Certification */}
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-3">Add New Certification</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">Certification Name *</label>
                                            <input
                                                type="text"
                                                value={newCertName}
                                                onChange={(e) => setNewCertName(e.target.value)}
                                                placeholder="e.g., Organic Farming Certificate"
                                                disabled={!canEdit()}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">Upload Certificate (PDF or Image) <span className="text-xs text-gray-500">(Max 10MB)</span></label>
                                            <input
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={handleAddCertification}
                                                disabled={uploadingCert || !canEdit()}
                                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 disabled:cursor-not-allowed"
                                            />
                                            {uploadingCert && <p className="text-sm text-blue-600 mt-1">Uploading...</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Shop Images <span className="text-sm text-gray-500 font-normal">(Max 10MB each)</span></h3>
                                {formData.shopImages.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                        {formData.shopImages.map((image, index) => (
                                            <div key={image._id || index} className="relative group">
                                                <div className="relative w-full h-32 rounded-md border overflow-hidden">
                                                    <Image src={image.url} alt={`Shop ${index + 1}`} fill className="object-cover" onError={(e) => { e.target.src = 'https://placehold.co/400x300/E9F5E9/164A26?text=Image+Not+Found'; }} />
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteShopImage(image._id)}
                                                    disabled={!canEdit()}
                                                    className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                    title="Delete image"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Add New Shop Image */}
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-3">Add Shop Image</h4>
                                    <div className="flex items-center space-x-4">
                                        <label className="flex-1 cursor-pointer">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleAddShopImage}
                                                disabled={uploadingShopImage || !canEdit()}
                                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 disabled:cursor-not-allowed"
                                            />
                                        </label>
                                    </div>
                                    {uploadingShopImage && <p className="text-sm text-blue-600 mt-2">Uploading...</p>}
                                    <p className="text-xs text-gray-500 mt-2">Upload clear images of your shop/products</p>
                                </div>
                            </div>
                            <div className="border-t border-gray-200 px-6 py-4">
                                <div className="flex justify-end">
                                    <Button
                                        onClick={handleSaveDocuments}
                                        disabled={saving || !hasChanges || !canEdit()}
                                        className={`px-6 py-2 rounded-md ${saving || !hasChanges || !canEdit()
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-green-600 hover:bg-green-700'
                                            } text-white`}
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                                {!canEdit() && (
                                    <p className="text-sm text-amber-600 mt-2 text-right">
                                        {formData.vendorStatus === 'Pending'
                                            ? 'You can edit your profile after admin reviews your application'
                                            : 'Profile editing is currently disabled'}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default VendorBusinessInfo;

