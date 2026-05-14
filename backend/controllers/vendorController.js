import { v2 as cloudinary } from 'cloudinary';
import sendEmail from '../utils/sendEmail.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import { SubscriptionPlan } from '../models/subscriptionPlanModel.js';
import { Order, SubOrder } from '../models/orderModel.js';
import { createNotification } from './notificationController.js';
import LoyaltyTransaction from '../models/loyaltyTransactionModel.js';

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
                subject: '🔐 Your New GOorganic Vendor Verification Code',
                message: `Welcome back! Your new verification code is: ${otp}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
                        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <h2 style="color: #2d6a4f; margin-top: 0;">🔐 New Vendor Verification Code</h2>
                            <p style="font-size: 16px; color: #374151;">Welcome back, ${user.name}!</p>
                            <p style="font-size: 16px; color: #374151;">Your new verification code is:</p>
                            <div style="background-color: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                                <h1 style="color: #065f46; margin: 0; font-size: 36px; letter-spacing: 8px; font-family: monospace;">${otp}</h1>
                            </div>
                            <p style="font-size: 14px; color: #6b7280;">This code will expire in <strong>15 minutes</strong>.</p>
                            <p style="font-size: 14px; color: #6b7280; margin-top: 30px; text-align: center;">Thank you for being a vendor partner!<br/>GOorganic Team 🌱</p>
                        </div>
                    </div>
                `
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
                subject: '🎉 Verify Your GOorganic Vendor Account',
                message: `Your verification code is: ${otp}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
                        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <h2 style="color: #2d6a4f; margin-top: 0;">🎉 Welcome to GOorganic Vendor Community!</h2>
                            <p style="font-size: 16px; color: #374151;">Hi ${newVendor.name},</p>
                            <p style="font-size: 16px; color: #374151;">Thank you for registering as a vendor! Your application has been submitted successfully.</p>
                            <p style="font-size: 16px; color: #374151;">Please verify your email with this code:</p>
                            <div style="background-color: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                                <h1 style="color: #065f46; margin: 0; font-size: 36px; letter-spacing: 8px; font-family: monospace;">${otp}</h1>
                            </div>
                            <p style="font-size: 14px; color: #6b7280;">This code will expire in <strong>15 minutes</strong>.</p>
                            <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; margin-top: 20px;">
                                <p style="margin: 0; color: #1e40af; font-size: 14px;">📝 <strong>Next Steps:</strong> After verification, our admin team will review your application. You'll be notified via email once approved.</p>
                            </div>
                            <p style="font-size: 14px; color: #6b7280; margin-top: 30px; text-align: center;">Excited to have you on board!<br/>GOorganic Team 🌱</p>
                        </div>
                    </div>
                `
            });

            try {
                const adminReviewLink = `${process.env.FRONTEND_URL}/admin/vendors`;
                await sendEmail({
                    email: process.env.ADMIN_EMAIL,
                    subject: '🎉 New Vendor Application - GOorganic',
                    message: `A new vendor has registered on GOorganic and is awaiting approval.\n\nName: ${newVendor.name}\nShop Name: ${newVendor.shopName}\nEmail: ${newVendor.email}\n\nPlease review their application here: ${adminReviewLink}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
                            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                <h2 style="color: #2d6a4f; margin-top: 0;">🎉 New Vendor Application</h2>
                                <p style="font-size: 16px; color: #374151;">A new vendor has registered and is awaiting approval.</p>
                                <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2d6a4f;">
                                    <h4 style="color: #065f46; margin-top: 0;">Vendor Details:</h4>
                                    <p style="margin: 5px 0; color: #374151;"><strong>Name:</strong> ${newVendor.name}</p>
                                    <p style="margin: 5px 0; color: #374151;"><strong>Shop Name:</strong> ${newVendor.shopName}</p>
                                    <p style="margin: 5px 0; color: #374151;"><strong>Email:</strong> ${newVendor.email}</p>
                                    <p style="margin: 5px 0; color: #374151;"><strong>Business Category:</strong> ${newVendor.businessCategory}</p>
                                </div>
                                <p style="font-size: 14px; color: #6b7280; margin-top: 30px; text-align: center;">Please review the application promptly.<br/>GOorganic System</p>
                            </div>
                        </div>
                    `
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
                select: 'orderNumber shippingAddress customer phoneNumber paymentMethod',
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
        const subOrder = await SubOrder.findById(req.params.id).populate({
            path: 'order',
            populate: { path: 'customer', select: 'name email' }
        });

        if (!subOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (subOrder.vendor.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to update this order' });
        }

        // Validate status transitions
        const validTransitions = {
            'Pending': ['Processing', 'Cancelled'],
            'Processing': ['Shipped', 'Cancelled'],
            'Shipped': ['Delivered'],
            'Delivered': [],
            'Cancelled': []
        };

        if (!validTransitions[subOrder.orderStatus].includes(status)) {
            return res.status(400).json({ message: `Cannot change status from ${subOrder.orderStatus} to ${status}` });
        }

        subOrder.orderStatus = status;
        if (status === 'Delivered') {
            subOrder.deliveredAt = Date.now();

            const vendor = await User.findById(req.user._id);
            const isFeatured = vendor && vendor.subscription && vendor.subscription.plan === 'paid' && vendor.subscription.status === 'active';
            const pointsEarned = Math.floor(subOrder.subTotal / 100) + (isFeatured ? 20 : 0);

            if (pointsEarned > 0 && subOrder.order.customer) {
                const customer = await User.findById(subOrder.order.customer._id);
                if (customer) {
                    customer.loyaltyPoints = (customer.loyaltyPoints || 0) + pointsEarned;
                    await customer.save();
                    
                    await LoyaltyTransaction.create({
                        user: customer._id,
                        points: pointsEarned,
                        type: 'earned',
                        reason: isFeatured ? 'Order Purchase (Featured Vendor Bonus)' : 'Order Purchase',
                        orderId: subOrder.order._id
                    });
                    
                    await Order.findByIdAndUpdate(subOrder.order._id, {
                        $inc: { pointsEarned: pointsEarned }
                    });
                }
            }

            // Check if all sub-orders for this parent order are delivered
            const allSubOrders = await SubOrder.find({ order: subOrder.order._id });
            const allDelivered = allSubOrders.every(so =>
                so._id.toString() === subOrder._id.toString() ? true : so.orderStatus === 'Delivered'
            );

            // If all sub-orders are delivered, mark parent order payment as completed (for COD)
            if (allDelivered) {
                await Order.findByIdAndUpdate(subOrder.order._id, {
                    paymentStatus: 'Completed'
                });
            }
        }
        await subOrder.save();

        try {
            const customer = subOrder.order.customer;
            if (customer) {
                const statusEmoji = status === 'Shipped' ? '🚚' : status === 'Delivered' ? '✅' : '📦';
                const itemsList = subOrder.items.map(item => `• ${item.name} x${item.quantity}`).join('\n');

                // Create in-app notification for customer
                await createNotification({
                    userId: customer._id,
                    type: 'order',
                    title: `Order ${status}`,
                    message: `Your order from ${req.user.shopName || req.user.name} has been ${status.toLowerCase()}`,
                    link: '/orders',
                    metadata: { orderId: subOrder.order._id, status, subTotal: subOrder.subTotal }
                });

                await sendEmail({
                    email: customer.email,
                    subject: `${statusEmoji} Order Update: ${status} - GOorganic`,
                    message: `Hi ${customer.name},\n\nGreat news! Your order status has been updated to: ${status}\n\nVendor: ${req.user.shopName || req.user.name}\n\nItems:\n${itemsList}\n\nOrder Total: Rs. ${subOrder.subTotal.toLocaleString()}\n\n${status === 'Delivered' ? 'You have earned loyalty points for this purchase! You can also place a review for this order for an extra 5 points!' : ''}\n\nYou can view full order details in your dashboard.\n\nThank you for shopping with GOorganic!`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
                            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                <h2 style="color: #2d6a4f; margin-top: 0;">${statusEmoji} Order Status Updated!</h2>
                                <p style="font-size: 16px; color: #374151;">Hi ${customer.name},</p>
                                <p style="font-size: 16px; color: #374151;">Great news! Your order status has been updated to:</p>
                                <div style="background-color: #d1fae5; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
                                    <h3 style="color: #065f46; margin: 0; font-size: 24px;">${status}</h3>
                                </div>
                                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                    <p style="margin: 5px 0; color: #6b7280;"><strong>Vendor:</strong> ${req.user.shopName || req.user.name}</p>
                                    <p style="margin: 5px 0; color: #6b7280;"><strong>Order Total:</strong> Rs. ${subOrder.subTotal.toLocaleString()}</p>
                                </div>
                                <div style="margin: 20px 0;">
                                    <h4 style="color: #374151;">Items in this order:</h4>
                                    <ul style="list-style: none; padding: 0;">
                                        ${subOrder.items.map(item => `<li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">• ${item.name} <strong>x${item.quantity}</strong></li>`).join('')}
                                    </ul>
                                </div>
                                ${status === 'Delivered' ? '<div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;"><p style="margin: 0; color: #1e40af; font-size: 14px;">🌟 <strong>Bonus:</strong> You have earned loyalty points for this purchase! You can also place a review for this order for an extra 5 points!</p></div>' : ''}
                                <p style="font-size: 14px; color: #6b7280; margin-top: 30px; text-align: center;">Thank you for shopping with GOorganic!</p>
                            </div>
                        </div>
                    `
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

// Accept order
export const acceptOrder = async (req, res) => {
    try {
        const subOrder = await SubOrder.findById(req.params.id).populate({
            path: 'order',
            populate: { path: 'customer', select: 'name email' }
        });

        if (!subOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (subOrder.vendor.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to accept this order' });
        }

        if (subOrder.orderStatus !== 'Pending') {
            return res.status(400).json({ message: 'Only pending orders can be accepted' });
        }

        subOrder.orderStatus = 'Processing';
        await subOrder.save();

        // Send email to customer
        try {
            const customer = subOrder.order.customer;
            if (customer) {
                const itemsList = subOrder.items.map(item => `• ${item.name} x${item.quantity}`).join('\n');

                // Create in-app notification
                await createNotification({
                    userId: customer._id,
                    type: 'order',
                    title: 'Order Accepted',
                    message: `Your order from ${req.user.shopName || req.user.name} has been accepted and is now being processed`,
                    link: '/orders',
                    metadata: { orderId: subOrder.order._id, subTotal: subOrder.subTotal }
                });

                await sendEmail({
                    email: customer.email,
                    subject: '✅ Order Accepted - GOorganic',
                    message: `Hi ${customer.name},\n\nGreat news! Your order has been accepted by ${req.user.shopName || req.user.name} and is now being processed.\n\nItems:\n${itemsList}\n\nOrder Total: Rs. ${subOrder.subTotal.toLocaleString()}\n\nYou can track your order status in your dashboard.\n\nThank you for shopping with GOorganic!`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
                            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                <h2 style="color: #2d6a4f; margin-top: 0;">✅ Order Accepted!</h2>
                                <p style="font-size: 16px; color: #374151;">Hi ${customer.name},</p>
                                <p style="font-size: 16px; color: #374151;">Great news! Your order has been <strong>accepted</strong> by ${req.user.shopName || req.user.name} and is now being processed.</p>
                                <div style="background-color: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2d6a4f;">
                                    <h3 style="color: #2d6a4f; margin-top: 0;">Order Summary</h3>
                                    <p style="margin: 5px 0; color: #374151; font-size: 18px;"><strong>Total: Rs. ${subOrder.subTotal.toLocaleString()}</strong></p>
                                </div>
                                <div style="margin: 20px 0;">
                                    <h4 style="color: #374151;">Items in your order:</h4>
                                    <ul style="list-style: none; padding: 0; background-color: #f9fafb; border-radius: 8px; padding: 15px;">
                                        ${subOrder.items.map(item => `
                                            <li style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between;">
                                                <span style="color: #374151;">• ${item.name} <strong>x${item.quantity}</strong></span>
                                                <span style="color: #2d6a4f; font-weight: bold;">Rs. ${(item.price * item.quantity).toLocaleString()}</span>
                                            </li>
                                        `).join('')}
                                    </ul>
                                </div>
                                <p style="font-size: 14px; color: #6b7280; margin-top: 30px; text-align: center;">You can track your order status in your dashboard.<br/>Thank you for shopping with GOorganic!</p>
                            </div>
                        </div>
                    `
                });
            }
        } catch (emailError) {
            console.error('Failed to send acceptance email to customer:', emailError);
        }

        res.status(200).json({ message: 'Order accepted successfully', subOrder });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Cancel order
export const cancelOrder = async (req, res) => {
    try {
        const { reason } = req.body;
        const subOrder = await SubOrder.findById(req.params.id).populate({
            path: 'order',
            populate: { path: 'customer', select: 'name email' }
        });

        if (!subOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (subOrder.vendor.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to cancel this order' });
        }

        if (subOrder.orderStatus !== 'Pending') {
            return res.status(400).json({ message: 'Only pending orders can be cancelled' });
        }

        subOrder.orderStatus = 'Cancelled';
        subOrder.cancellationReason = reason || 'No reason provided';
        await subOrder.save();

        // Restore stock for cancelled items
        try {
            for (const item of subOrder.items) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: item.quantity }
                });
            }
        } catch (stockError) {
            console.error('Failed to restore stock for cancelled order:', stockError);
        }

        // Send email to customer
        try {
            const customer = subOrder.order.customer;
            if (customer) {
                const itemsList = subOrder.items.map(item => `• ${item.name} x${item.quantity}`).join('\n');

                // Create in-app notification
                await createNotification({
                    userId: customer._id,
                    type: 'order',
                    title: 'Order Cancelled',
                    message: `Your order from ${req.user.shopName || req.user.name} has been cancelled`,
                    link: '/orders',
                    metadata: { orderId: subOrder.order._id, subTotal: subOrder.subTotal }
                });

                await sendEmail({
                    email: customer.email,
                    subject: '❌ Order Cancelled - GOorganic',
                    message: `Hi ${customer.name},\n\nWe regret to inform you that your order from ${req.user.shopName || req.user.name} has been cancelled.\n\nReason: ${reason || 'No reason provided'}\n\nItems:\n${itemsList}\n\nOrder Total: Rs. ${subOrder.subTotal.toLocaleString()}\n\nIf you have any questions, please contact us at goorganic.co.pk@gmail.com\n\nWe apologize for any inconvenience.`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
                            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                <h2 style="color: #dc2626; margin-top: 0;">❌ Order Cancelled</h2>
                                <p style="font-size: 16px; color: #374151;">Hi ${customer.name},</p>
                                <p style="font-size: 16px; color: #374151;">We regret to inform you that your order from <strong>${req.user.shopName || req.user.name}</strong> has been cancelled.</p>
                                <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                                    <h4 style="color: #991b1b; margin-top: 0;">Cancellation Reason:</h4>
                                    <p style="margin: 0; color: #374151;">${reason || 'No reason provided'}</p>
                                </div>
                                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                    <p style="margin: 5px 0; color: #6b7280;"><strong>Vendor:</strong> ${req.user.shopName || req.user.name}</p>
                                    <p style="margin: 5px 0; color: #6b7280;"><strong>Order Total:</strong> Rs. ${subOrder.subTotal.toLocaleString()}</p>
                                </div>
                                <div style="margin: 20px 0;">
                                    <h4 style="color: #374151;">Cancelled items:</h4>
                                    <ul style="list-style: none; padding: 0; background-color: #f9fafb; border-radius: 8px; padding: 15px;">
                                        ${subOrder.items.map(item => `<li style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">• ${item.name} <strong>x${item.quantity}</strong> - Rs. ${(item.price * item.quantity).toLocaleString()}</li>`).join('')}
                                    </ul>
                                </div>
                                <p style="font-size: 14px; color: #6b7280; margin-top: 30px; text-align: center;">If you have any questions, please contact us at goorganic.co.pk@gmail.com<br/>We apologize for any inconvenience.</p>
                            </div>
                        </div>
                    `
                });
            }
        } catch (emailError) {
            console.error('Failed to send cancellation email to customer:', emailError);
        }

        res.status(200).json({ message: 'Order cancelled successfully', subOrder });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
