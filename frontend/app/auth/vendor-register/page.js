'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import AuthLayout from '@/components/layouts/AuthLayout';
import { Button } from '@/components/common/UIComponents';
import { registerVendor } from '@/utils/vendorApi';
import { uploadCnic, uploadCertification } from '@/utils/uploadApi';

const VendorRegisterPage = () => {
    const router = useRouter();
    const { dispatch, state } = useAppContext();
    const step = state.vendorRegStep || 1;
    const [isClient, setIsClient] = useState(false);
    const [showBackButton, setShowBackButton] = useState(false);

    useEffect(() => {
        setIsClient(true);
        setShowBackButton(!localStorage.getItem('authToken'));
    }, []);

    // State for the entire multi-step form mapped to backend expectation
    const [vendorData, setVendorData] = useState({
        // Step 1 (personal)
        name: '',
        email: '',
        password: '',
        phoneNumber: '',
        // Step 2 (business)
        shopName: '',
        shopDescription: '',
        businessCategory: '',
        productCategories: [],
        shopAddress: { city: '', address: '' },
        // Step 3 (uploads)
        cnic: { front: null, back: null }, // { public_id, url }
        certifications: [],               // [{ public_id, url, name }]
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleInputChange = (e) => {
        // Standard controlled input handler (remove preventDefault which caused focus issues)
        const { name, value } = e.target;
        if (name.startsWith('shopAddress.')) {
            const key = name.split('.')[1];
            setVendorData(prev => ({ ...prev, shopAddress: { ...prev.shopAddress, [key]: value } }));
        } else if (name === 'businessCategory') {
            setVendorData(prev => ({ ...prev, businessCategory: value }));
        } else {
            setVendorData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleNextStep = (nextStep) => {
        dispatch({ type: 'SET_VENDOR_REG_STEP', payload: nextStep });
    };

    // Upload helpers - now use specific upload functions
    const uploadCnicFile = async (side, file) => {
        const fd = new FormData();
        fd.append('cnic_file', file);
        const data = await uploadCnic(side, fd);
        return { public_id: data.public_id, url: data.url };
    };

    const uploadCertFile = async (file) => {
        const fd = new FormData();
        fd.append('certification_file', file);
        const data = await uploadCertification(fd);
        return { public_id: data.public_id, url: data.url };
    };

    const handleUploadCnicFront = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
            setError('File size must be less than 10MB');
            e.target.value = null;
            return;
        }

        try {
            setUploading(true);
            const asset = await uploadCnicFile('front', file);
            setVendorData(prev => ({ ...prev, cnic: { ...prev.cnic, front: asset } }));
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleUploadCnicBack = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
            setError('File size must be less than 10MB');
            e.target.value = null;
            return;
        }

        try {
            setUploading(true);
            const asset = await uploadCnicFile('back', file);
            setVendorData(prev => ({ ...prev, cnic: { ...prev.cnic, back: asset } }));
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleUploadCertification = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
            setError('File size must be less than 10MB');
            e.target.value = null;
            return;
        }

        try {
            setUploading(true);
            const asset = await uploadCertFile(file);
            setVendorData(prev => ({
                ...prev,
                certifications: [...prev.certifications, { ...asset, name: file.name }]
            }));
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleFinalSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            // Minimal productCategories assumption: if empty, seed with businessCategory
            const productCategories = (vendorData.productCategories && vendorData.productCategories.length > 0)
                ? vendorData.productCategories
                : (vendorData.businessCategory ? [vendorData.businessCategory] : []);

            const payload = {
                name: vendorData.name,
                email: vendorData.email,
                password: vendorData.password,
                phoneNumber: vendorData.phoneNumber,
                shopName: vendorData.shopName,
                shopDescription: vendorData.shopDescription,
                businessCategory: vendorData.businessCategory,
                productCategories,
                shopAddress: vendorData.shopAddress,
                certifications: vendorData.certifications,
                cnic: vendorData.cnic,
            };

            const data = await registerVendor(payload);
            // Expecting backend to return { message, userId } similar to customer register
            const userId = data?.userId;
            // Persist for verification step
            sessionStorage.setItem('pendingVerifyUserId', userId || '');
            alert('Registration successful! Please verify your email to continue.');
            // Navigate to OTP verification screen
            router.push('/auth/otp');
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    const goNext = (next) => handleNextStep(next);

    return (
        <AuthLayout title={`Vendor Register - Step ${step}`}>
            {step === 1 && (
                <Step1Form
                    vendorData={vendorData}
                    error={error}
                    handleInputChange={handleInputChange}
                    dispatch={dispatch}
                    goNext={goNext}
                    isClient={isClient}
                    showBackButton={showBackButton}
                    router={router}
                />
            )}
            {step === 2 && (
                <Step2Form
                    vendorData={vendorData}
                    error={error}
                    handleInputChange={handleInputChange}
                    handleNextStep={handleNextStep}
                    goNext={goNext}
                />
            )}
            {step === 3 && (
                <Step3Form
                    error={error}
                    handleUploadCertification={handleUploadCertification}
                    handleUploadCnicFront={handleUploadCnicFront}
                    handleUploadCnicBack={handleUploadCnicBack}
                    handleNextStep={handleNextStep}
                    handleFinalSubmit={handleFinalSubmit}
                    loading={loading}
                    uploading={uploading}
                />
            )}
            <div className="absolute top-4 right-4 text-xs font-semibold text-gray-500">
                Step {step} of 3
            </div>
        </AuthLayout>
    );
};

export default VendorRegisterPage;

// Extracted stable components to prevent remounting on each keystroke (preserves input focus)
const Step1Form = React.memo(function Step1Form({ vendorData, error, handleInputChange, dispatch, goNext, isClient, showBackButton, router }) {
    return (
        <>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Personal Information</h2>
            <div className="space-y-4">
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input type="text" name="name" value={vendorData.name} onChange={handleInputChange} required className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3" placeholder="Enter your full name" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" name="email" value={vendorData.email} onChange={handleInputChange} required className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3" placeholder="Enter your email" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Contact No</label>
                    <input type="tel" name="phoneNumber" value={vendorData.phoneNumber} onChange={handleInputChange} required className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3" placeholder="Enter your contact number" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input type="password" name="password" value={vendorData.password} onChange={handleInputChange} required className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3" placeholder="Create a password" />
                </div>
                <div className="flex justify-between items-center pt-4">
                    {isClient && showBackButton && (
                        <Button type="button" onClick={() => router.push('/auth/login')}>
                            &larr; Back to Login
                        </Button>
                    )}
                    <Button type="button" onClick={() => goNext(2)}>Next</Button>
                </div>
            </div>
        </>
    );
});

const Step2Form = React.memo(function Step2Form({ vendorData, error, handleInputChange, handleNextStep, goNext }) {
    return (
        <>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Business Details</h2>
            <div className="space-y-4">
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Business Name</label>
                    <input type="text" name="shopName" value={vendorData.shopName} onChange={handleInputChange} required className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3" placeholder="Enter your business name" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Business Description</label>
                    <textarea name="shopDescription" value={vendorData.shopDescription} onChange={handleInputChange} required rows="3" className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3" placeholder="Tell us about your business..."></textarea>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Business Address</label>
                    <input type="text" name="shopAddress.address" value={vendorData.shopAddress.address} onChange={handleInputChange} required className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3" placeholder="Street, Building, Unit" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">City</label>
                        <input type="text" name="shopAddress.city" value={vendorData.shopAddress.city} onChange={handleInputChange} required className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3" placeholder="City" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Business Category</label>
                        <select name="businessCategory" value={vendorData.businessCategory} onChange={handleInputChange} required className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 bg-white">
                            <option value="">Select Category</option>
                            <option>Farmer</option>
                            <option>Artisan</option>
                            <option>Apiary (Honey)</option>
                            <option>Dairy</option>
                            <option>Other</option>
                        </select>
                    </div>
                </div>
                <div className="flex justify-between items-center pt-4">
                    <Button type="button" onClick={() => handleNextStep(1)}>Back</Button>
                    <Button type="button" onClick={() => goNext(3)}>Next</Button>
                </div>
            </div>
        </>
    );
});

const Step3Form = React.memo(function Step3Form({ error, handleUploadCertification, handleUploadCnicFront, handleUploadCnicBack, handleNextStep, handleFinalSubmit, loading, uploading }) {
    return (
        <>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Certifications & Verification</h2>
            <form className="space-y-4" onSubmit={handleFinalSubmit}>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Upload Organic Certification <span className="text-xs text-gray-500">(Max 10MB)</span></label>
                    <input id="certification-upload" name="certification" type="file" onChange={handleUploadCertification} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary-light file:text-secondary hover:file:bg-secondary-dark" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">CNIC Front <span className="text-xs text-gray-500">(Max 10MB)</span></label>
                    <input id="cnic-front-upload" name="cnicFront" type="file" onChange={handleUploadCnicFront} required className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary-light file:text-secondary hover:file:bg-secondary-dark" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">CNIC Back <span className="text-xs text-gray-500">(Max 10MB)</span></label>
                    <input id="cnic-back-upload" name="cnicBack" type="file" onChange={handleUploadCnicBack} required className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary-light file:text-secondary hover:file:bg-secondary-dark" />
                </div>
                <div className="flex justify-between items-center pt-4">
                    <Button type="button" onClick={() => handleNextStep(2)}>Back</Button>
                    <Button type="submit" disabled={loading || uploading}>
                        {loading || uploading ? 'Submitting...' : 'Complete Registration'}
                    </Button>
                </div>
            </form>
        </>
    );
});

