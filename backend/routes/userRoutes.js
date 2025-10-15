// routes/userRoutes.js

import express from 'express';
const router = express.Router();

import {
    registerCustomer,
    registerVendor,
    loginUser,
    verifyLoginEmailOtp,
    getUserProfile,
    updateUserProfile,
    changeUserPassword,
    getUserOrders,
    forgotPassword,
    resetPassword,
    toggleTwoFactorAuth,
    logoutUser,
    verifyEmail,
} from '../controllers/userController.js';

import { protect } from '../middleware/authMiddleware.js';

// --- AUTHENTICATION ---
router.post('/register-customer', registerCustomer);
router.post('/verify-email', verifyEmail);
router.post('/register-vendor', registerVendor); // Assuming you still have this
router.post('/login', loginUser);
router.post('/login/verify-otp', verifyLoginEmailOtp);
router.post('/logout', logoutUser);

// --- PASSWORD RESET ---
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// --- USER PROFILE & ACTIVITY (Protected Routes) ---
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

router.put('/profile/change-password', protect, changeUserPassword);
router.get('/profile/orders', protect, getUserOrders);

// --- 2FA SETUP (Protected Route) ---
router.post('/profile/2fa/toggle', protect, toggleTwoFactorAuth);


export default router;