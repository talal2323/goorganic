// routes/categoryRoutes.js
import express from 'express';
const router = express.Router();
import {
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory
} from '../controllers/categoryController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

// --- Public Route ---
router.get('/', getAllCategories); // Anyone can view categories

// --- Admin-Only Routes ---
router.post('/', protect, isAdmin, createCategory);
router.route('/:id')
    .put(protect, isAdmin, updateCategory)
    .delete(protect, isAdmin, deleteCategory);

export default router;