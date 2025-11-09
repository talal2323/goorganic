import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import AuthLayout from './AuthLayout';
import { Button } from '../../components/common/UIComponents';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const LoginPage = () => {
    const { dispatch } = useAppContext();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data } = await api.post('/users/login', { email, password });
            // Normalize backend response into a single user object
            const user = {
                id: data._id,
                name: data.name,
                email: data.email,
                roles: data.roles || [],
                accessToken: data.accessToken,
            };

            // Persist and update global state
            localStorage.setItem('userInfo', JSON.stringify(user));
            dispatch({ type: 'LOGIN', payload: user });

            // Redirect based on primary role
            const roles = user.roles || [];
            if (roles.includes('admin')) {
                dispatch({ type: 'SET_PAGE', payload: 'AdminDashboard' });
            } else if (roles.includes('vendor')) {
                dispatch({ type: 'SET_PAGE', payload: 'VendorDashboard' });
            } else {
                dispatch({ type: 'SET_PAGE', payload: 'Shop' });
            }
        } catch (err) {
            setError(err.response && err.response.data.message ? err.response.data.message : err.message);
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
                            dispatch({ type: 'SET_PAGE', payload: 'ForgotPassword' });
                            navigate('/forgot-password');
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
            {!localStorage.getItem('userInfo') && (
                <p className="text-sm mt-4 text-center">
                    Don't have an account?
                    <button type="button" onClick={(e) => { e.preventDefault(); dispatch({ type: 'SET_PAGE', payload: 'Register' }); }} className="ml-1 text-primary font-semibold hover:underline">
                        Sign up
                    </button>
                </p>
            )}
            {!localStorage.getItem('userInfo') && (
                <p className="text-sm mt-2 text-center">
                    Want to be a Vendor?
                    <button type="button" onClick={(e) => { e.preventDefault(); dispatch({ type: 'SET_PAGE', payload: 'VendorRegister' }); }} className="ml-1 text-secondary font-semibold hover:underline">
                        Register Here
                    </button>
                </p>
            )}
        </AuthLayout>
    );
};

export default LoginPage;
