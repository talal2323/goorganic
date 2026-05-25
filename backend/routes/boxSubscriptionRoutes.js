import express from 'express';
const router = express.Router();

import {
    getMyBoxSubscriptions,
    cancelBoxSubscription,
    updateBoxSubscriptionAddress,
} from '../controllers/boxSubscriptionController.js';

import { protect } from '../middleware/authMiddleware.js';

router.use(protect);

router.get('/', getMyBoxSubscriptions);
router.put('/:id/cancel', cancelBoxSubscription);
router.put('/:id/address', updateBoxSubscriptionAddress);

export default router;
