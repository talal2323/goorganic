import express from 'express';
const router = express.Router();
import {
    getVendorStats,
    getSalesOverview,
    registerVendor,
    addCertification,
    deleteCertification,
    getRecentActivity,
    addShopImage,
    deleteShopImage,
    getAvailablePlans,
    getSubscriptionUsage,
    getMyVendorOrders,
    updateOrderStatus,
    acceptOrder,
    cancelOrder
} from '../controllers/vendorController.js';
import {
    createSubscriptionCheckout,
    verifySubscriptionSession,
    cancelStripeSubscription
} from '../controllers/subscriptionPaymentController.js';
import { protect, vendor, premiumVendor, isApprovedVendor } from '../middleware/authMiddleware.js';

router.post('/register', registerVendor);
router.use(protect, vendor);

router.get('/dashboard/stats', isApprovedVendor, premiumVendor, getVendorStats);
router.get('/dashboard/sales-overview', isApprovedVendor, premiumVendor, getSalesOverview);
router.get('/dashboard/activity', isApprovedVendor, premiumVendor, getRecentActivity);
router.get('/subscriptions/plans', isApprovedVendor, getAvailablePlans);
router.get('/profile/subscription-usage', isApprovedVendor, getSubscriptionUsage);

// Stripe Subscription Routes (One-time payment, manual renewal)
router.post('/subscriptions/create-checkout', isApprovedVendor, createSubscriptionCheckout);
router.get('/subscriptions/verify-session/:sessionId', isApprovedVendor, verifySubscriptionSession);
router.post('/subscriptions/cancel-stripe', isApprovedVendor, cancelStripeSubscription);
router.get('/orders', isApprovedVendor, getMyVendorOrders);
router.put('/orders/:id/status', isApprovedVendor, updateOrderStatus);
router.put('/orders/:id/accept', isApprovedVendor, acceptOrder);
router.put('/orders/:id/cancel', isApprovedVendor, cancelOrder);

router.route('/profile/shop-images')
    .post(isApprovedVendor, addShopImage);

router.route('/profile/shop-images/:img_id')
    .delete(isApprovedVendor, deleteShopImage);

router.route('/profile/certifications')
    .post(isApprovedVendor, addCertification);

router.route('/profile/certifications/:cert_id')
    .delete(isApprovedVendor, deleteCertification);


export default router;