import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Button } from '../../components/common/UIComponents';
import api from '../../utils/api';

const ProfilePage = () => {
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

    useEffect(() => {
        const fetchUserProfile = async () => {
            setLoading(true);
            try {
                const { data } = await api.get('/users/profile');
                setUser(data);
                dispatch({ type: 'UPDATE_USER', payload: data });
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
            dispatch({ type: 'SET_PAGE', payload: 'Login' });
        }
    }, [state.isLoggedIn, dispatch]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Prepare payload with shippingAddress object separated (avoid sending undefined nested objects)
            const { shippingAddress, ...rest } = user;
            const payload = { ...rest, shippingAddress };
            const { data } = await api.put('/users/profile', payload);
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
        setAvatarLoading(true);
        setError(null);
        try {
            const fd = new FormData();
            fd.append('avatar_file', file);
            // Correct endpoint: backend mounts uploadRoutes at /api/v1/upload, avatar route is POST /avatar
            const { data: upload } = await api.post('/upload/avatar', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const avatar = { public_id: upload.public_id, url: upload.url };
            const { data: updated } = await api.put('/users/profile', { avatar });
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
            const { data } = await api.put('/users/profile/change-password', pwdForm);
            setPwdMessage(data.message || 'Password changed successfully');
            setPwdForm({ currentPassword: '', newPassword: '' });
        } catch (err) {
            setPwdError(err.response?.data?.message || err.message);
        } finally {
            setPwdLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('This action is permanent. Delete your account?')) return;
        setLoading(true);
        try {
            await api.delete('/users/profile');
            localStorage.removeItem('userInfo');
            dispatch({ type: 'LOGOUT' });
            dispatch({ type: 'SET_PAGE', payload: 'Home' });
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
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
                                    <input type="file" accept="image/*" onChange={handleAvatarChange} disabled={avatarLoading} />
                                    <input
                                        type="text"
                                        name="name"
                                        value={user.name || ''}
                                        onChange={handleInputChange}
                                        className="text-lg font-semibold text-center w-full"
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
                                        <Button className="bg-red-500 hover:bg-red-600" onClick={handleDeleteAccount} disabled={loading}>Delete Account</Button>
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
                                <h3 className="text-lg font-semibold">{user.name}</h3>
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
        </div>
    );
};

export default ProfilePage;
