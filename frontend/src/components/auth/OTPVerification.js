import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import AuthLayout from './AuthLayout';
import { Button } from '../common/UIComponents';
import api from '../../utils/api';

const OTPVerification = () => {
  const { dispatch } = useAppContext();
  const [otp, setOtp] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.trim();
    const userId = sessionStorage.getItem('pendingVerifyUserId');
    if (!userId) {
      alert('Missing user reference. Please register again.');
      dispatch({ type: 'SET_PAGE', payload: 'VendorRegister' });
      return;
    }
    try {
      const { data } = await api.post('/users/verify-email', { otp: code, userId });
      // On success, store user info + accessToken similar to login flow
      const userPayload = {
        _id: data._id,
        name: data.name,
        email: data.email,
        roles: data.roles,
        accessToken: data.accessToken,
      };
      localStorage.setItem('userInfo', JSON.stringify(userPayload));
      dispatch({ type: 'LOGIN', payload: userPayload });
      sessionStorage.removeItem('pendingVerifyUserId');
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <AuthLayout title="Verify Your Email">
      <form onSubmit={handleSubmit} className="space-y-4 mt-6">
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
          />
        </div>
        <Button type="submit" className="w-full mt-4">Verify Email</Button>
        <div className="text-xs text-center mt-2">
          <button type="button" onClick={() => dispatch({ type: 'SET_PAGE', payload: 'VendorRegister' })} className="text-gray-500 hover:underline">Back to registration</button>
        </div>
        <p className="text-xs text-gray-500 text-center">Didn't receive the code? <button type="button" className="text-primary hover:underline" onClick={async (e) => { e.preventDefault(); const userId = sessionStorage.getItem('pendingVerifyUserId'); if (!userId) return; try { /* TODO: implement resend endpoint for vendors */ } catch { } }}>Resend</button></p>
      </form>
    </AuthLayout>
  );
};

export default OTPVerification;