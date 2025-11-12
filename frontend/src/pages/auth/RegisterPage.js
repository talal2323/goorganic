'use client'

import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import AuthLayout from './AuthLayout';
import { Button } from '@/components/common/UIComponents';
import api from '@/utils/api'; // API client

const RegisterPage = () => {
    const { dispatch } = useAppContext();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const [stage, setStage] = useState('register'); // register | verify
    const [otp, setOtp] = useState('');
    const [pendingUserId, setPendingUserId] = useState('');
    const [isClient, setIsClient] = useState(false);
    const [showAuthLinks, setShowAuthLinks] = useState(false);

    // Initialize pendingUserId from localStorage on mount
    useEffect(() => {
        setIsClient(true);
        setPendingUserId(localStorage.getItem('pendingUserId') || '');
        setShowAuthLinks(!localStorage.getItem('authToken'));
    }, []);

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.post('/users/register-customer', { name, email, password });
            // data: { message, userId }
            setPendingUserId(data.userId);
            localStorage.setItem('pendingUserId', data.userId);
            setStage('verify');
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyEmail = async (e) => {
        e.preventDefault();
        if (!pendingUserId) {
            setError('Missing pending user id. Please re-register.');
            setStage('register');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.post('/users/verify-email', { otp, userId: pendingUserId });
            // data: { message, _id, name, email, roles, accessToken }
            const user = {
                id: data._id,
                name: data.name,
                email: data.email,
                roles: data.roles || [],
                accessToken: data.accessToken,
            };
            localStorage.setItem('userInfo', JSON.stringify(user));
            localStorage.removeItem('pendingUserId');
            dispatch({ type: 'LOGIN', payload: user });
            dispatch({ type: 'SET_PAGE', payload: 'Shop' });
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title={stage === 'register' ? 'Join Our Community' : 'Verify Your Email'}>
            {stage === 'register' && (
                <form onSubmit={handleRegister} className="space-y-4 mt-6">
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
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
                        <label className="block text-sm font-medium text-gray-700">Email</label>
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
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-secondary focus:border-secondary"
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <Button type="submit" className="w-full mt-6" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                </form>
            )}
            {stage === 'verify' && (
                <form onSubmit={handleVerifyEmail} className="space-y-4 mt-6">
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <p className="text-sm text-gray-600">We've sent a 6-digit verification code to your email. Enter it below to activate your account.</p>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">OTP Code</label>
                        <input
                            type="text"
                            required
                            maxLength={6}
                            className="mt-1 tracking-widest text-center block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-secondary focus:border-secondary"
                            placeholder="123456"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                        />
                    </div>
                    <Button type="submit" className="w-full mt-4" disabled={loading}>
                        {loading ? 'Verifying...' : 'Verify Email'}
                    </Button>
                    <div className="text-xs text-center mt-2">
                        <button type="button" disabled={loading} onClick={() => setStage('register')} className="text-gray-500 hover:underline">Back to registration</button>
                    </div>
                </form>
            )}
            {isClient && showAuthLinks && (
                <p className="text-sm mt-4 text-center">
                    Already have an account?
                    <button type="button" onClick={(e) => { e.preventDefault(); dispatch({ type: 'SET_PAGE', payload: 'Login' }); }} className="ml-1 text-primary font-semibold hover:underline">
                        Log in
                    </button>
                </p>
            )}
            {isClient && showAuthLinks && (
                <div className="text-sm mt-2 text-center">
                    <button type="button" onClick={(e) => { e.preventDefault(); dispatch({ type: 'SET_PAGE', payload: 'VendorRegister' }); }} className="text-secondary font-semibold hover:underline">
                        Register as a Vendor &rarr;
                    </button>
                </div>
            )}
        </AuthLayout>
    );
};

export default RegisterPage;
