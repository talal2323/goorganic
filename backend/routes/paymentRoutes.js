import express from 'express';
const router = express.Router();
import { createPaymentIntent, getPaymentStatus, handleWebhook } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

// Create payment intent
router.post('/create-payment-intent', protect, createPaymentIntent);

// Get payment status
router.get('/payment-status/:paymentIntentId', protect, getPaymentStatus);

// Webhook endpoint (webhook secret should be configured in .env)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

export default router;
