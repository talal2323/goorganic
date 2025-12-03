'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import AuthLayout from '@/components/layouts/AuthLayout';
import { Button } from '@/components/common/UIComponents';
import { login } from '@/utils/userApi';
import { showToast } from '@/utils/toast';
import { setCookie } from '@/utils/cookies';

const LoginPage = () => {
    const router = useRouter();
    const { dispatch } = useAppContext();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [showAuthLinks, setShowAuthLinks] = useState(false);

    useEffect(() => {
        setIsClient(true);
        setShowAuthLinks(!localStorage.getItem('authToken'));
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = await login({ email, password });
            // Normalize backend response into a single user object
            const user = {
                id: data._id,
                name: data.name,
                email: data.email,
                roles: data.roles || [],
                vendorStatus: data.vendorStatus || null,
                rejectionReason: data.rejectionReason || null,
                accessToken: data.accessToken,
            };

            // Persist and update global state
            localStorage.setItem('authToken', data.accessToken);
            localStorage.setItem('user', JSON.stringify(user));

            // Set cookies for middleware
            setCookie('authToken', data.accessToken);
            setCookie('user', encodeURIComponent(JSON.stringify(user)));

            dispatch({ type: 'LOGIN', payload: user });

            // Show success toast
            showToast.success(`Welcome back, ${user.name || 'User'}!`);

            // Redirect based on primary role
            const roles = user.roles || [];
            if (roles.includes('admin')) {
                router.push('/admin');
            } else if (roles.includes('vendor')) {
                router.push('/vendor');
            } else {
                router.push('/shop');
            }
        } catch (err) {
            const errorData = err.response?.data;

            // Special handling for deleted accounts
            if (errorData?.accountDeleted) {
                setError(errorData.message);
                showToast.error(errorData.message, {
                    duration: 6000,
                    icon: '🚫'
                });
                return;
            }

            const errorMsg = errorData?.message || err.message;
            setError(errorMsg);
            showToast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="Welcome Back">
            <form onSubmit={handleLogin} className="space-y-6 mt-6">
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-secondary focus:border-secondary"
                        placeholder="Enter your email"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                        type="password"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-secondary focus:border-secondary"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div className="text-right text-sm">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            router.push('/auth/forgot-password');
                        }}
                        className="text-primary hover:underline"
                    >
                        Forgot Password?
                    </button>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </Button>
            </form>
            {isClient && showAuthLinks && (
                <p className="text-sm mt-4 text-center">
                    Don't have an account?
                    <button type="button" onClick={(e) => { e.preventDefault(); router.push('/auth/register'); }} className="ml-1 text-primary font-semibold hover:underline">
                        Sign up
                    </button>
                </p>
            )}
            {isClient && showAuthLinks && (
                <p className="text-sm mt-2 text-center">
                    Want to be a Vendor?
                    <button type="button" onClick={(e) => { e.preventDefault(); router.push('/auth/vendor-register'); }} className="ml-1 text-secondary font-semibold hover:underline">
                        Register Here
                    </button>
                </p>
            )}
        </AuthLayout>
    );
};

export default LoginPage;

