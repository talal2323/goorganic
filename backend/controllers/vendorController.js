import { v2 as cloudinary } from 'cloudinary';
import sendEmail from '../utils/sendEmail.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import { SubscriptionPlan } from '../models/subscriptionPlanModel.js';
import { SubOrder } from '../models/orderModel.js';

//     Get dashboard statistics for a logged-in vendor

export const getVendorStats = async (req, res) => {
    try {
        const vendorId = req.user._id;

        const revenueResult = await SubOrder.aggregate([
            { $match: { vendor: vendorId, orderStatus: 'Delivered' } },
            { $group: { _id: null, totalRevenue: { $sum: '$subTotal' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const salesMonthResult = await SubOrder.aggregate([
            {
                $match: {
                    vendor: vendorId,
                    orderStatus: 'Delivered',
                    createdAt: { $gte: startOfMonth }
                }
            },
            { $group: { _id: null, total: { $sum: '$subTotal' } } }
        ]);
        const salesThisMonth = salesMonthResult.length > 0 ? salesMonthResult[0].total : 0;

        const pendingOrders = await SubOrder.countDocuments({
            vendor: vendorId,
            orderStatus: 'Processing'
        });

        const totalProducts = await Product.countDocuments({ vendor: vendorId });

        res.status(200).json({
            totalRevenue,
            salesThisMonth,
            pendingOrders,
            totalProducts
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

//  Get monthly sales data for the line chart (TEMPORARY PLACEHOLDER)

export const getSalesOverview = async (req, res) => {
    try {
        const vendorId = req.user._id;

        const salesData = await SubOrder.aggregate([
            {
                $match: {
                    vendor: vendorId,
                    orderStatus: 'Delivered'
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    totalSales: { $sum: '$subTotal' }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            }
        ]);

        res.status(200).json(salesData);

    } catch (error) {
        res.status(500).json({ message: 'Server error fetching sales overview', error: error.message });
    }
};

//     Get recent activity feed for a vendor

export const getRecentActivity = async (req, res) => {
    try {
        const vendorId = req.user._id;
        const LOW_STOCK_THRESHOLD = 10;

        const recentProducts = await Product.find({ vendor: vendorId })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name createdAt');

        const lowStockProducts = await Product.find({
            vendor: vendorId,
            stock: { $lte: LOW_STOCK_THRESHOLD, $gt: 0 }
        })
            .limit(5)
            .select('name stock');

        const recentOrders = await SubOrder.find({ vendor: vendorId })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate({
                path: 'order',
                select: 'customer',
                populate: { path: 'customer', select: 'name' }
            });

        const activityFeed = [];

        recentProducts.forEach(product => {
            activityFeed.push({
                type: 'NEW_PRODUCT',
                message: `You added a new product: ${product.name}`,
                date: product.createdAt
            });
        });

        lowStockProducts.forEach(product => {
            activityFeed.push({
                type: 'LOW_STOCK',
                message: `Your product '${product.name}' is low on stock (${product.stock} left).`,
                date: new Date()
            });
        });

        recentOrders.forEach(order => {
            const customerName = order.order && order.order.customer ? order.order.customer.name : 'A customer';
            activityFeed.push({
                type: 'NEW_ORDER',
                message: `You received a new order from ${customerName}.`,
                date: order.createdAt
            });
        });

        activityFeed.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.status(200).json(activityFeed.slice(0, 10));

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

//     Add a new certification to a vendor's profile

export const addCertification = async (req, res) => {
    try {
        const { name, public_id, url } = req.body;

        if (!name || !public_id || !url) {
            return res.status(400).json({ message: 'Please provide all certification details.' });
        }

        const vendor = await User.findById(req.user._id);

        if (!vendor) {
            return res.status(404).json({ message: 'User not found.' });
        }

        vendor.certifications.push({ name, public_id, url });
        await vendor.save();

        res.status(200).json({
            message: 'Certification added successfully.',
            certifications: vendor.certifications
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

//     Delete a certification from a vendor's profile

export const deleteCertification = async (req, res) => {
    try {
        const vendor = await User.findById(req.user._id);

        if (!vendor) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const certToDelete = vendor.certifications.find(
            (cert) => cert._id.toString() === req.params.cert_id
        );

        if (!certToDelete) {
            return res.status(404).json({ message: 'Certification not found.' });
        }

        await cloudinary.uploader.destroy(certToDelete.public_id);

        vendor.certifications = vendor.certifications.filter(
            (cert) => cert._id.toString() !== req.params.cert_id
        );

        await vendor.save();

        res.status(200).json({ message: 'Certification deleted successfully.' });

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

//    Register a new vendor

export const registerVendor = async (req, res) => {
    try {
        const {
            name, email, password, phoneNumber, shopName, shopDescription,
            businessCategory, productCategories, shopAddress, certifications, cnic
        } = req.body;

        if (
            !name || !email || !password || !phoneNumber || !shopName ||
            !shopDescription || !businessCategory || !productCategories ||
            !shopAddress || !shopAddress.city || !shopAddress.address ||
            !certifications || certifications.length === 0 || !cnic || !cnic.front || !cnic.front.url || !cnic.back || !cnic.back.url
        ) {
            return res.status(400).json({ message: 'Please ensure all fields, including both front and back CNIC and certifications, are provided.' });
        }
        let user = await User.findOne({ email });
        if (user) {
            if (user.isEmailVerified) {
                return res.status(400).json({ message: 'A user with this email already exists' });
            }
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            user.emailOtp = otp;
            user.emailOtpExpires = Date.now() + 15 * 60 * 1000;
            await user.save({ validateBeforeSave: false });

            await sendEmail({
                email: user.email,
                subject: 'Your New GOorganic Vendor Verification Code',
                message: `Welcome back! Your new verification code is: ${otp}`,
            });

            return res.status(200).json({
                message: 'This email is already registered but not verified. We have sent a new OTP.',
                userId: user._id
            });
        }

        const newVendor = await User.create({
            name, email, password, phoneNumber, shopName,
            shopDescription, businessCategory, productCategories, shopAddress,
            certifications,
            cnic,
            roles: ['customer', 'vendor'], // Assign both roles
            vendorStatus: 'Pending'
        });
        if (newVendor) {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            newVendor.emailOtp = otp;
            newVendor.emailOtpExpires = Date.now() + 15 * 60 * 1000;
            await newVendor.save({ validateBeforeSave: false });

            await sendEmail({
                email: newVendor.email,
                subject: 'Verify Your GOorganic Vendor Account',
                message: `Your verification code is: ${otp}`,
            });

            try {
                const adminReviewLink = `${process.env.FRONTEND_URL}/admin/vendors`;
                await sendEmail({
                    email: process.env.ADMIN_EMAIL,
                    subject: 'New Vendor Application - GOorganic',
                    message: `A new vendor has registered on GOorganic and is awaiting approval.\n\n` +
                        `Name: ${newVendor.name}\n` +
                        `Shop Name: ${newVendor.shopName}\n` +
                        `Email: ${newVendor.email}\n\n` +
                        `Please review their application here: ${adminReviewLink}`
                });
            } catch (emailError) {
                console.error('Failed to send admin notification email:', emailError);
            }

            res.status(201).json({
                message: 'Vendor registration successful! Please check your email for a verification code.',
                userId: newVendor._id
            });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

//     Add a new shop image to a vendor's profile

export const addShopImage = async (req, res) => {
    try {
        const { public_id, url } = req.body;

        if (!public_id || !url) {
            return res.status(400).json({ message: 'Please provide image details.' });
        }

        const vendor = await User.findById(req.user._id);

        if (!vendor) {
            return res.status(404).json({ message: 'User not found.' });
        }

        vendor.shopImages.push({ public_id, url });
        await vendor.save();

        res.status(200).json({
            message: 'Shop image added successfully.',
            shopImages: vendor.shopImages
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

//    Delete a shop image from a vendor's profile

export const deleteShopImage = async (req, res) => {
    try {
        const vendor = await User.findById(req.user._id);

        if (!vendor) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const imageToDelete = vendor.shopImages.find(
            (img) => img._id.toString() === req.params.img_id
        );

        if (!imageToDelete) {
            return res.status(404).json({ message: 'Image not found.' });
        }

        // Delete the file from Cloudinary
        await cloudinary.uploader.destroy(imageToDelete.public_id);

        // Remove the image from the array in the database
        vendor.shopImages = vendor.shopImages.filter(
            (img) => img._id.toString() !== req.params.img_id
        );

        await vendor.save();

        res.status(200).json({ message: 'Shop image deleted successfully.' });

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

//    Get all available subscription plans

export const getAvailablePlans = async (req, res) => {
    try {
        const plans = await SubscriptionPlan.find({});
        res.status(200).json(plans);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

//     Get a vendor's current subscription usage

export const getSubscriptionUsage = async (req, res) => {
    try {
        const vendor = req.user;

        // 1. Find the details of the vendor's current plan
        const planDetails = await SubscriptionPlan.findOne({ name: vendor.subscription.plan });
        if (!planDetails) {
            return res.status(404).json({ message: 'Subscription plan not found.' });
        }

        // 2. Count the vendor's current number of products
        const productCount = await Product.countDocuments({ vendor: vendor._id });

        res.status(200).json({
            planName: vendor.subscription.plan,
            productCount,
            productLimit: planDetails.productLimit,
            status: vendor.subscription.status,
            endDate: vendor.subscription.endDate
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

//  Get all orders for the logged-in vendor
export const getMyVendorOrders = async (req, res) => {
    try {
        const orders = await SubOrder.find({ vendor: req.user._id })
            .populate({
                path: 'order',
                select: 'shippingAddress customer',
                populate: { path: 'customer', select: 'name email' }
            })
            .populate('items.product', 'images')
            .sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const subOrder = await SubOrder.findById(req.params.id);

        if (!subOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (subOrder.vendor.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to update this order' });
        }

        subOrder.orderStatus = status;
        if (status === 'Delivered') {
            subOrder.deliveredAt = Date.now();
            // TODO: Update parent order payment status if all sub-orders are delivered
        }
        await subOrder.save();

        try {
            const customer = await User.findById(subOrder.order.customer);
            if (customer) {
                await sendEmail({
                    email: customer.email,
                    subject: `Your GoOrganic order status has been updated to: ${status}`,
                    message: `Hi ${customer.name},\n\nYour order for items from ${req.user.shopName} has been updated to: ${status}.\n\nYou can view your order details in your dashboard.`
                });
            }
        } catch (emailError) {
            console.error('Failed to send status update to customer:', emailError);
        }

        res.status(200).json(subOrder);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};