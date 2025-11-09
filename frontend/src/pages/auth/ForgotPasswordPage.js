import React, { useState, useEffect } from 'react';
import { Button, Input } from '../../components/common/UIComponents';
import { useAppContext } from '../../context/AppContext';
import { Header } from '../../components/layouts/Header';
import Footer from '../../components/layouts/Footer';
import api from '../../utils/api';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [countdown, setCountdown] = useState(0);
    const { dispatch } = useAppContext();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const { data } = await api.post('/users/forgot-password', { email });
            setMessage(data.message || 'If a user with that email exists, a reset link has been sent.');
            setCountdown(600); // 10 minutes per backend message
        } catch (error) {
            setMessage(error.response?.data?.message || 'An error occurred. Please try again later.');
        }
    };

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    return (
        <>
            <Header />
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                    <h2 className="text-2xl font-bold mb-6 text-center">Forgot Password</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                        <Button type="submit" primary={true} className="w-full">Send Reset Link</Button>
                    </form>
                    {message && <p className="mt-4 text-sm text-center text-gray-600">{message}</p>}
                    {countdown > 0 && (
                        <p className="mt-2 text-sm text-center text-red-500">Reset link valid for {Math.ceil(countdown / 60)} min.</p>
                    )}
                    <div className="mt-6 text-center">
                        <Button primary={false} onClick={() => dispatch({ type: 'SET_PAGE', payload: 'Login' })}>
                            Back to Login
                        </Button>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default ForgotPasswordPage;
