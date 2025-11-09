import express from 'express';
const router = express.Router();
import {
    createFaq,
    getAllFaqs,
    updateFaq,
    deleteFaq
} from '../controllers/faqController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

// --- Public Route (for all users to see) ---
router.get('/', getAllFaqs);

// --- Admin-Only Routes (for management) ---
router.post('/', protect, isAdmin, createFaq);
router.route('/:id')
    .put(protect, isAdmin, updateFaq)
    .delete(protect, isAdmin, deleteFaq);

export default router;