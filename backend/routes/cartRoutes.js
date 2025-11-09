import express from 'express';
const router = express.Router();
import {
    getMyCart,
    addItemToCart,
    removeItemFromCart
} from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

router.use(protect);

router.route('/')
    .get(getMyCart)
    .post(addItemToCart);

router.route('/:productId')
    .delete(removeItemFromCart);

export default router;