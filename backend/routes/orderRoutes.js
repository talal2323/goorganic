import express from 'express';
const router = express.Router();
import { createOrder, getMyOrders } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);

export default router;