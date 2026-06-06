import express from 'express';
const router = express.Router();
import { uploadFile } from '../controllers/uploadController.js';

import {
    uploadProductImage,
    uploadCnic,
    uploadCertification,
    uploadAvatar,
    uploadShopImage,
    uploadDisputeProof
} from '../utils/fileUpload.js';



// Route for uploading a product image
router.post('/product', uploadProductImage.single('image'), uploadFile);

// Route for uploading a vendor's CNIC
router.post('/cnic/front', uploadCnic.single('cnic_file'), uploadFile);

// Route for uploading the BACK of a vendor's CNIC
router.post('/cnic/back', uploadCnic.single('cnic_file'), uploadFile);

// Route for uploading a vendor's certification
router.post('/certification', uploadCertification.single('certification_file'), uploadFile);

// Route for uploading a user's avatar
router.post('/avatar', uploadAvatar.single('avatar_file'), uploadFile);

// Route for uploading general shop/farm images
router.post('/shop-image', uploadShopImage.single('shop_image_file'), uploadFile);

// Route for uploading a dispute proof image
router.post('/dispute-proof', uploadDisputeProof.single('proof_image_file'), uploadFile);

export default router;