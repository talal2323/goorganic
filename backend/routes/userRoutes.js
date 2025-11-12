import express from 'express';
const router = express.Router();

import {
    registerCustomer,
    loginUser,
    getUserProfile,
    updateUserProfile,
    changeUserPassword,
    forgotPassword,
    resetPassword,
    logoutUser,
    verifyEmail,
    getAllVendors,
    getVendorById,
    getFeaturedVendors,
    refreshAccessToken,
    requestAccountDeletion
} from '../controllers/userController.js';

import { protect } from '../middleware/authMiddleware.js';

router.get('/featured-vendors', getFeaturedVendors);
router.get('/vendors', getAllVendors);
router.get('/vendors/:id', getVendorById);
router.post('/register-customer', registerCustomer);
router.post('/verify-email', verifyEmail);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/refresh-token', refreshAccessToken);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

router.put('/profile/change-password', protect, changeUserPassword);

// Account deletion (soft delete with admin approval)
router.post('/request-deletion', protect, requestAccountDeletion);



export default router;