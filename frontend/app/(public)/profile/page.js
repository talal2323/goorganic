'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/common/UIComponents';
import { getProfile, updateProfile, changePassword, requestAccountDeletion } from '@/utils/userApi';
import { uploadAvatar } from '@/utils/uploadApi';
import { showToast } from '@/utils/toast';
import Layout from '@/components/layouts/Layout';

const ProfilePage = () => {
    const router = useRouter();
    const { state, dispatch } = useAppContext();
    const [user, setUser] = useState(state.user || {});
    const emptyShipping = { street: '', city: '', postalCode: '', country: '' };
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '' });
    const [pwdLoading, setPwdLoading] = useState(false);
    const [pwdMessage, setPwdMessage] = useState('');
    const [pwdError, setPwdError] = useState('');
    const [avatarLoading, setAvatarLoading] = useState(false);

    // Deletion states
    const [showDeletionConfirm, setShowDeletionConfirm] = useState(false);
    const [deletionReason, setDeletionReason] = useState('');
    const [confirmationText, setConfirmationText] = useState('');
    const [hasPendingRequest, setHasPendingRequest] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchUserProfile = async () => {
            setLoading(true);
            try {
                const data = await getProfile();
                setUser(data);
                dispatch({ type: 'UPDATE_USER', payload: data });
                // Check if user has pending deletion request
                if (data.deletionRequested) {
                    setHasPendingRequest(true);
                }
            } catch (err) {
                setError(err.response && err.response.data.message ? err.response.data.message : err.message);
            } finally {
                setLoading(false);
            }
        };

        if (state.isLoggedIn) {
            fetchUserProfile();
        } else {
            // Redirect to login if not logged in
            router.push('/auth/login');
        }
    }, [state.isLoggedIn, dispatch]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Prepare payload with shippingAddress object separated (avoid sending undefined nested objects)
            const { shippingAddress, ...rest } = user;
            const payload = { ...rest, shippingAddress };
            const data = await updateProfile(payload);
            setUser(data);
            dispatch({ type: 'UPDATE_USER', payload: data });
            setIsEditing(false);
        } catch (err) {
            setError(err.response && err.response.data.message ? err.response.data.message : err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // Handle shippingAddress.* fields
        if (name.startsWith('shippingAddress.')) {
            const field = name.split('.')[1];
            setUser(prev => ({ ...prev, shippingAddress: { ...(prev.shippingAddress || emptyShipping), [field]: value } }));
        } else {
            setUser({ ...user, [name]: value });
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
            setError('File size must be less than 10MB');
            e.target.value = null;
            return;
        }

        setAvatarLoading(true);
        setError(null);
        try {
            const fd = new FormData();
            fd.append('avatar_file', file);
            // Upload avatar using uploadApi
            const upload = await uploadAvatar(fd);
            const avatar = { public_id: upload.public_id, url: upload.url };
            const updated = await updateProfile({ avatar });
            setUser(updated);
            dispatch({ type: 'UPDATE_USER', payload: updated });
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setAvatarLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPwdLoading(true);
        setPwdMessage('');
        setPwdError('');
        try {
            if (!pwdForm.currentPassword || !pwdForm.newPassword) {
                setPwdError('Please enter both current and new password.');
                return;
            }
            const data = await changePassword(pwdForm);
            setPwdMessage(data.message || 'Password changed successfully');
            setPwdForm({ currentPassword: '', newPassword: '' });
        } catch (err) {
            setPwdError(err.response?.data?.message || err.message);
        } finally {
            setPwdLoading(false);
        }
    };

    // Handle deletion request with confirmation
    const handleRequestDeletion = async () => {
        // Validation: Must type "DELETE" to confirm
        if (confirmationText !== 'DELETE') {
            showToast.error('Please type DELETE to confirm');
            return;
        }

        if (!deletionReason.trim()) {
            showToast.error('Please provide a reason for deletion');
            return;
        }

        setIsSubmitting(true);

        try {
            const data = await requestAccountDeletion(deletionReason);

            showToast.success(data.message, { duration: 5000 });

            // Update local state
            setHasPendingRequest(true);
            setShowDeletionConfirm(false);

            // Update user in context
            dispatch({
                type: 'UPDATE_USER',
                payload: { deletionRequested: true }
            });

        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to submit deletion request';
            showToast.error(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="text-center p-8">Loading profile...</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-500">Error: {error}</div>;
    }

    return (
        <div className="bg-gray-50 py-8">
            <main className="max-w-4xl mx-auto px-4">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold mb-4">Profile</h1>
                    {isEditing ? (
                        <form onSubmit={handleUpdateProfile}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-1 text-center">
                                    <div className="w-32 h-32 rounded-full bg-gray-200 mx-auto mb-3 flex items-center justify-center overflow-hidden">
                                        {user.avatar?.url ? (
                                            <img src={user.avatar.url} alt="avatar" className="w-32 h-32 object-cover" />
                                        ) : (
                                            <span className="text-gray-500">Avatar</span>
                                        )}
                                    </div>
                                    <div className="mt-3 mb-3">
                                        <label htmlFor="avatar-upload-edit" className="cursor-pointer inline-block">
                                            <span className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm">
                                                {avatarLoading ? 'Uploading...' : 'Choose File'}
                                            </span>
                                            <input
                                                id="avatar-upload-edit"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleAvatarChange}
                                                disabled={avatarLoading}
                                                className="hidden"
                                            />
                                        </label>
                                        <p className="text-xs text-gray-500 mt-1">Max 10MB</p>
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        value={user.name || ''}
                                        onChange={handleInputChange}
                                        className="text-lg font-semibold text-center w-full border rounded p-1"
                                    />
                                    <div className="text-sm text-gray-600 text-center w-full mt-2">
                                        {user.email || ''}
                                    </div>
                                </div>
                                <div className="md:col-span-2 space-y-6">
                                    <h3 className="text-lg font-semibold mb-2">Edit Account Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs uppercase text-gray-500">Street</label>
                                            <input type="text" name="shippingAddress.street" value={user.shippingAddress?.street || ''} onChange={handleInputChange} className="border p-2 rounded w-full" placeholder="Street" />
                                        </div>
                                        <div>
                                            <label className="text-xs uppercase text-gray-500">City</label>
                                            <input type="text" name="shippingAddress.city" value={user.shippingAddress?.city || ''} onChange={handleInputChange} className="border p-2 rounded w-full" placeholder="City" />
                                        </div>
                                        <div>
                                            <label className="text-xs uppercase text-gray-500">Postal Code</label>
                                            <input type="text" name="shippingAddress.postalCode" value={user.shippingAddress?.postalCode || ''} onChange={handleInputChange} className="border p-2 rounded w-full" placeholder="Postal Code" />
                                        </div>
                                        <div>
                                            <label className="text-xs uppercase text-gray-500">Country</label>
                                            <input type="text" name="shippingAddress.country" value={user.shippingAddress?.country || ''} onChange={handleInputChange} className="border p-2 rounded w-full" placeholder="Country" />
                                        </div>
                                    </div>
                                    <div className="flex justify-end space-x-2 mt-4">
                                        <Button type="button" onClick={() => setIsEditing(false)} className="bg-gray-300 hover:bg-gray-400">
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={loading}>
                                            {loading ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </div>
                                    <div className="border-t pt-4">
                                        <h3 className="text-lg font-semibold mb-2">Change Password</h3>
                                        {pwdError && <p className="text-sm text-red-500">{pwdError}</p>}
                                        {pwdMessage && <p className="text-sm text-green-600">{pwdMessage}</p>}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                            <input type="password" className="border p-2 rounded" placeholder="Current Password" value={pwdForm.currentPassword} onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })} autoComplete="current-password" />
                                            <input type="password" className="border p-2 rounded" placeholder="New Password" value={pwdForm.newPassword} onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })} autoComplete="new-password" />
                                            <Button type="button" onClick={handleChangePassword} disabled={pwdLoading}>{pwdLoading ? 'Changing...' : 'Change Password'}</Button>
                                        </div>
                                    </div>
                                    <div className="border-t pt-4">
                                        <h3 className="text-lg font-semibold mb-2 text-red-600">Danger Zone</h3>
                                        {hasPendingRequest ? (
                                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                                                <div className="flex items-start">
                                                    <div className="flex-shrink-0">
                                                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                    <div className="ml-3">
                                                        <h3 className="text-sm font-medium text-yellow-800">
                                                            Account Deletion Request Pending
                                                        </h3>
                                                        <div className="mt-2 text-sm text-yellow-700">
                                                            <p>
                                                                Your account deletion request has been submitted and is pending admin review.
                                                                You will receive an email notification once your request is processed.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="border border-red-300 rounded-lg p-4">
                                                <h4 className="font-semibold text-gray-900 mb-2">Delete Account</h4>
                                                <p className="text-sm text-gray-600 mb-4">
                                                    Once you request account deletion, an admin will review your request.
                                                    This action cannot be undone by you.
                                                </p>
                                                <Button
                                                    onClick={() => setShowDeletionConfirm(true)}
                                                    className="bg-red-600 hover:bg-red-700"
                                                >
                                                    Request Account Deletion
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-1 text-center">
                                <div className="w-32 h-32 rounded-full bg-gray-200 mx-auto mb-3 flex items-center justify-center overflow-hidden">
                                    {user.avatar?.url ? (
                                        <img src={user.avatar.url} alt="avatar" className="w-32 h-32 object-cover" />
                                    ) : (
                                        <span className="text-gray-500">Avatar</span>
                                    )}
                                </div>
                                <div className="mt-3">
                                    <label htmlFor="avatar-upload-view" className="cursor-pointer inline-block">
                                        <span className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm">
                                            {avatarLoading ? 'Uploading...' : 'Choose File'}
                                        </span>
                                        <input
                                            id="avatar-upload-view"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                            disabled={avatarLoading}
                                            className="hidden"
                                        />
                                    </label>
                                    <p className="text-xs text-gray-500 mt-1">Max 10MB</p>
                                </div>
                                <h3 className="text-lg font-semibold mt-3">{user.name}</h3>
                                <p className="text-sm text-gray-600">{user.email}</p>
                                <Button className="mt-4" onClick={() => setIsEditing(true)}>Edit Profile</Button>
                            </div>
                            <div className="md:col-span-2">
                                <h3 className="text-lg font-semibold mb-2">Account Details</h3>
                                <p className="text-gray-600">Manage your account information, addresses and payment methods.</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* CONFIRMATION MODAL */}
            {showDeletionConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="flex items-center mb-4">
                            <div className="flex-shrink-0">
                                <svg className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="ml-3 text-xl font-bold text-gray-900">
                                Confirm Account Deletion Request
                            </h3>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-4">
                                ⚠️ <strong>Important:</strong> Once you submit this request, you cannot cancel it.
                                An admin will review and process your request.
                            </p>

                            {/* Reason Input */}
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason for deletion <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={deletionReason}
                                onChange={(e) => setDeletionReason(e.target.value)}
                                placeholder="Please tell us why you want to delete your account..."
                                rows={4}
                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                required
                            />

                            {/* Confirmation Text Input */}
                            <label className="block text-sm font-medium text-gray-700 mt-4 mb-2">
                                Type <span className="font-mono font-bold">DELETE</span> to confirm
                            </label>
                            <input
                                type="text"
                                value={confirmationText}
                                onChange={(e) => setConfirmationText(e.target.value)}
                                placeholder="Type DELETE"
                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                required
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleRequestDeletion}
                                disabled={isSubmitting || confirmationText !== 'DELETE' || !deletionReason.trim()}
                                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${confirmationText === 'DELETE' && deletionReason.trim()
                                    ? 'bg-red-600 hover:bg-red-700 text-white'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Request'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowDeletionConfirm(false);
                                    setDeletionReason('');
                                    setConfirmationText('');
                                }}
                                disabled={isSubmitting}
                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;

