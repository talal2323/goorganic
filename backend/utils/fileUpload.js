import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer storage for different file types
const createStorage = (folderName) => {
    return new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: `goorganic/${folderName}`, // sub-folder in Cloudinary account
            allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'],
        },
    });
};

//  separate upload middleware for each use case
export const uploadCnic = multer({ storage: createStorage('cnic_images') });
export const uploadCertification = multer({ storage: createStorage('certifications') });
export const uploadAvatar = multer({ storage: createStorage('avatars') });
export const uploadShopImage = multer({ storage: createStorage('shop_images') });
export const uploadProductImage = multer({ storage: createStorage('product_images') });