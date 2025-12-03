'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import AuthLayout from '@/components/layouts/AuthLayout';
import { Button } from '@/components/common/UIComponents';
import { verifyEmail } from '@/utils/userApi';
import { setCookie } from '@/utils/cookies';

// Unified OTP verification component for both customer + vendor flows.
// Reads pending user id from sessionStorage (vendor) or localStorage (customer fallback) for resilience.
const OTPVerification = () => {
    const router = useRouter();
    const { dispatch } = useAppContext();
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const resolvePendingUserId = () => {
        if (typeof window === 'undefined') return null;
        return sessionStorage.getItem('pendingVerifyUserId') || localStorage.getItem('pendingUserId');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const code = otp.trim();
        if (code.length !== 6) return;
        const userId = resolvePendingUserId();
        if (!userId) {
            setError('Missing user reference. Please register again.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const data = await verifyEmail(code, userId);

            const userPayload = {
                _id: data._id,
                name: data.name,
                email: data.email,
                roles: data.roles,
                accessToken: data.accessToken,
                vendorStatus: data.vendorStatus || null,
                rejectionReason: data.rejectionReason || null,
            };

            // Store user data and token
            localStorage.setItem('user', JSON.stringify(userPayload));
            localStorage.setItem('authToken', data.accessToken);

            // Set cookies for middleware
            setCookie('authToken', data.accessToken);
            setCookie('user', encodeURIComponent(JSON.stringify(userPayload)));

            // Clean up any pending IDs
            sessionStorage.removeItem('pendingVerifyUserId');
            localStorage.removeItem('pendingUserId');

            dispatch({ type: 'LOGIN', payload: userPayload });

            // Redirect based on user role
            if (data.roles === 'vendor') {
                router.push('/vendor');
            } else if (data.roles === 'admin') {
                router.push('/admin');
            } else {
                router.push('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        const userId = resolvePendingUserId();
        if (!userId) return;
        // Placeholder: backend does not yet expose resend endpoint.
        // Proposed endpoint: POST /api/v1/users/resend-otp { userId }
        // For now just provide optimistic UI feedback.
        setError(null);
        // eslint-disable-next-line no-alert
        alert('Resend not yet implemented on backend.');
    };

    return (
        <AuthLayout title="Verify Your Email">
            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
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
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        onInput={(e) => { if (e.target.value.length === 6) { /* optional auto-submit */ } }}
                    />
                </div>
                <Button type="submit" className="w-full mt-4" disabled={loading || otp.length !== 6}>
                    {loading ? 'Verifying...' : 'Verify Email'}
                </Button>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <button type="button" onClick={() => router.push('/auth/vendor-register')} className="hover:underline">Back</button>
                    <button type="button" onClick={handleResend} className="text-primary hover:underline">Resend Code</button>
                </div>
            </form>
        </AuthLayout>
    );
};

export default OTPVerification;

