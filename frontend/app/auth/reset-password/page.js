'use client'

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import AuthLayout from '@/components/layouts/AuthLayout';
import { Button } from '@/components/common/UIComponents';
import { resetPassword } from '@/utils/userApi';

const ResetPasswordPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { dispatch } = useAppContext();
    const [token, setToken] = useState('');

    useEffect(() => {
        // Extract token from URL query parameter
        const tokenParam = searchParams.get('token');
        if (tokenParam) {
            setToken(tokenParam);
        }
    }, [searchParams]);
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setMessage('');
        if (password !== confirm) {
            setError('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            const data = await resetPassword(token, password);
            // If backend returns accessToken we could log the user in; for now, go to login
            setMessage('Password reset successful. You can now login.');
            setTimeout(() => router.push('/auth/login'), 1000);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="Reset Password">
            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {message && <p className="text-green-600 text-sm">{message}</p>}
                <div>
                    <label className="block text-sm font-medium text-gray-700">New Password</label>
                    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                    <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3" />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Resetting...' : 'Reset Password'}
                </Button>
            </form>
        </AuthLayout>
    );
};

export default ResetPasswordPage;

