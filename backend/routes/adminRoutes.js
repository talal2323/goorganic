import express from 'express';
const router = express.Router();
import {
    approveVendor,
    rejectVendor,
    createSubscriptionPlan,
    getAllVendorsForAdmin,
    getAllProductsForAdmin,
    updateProductStatus,
    getAllCustomers,
    getAdminDashboardStats,
    getAllSubscriptionPlans,
    updateSubscriptionPlan,
    deleteSubscriptionPlan,
    getAllOrders,
    getDeletionRequests,
    approveDeletion,
    rejectDeletion,
    restoreAccount,
    suspendUser,
    unsuspendUser,
    getCustomerLoyaltyHistory
} from '../controllers/adminController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';
router.use(protect, isAdmin);

router.get('/dashboard/stats', getAdminDashboardStats);

router.get('/customers', getAllCustomers);
router.get('/customers/:id/loyalty-history', getCustomerLoyaltyHistory);

router.get('/products', getAllProductsForAdmin);
router.put('/products/:id/status', updateProductStatus);

router.get('/vendors', getAllVendorsForAdmin);

router.put('/vendors/:id/approve', approveVendor);
router.put('/vendors/:id/reject', rejectVendor);

router.get('/orders', getAllOrders);

router.route('/subscriptions/:id')
    .put(updateSubscriptionPlan)
    .delete(deleteSubscriptionPlan);

router.route('/subscriptions')
    .post(createSubscriptionPlan)
    .get(getAllSubscriptionPlans);

// Account deletion management routes
router.get('/deletion-requests', getDeletionRequests);
router.put('/users/:userId/approve-deletion', approveDeletion);
router.put('/users/:userId/reject-deletion', rejectDeletion);
router.put('/users/:userId/restore', restoreAccount);

// User suspension routes
router.put('/users/:id/suspend', suspendUser);
router.put('/users/:id/unsuspend', unsuspendUser);

export default router;