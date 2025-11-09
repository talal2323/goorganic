import express from 'express';
const router = express.Router();
import {
    approveVendor,
    rejectVendor,
    createSubscriptionPlan,
    upgradeVendorSubscription,
    getAllVendorsForAdmin,
    getAllProductsForAdmin,
    updateProductStatus,
    getAllCustomers,
    getAdminDashboardStats,
    getAllSubscriptionPlans,
    updateSubscriptionPlan,
    deleteSubscriptionPlan,
    getAllOrders
} from '../controllers/adminController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';
router.use(protect, isAdmin);

router.get('/dashboard/stats', getAdminDashboardStats);

router.get('/customers', getAllCustomers);

router.get('/products', getAllProductsForAdmin);
router.put('/products/:id/status', updateProductStatus);

router.get('/vendors', getAllVendorsForAdmin);

router.put('/vendors/:id/approve', approveVendor);
router.put('/vendors/:id/reject', rejectVendor);

router.put('/vendors/:id/upgrade', upgradeVendorSubscription);

router.get('/orders', getAllOrders);

router.route('/subscriptions/:id')
    .put(updateSubscriptionPlan)
    .delete(deleteSubscriptionPlan);

router.route('/subscriptions')
    .post(createSubscriptionPlan)
    .get(getAllSubscriptionPlans);

export default router;