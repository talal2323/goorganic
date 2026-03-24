import express from 'express';
const router = express.Router();
import {
    createProduct,
    getFeaturedProducts,
    getProductById,
    getFrequentlyBoughtTogether,
    updateProduct,
    deleteProduct,
    getAllProducts,
    getMyProducts
} from '../controllers/productController.js';
import { protect, } from '../middleware/authMiddleware.js';
import { isApprovedVendor } from '../middleware/authMiddleware.js';

router.get('/my-products', protect, isApprovedVendor, getMyProducts);

//  route to get featured products for the homepage
router.get('/featured', getFeaturedProducts);
router.get('/:id/frequently-bought-together', getFrequentlyBoughtTogether);

//  route for vendors to create a new product
router.post('/new', protect, isApprovedVendor, createProduct);

router.get('/', getAllProducts);

router.route('/:id')
    .get(getProductById)
    .put(protect, isApprovedVendor, updateProduct)
    .delete(protect, isApprovedVendor, deleteProduct);

export default router;