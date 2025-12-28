'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/layouts/AuthLayout';
import { Button } from '@/components/common/UIComponents';
import { registerCustomer } from '@/utils/userApi';

const RegisterPage = () => {
    const router = useRouter();
    const [name, setName] = useState('');
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

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const data = await registerCustomer({ name, email, password });
            // data: { message, userId }
            localStorage.setItem('pendingUserId', data.userId);
            // Redirect to OTP page for verification
            router.push('/auth/otp');
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = name.trim() && email.trim() && password.trim();

    return (
        <AuthLayout title="Join Our Community">
            {(
                <form onSubmit={handleRegister} className="space-y-4 mt-6">
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-secondary focus:border-secondary"
                            placeholder="Enter your full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                        <input
                            type="email"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-secondary focus:border-secondary"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password <span className="text-red-500">*</span></label>
                        <input
                            type="password"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-secondary focus:border-secondary"
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <Button type="submit" className="w-full mt-6" disabled={loading || !isFormValid}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                </form>
            )}
            {isClient && showAuthLinks && (
                <p className="text-sm mt-4 text-center">
                    Already have an account?
                    <button type="button" onClick={(e) => { e.preventDefault(); router.push('/auth/login'); }} className="ml-1 text-primary font-semibold hover:underline">
                        Log in
                    </button>
                </p>
            )}
            {isClient && showAuthLinks && (
                <div className="text-sm mt-2 text-center">
                    <button type="button" onClick={(e) => { e.preventDefault(); router.push('/auth/vendor-register'); }} className="text-secondary font-semibold hover:underline">
                        Register as a Vendor &rarr;
                    </button>
                </div>
            )}
        </AuthLayout>
    );
};

export default RegisterPage;

