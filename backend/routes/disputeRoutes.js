import express from 'express';
import { protect, vendor, isAdmin } from '../middleware/authMiddleware.js';
import {
    createDispute,
    getMyDisputes,
    getVendorDisputes,
    getAdminDisputes,
    updateDisputeStatus,
    addVendorComment
} from '../controllers/disputeController.js';

const router = express.Router();

router.post('/orders/:orderId', protect, createDispute);
router.get('/my', protect, getMyDisputes);
router.get('/vendor', protect, vendor, getVendorDisputes);
router.get('/admin', protect, isAdmin, getAdminDisputes);
router.patch('/:disputeId/status', protect, isAdmin, updateDisputeStatus);
router.patch('/:disputeId/vendor-comment', protect, vendor, addVendorComment);

export default router;