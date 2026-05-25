import express from 'express';
const router = express.Router();

import {
    getSubscriptionBoxes,
    getSubscriptionBoxById,
    subscribeToSubscriptionBox,
} from '../controllers/subscriptionBoxController.js';

import { protect } from '../middleware/authMiddleware.js';

router.get('/', getSubscriptionBoxes);
router.get('/:id', getSubscriptionBoxById);
router.post('/:id/subscribe', protect, subscribeToSubscriptionBox);

export default router;
