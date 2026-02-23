import express from 'express';
const router = express.Router();
import { createOrder, getMyOrders, getOrderById, downloadInvoice } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.get('/:id/invoice', protect, downloadInvoice);

export default router;