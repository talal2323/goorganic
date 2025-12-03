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
    requestSubscriptionUpgrade,
    cancelSubscription,
    getMyVendorOrders,
    updateOrderStatus
} from '../controllers/vendorController.js';
import { protect, vendor, premiumVendor, isApprovedVendor } from '../middleware/authMiddleware.js';

router.post('/register', registerVendor);
router.use(protect, vendor);

router.get('/dashboard/stats', isApprovedVendor, premiumVendor, getVendorStats);
router.get('/dashboard/sales-overview', isApprovedVendor, premiumVendor, getSalesOverview);
router.get('/dashboard/activity', isApprovedVendor, premiumVendor, getRecentActivity);
router.get('/subscriptions/plans', isApprovedVendor, getAvailablePlans);
router.get('/profile/subscription-usage', isApprovedVendor, getSubscriptionUsage);
router.post('/subscriptions/request-upgrade', isApprovedVendor, requestSubscriptionUpgrade);
router.post('/subscriptions/cancel', isApprovedVendor, cancelSubscription);
router.get('/orders', isApprovedVendor, getMyVendorOrders);
router.put('/orders/:id/status', isApprovedVendor, updateOrderStatus);

router.route('/profile/shop-images')
    .post(isApprovedVendor, addShopImage);

router.route('/profile/shop-images/:img_id')
    .delete(isApprovedVendor, deleteShopImage);

router.route('/profile/certifications')
    .post(isApprovedVendor, addCertification);

router.route('/profile/certifications/:cert_id')
    .delete(isApprovedVendor, deleteCertification);


export default router;