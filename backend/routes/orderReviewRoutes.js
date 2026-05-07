import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    getOrderReviewEligibility,
    getProductReviews,
    createOrderReview,
    updateOrderReview,
    deleteOrderReview,
    getVendorOrderReviews,
    getAdminOrderReviews,
    updateOrderReviewStatus,
} from '../controllers/orderReviewController.js';

const router = express.Router();

// Public routes
router.get('/products/:productId', getProductReviews);

// Customer routes
router.get('/orders/:orderId/eligibility', protect, getOrderReviewEligibility);
router.post('/orders/:orderId', protect, createOrderReview);
router.put('/:reviewId', protect, updateOrderReview);
router.delete('/:reviewId', protect, deleteOrderReview);

// Vendor routes
router.get('/vendors/me', protect, getVendorOrderReviews);

// Admin routes
router.get('/admin', protect, getAdminOrderReviews);
router.patch('/:reviewId/status', protect, updateOrderReviewStatus);

export default router;
