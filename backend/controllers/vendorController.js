import { v2 as cloudinary } from 'cloudinary';
import sendEmail from '../utils/sendEmail.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import { SubscriptionPlan } from '../models/subscriptionPlanModel.js';
import { Order, SubOrder } from '../models/orderModel.js';

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

        subOrder.orderStatus = status;
        if (status === 'Delivered') {
            subOrder.deliveredAt = Date.now();

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

                await sendEmail({
                    email: customer.email,
                    subject: `${statusEmoji} Order Update: ${status} - GOorganic`,
                    message: `Hi ${customer.name},\n\nGreat news! Your order status has been updated to: ${status}\n\nVendor: ${req.user.businessName || req.user.name}\n\nItems:\n${itemsList}\n\nOrder Total: Rs. ${subOrder.subTotal.toLocaleString()}\n\nYou can view full order details in your dashboard.\n\nThank you for shopping with GOorganic!`,
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
                                    <p style="margin: 5px 0; color: #6b7280;"><strong>Vendor:</strong> ${req.user.businessName || req.user.name}</p>
                                    <p style="margin: 5px 0; color: #6b7280;"><strong>Order Total:</strong> Rs. ${subOrder.subTotal.toLocaleString()}</p>
                                </div>
                                <div style="margin: 20px 0;">
                                    <h4 style="color: #374151;">Items in this order:</h4>
                                    <ul style="list-style: none; padding: 0;">
                                        ${subOrder.items.map(item => `<li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">• ${item.name} <strong>x${item.quantity}</strong></li>`).join('')}
                                    </ul>
                                </div>
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

// Request subscription upgrade (notify admin)
export const requestSubscriptionUpgrade = async (req, res) => {
    try {
        const { planName } = req.body;
        const vendor = req.user;

        const plan = await SubscriptionPlan.findOne({ name: planName });
        if (!plan) {
            return res.status(404).json({ message: 'Plan not found' });
        }

        // Get admin emails
        const admins = await User.find({ roles: 'admin' }).select('email name');

        // Send email to all admins
        const emailPromises = admins.map(admin =>
            sendEmail({
                email: admin.email,
                subject: '💳 Vendor Subscription Upgrade Request - GOorganic',
                message: `Hi ${admin.name},\n\nA vendor has requested a subscription upgrade.\n\nVendor Details:\n- Name: ${vendor.name}\n- Shop: ${vendor.shopName || 'N/A'}\n- Email: ${vendor.email}\n- Current Plan: ${vendor.subscription?.plan || 'free'}\n\nRequested Plan:\n- Plan: ${plan.name.toUpperCase()}\n- Price: PKR ${plan.price}/month\n- Product Limit: ${plan.productLimit} products\n\nPlease log in to the admin dashboard to process this upgrade request.\n\nBest regards,\nGOorganic System`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
                        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <h2 style="color: #2d6a4f; margin-top: 0;">💳 Subscription Upgrade Request</h2>
                            <p style="font-size: 16px; color: #374151;">Hi ${admin.name},</p>
                            <p style="font-size: 16px; color: #374151;">A vendor has requested a subscription upgrade.</p>
                            <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2d6a4f;">
                                <h4 style="color: #065f46; margin-top: 0;">Vendor Details:</h4>
                                <p style="margin: 5px 0; color: #374151;"><strong>Name:</strong> ${vendor.name}</p>
                                <p style="margin: 5px 0; color: #374151;"><strong>Shop:</strong> ${vendor.shopName || 'N/A'}</p>
                                <p style="margin: 5px 0; color: #374151;"><strong>Email:</strong> ${vendor.email}</p>
                                <p style="margin: 5px 0; color: #374151;"><strong>Current Plan:</strong> ${(vendor.subscription?.plan || 'free').toUpperCase()}</p>
                            </div>
                            <div style="background-color: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <h4 style="color: #065f46; margin-top: 0;">Requested Plan:</h4>
                                <p style="margin: 5px 0; color: #374151;"><strong>Plan:</strong> ${plan.name.toUpperCase()}</p>
                                <p style="margin: 5px 0; color: #374151;"><strong>Price:</strong> PKR ${plan.price}/month</p>
                                <p style="margin: 5px 0; color: #374151;"><strong>Product Limit:</strong> ${plan.productLimit} products</p>
                            </div>
                            <p style="font-size: 14px; color: #6b7280;">Please log in to the admin dashboard to process this upgrade request.</p>
                            <p style="font-size: 14px; color: #6b7280; margin-top: 30px; text-align: center;">Best regards,<br/>GOorganic System</p>
                        </div>
                    </div>
                `
            })
        );

        await Promise.all(emailPromises);

        res.status(200).json({
            message: 'Your upgrade request has been sent to the administrator. You will be contacted soon.'
        });

    } catch (error) {
        console.error('Error sending upgrade request:', error);
        res.status(500).json({ message: 'Failed to send upgrade request' });
    }
};

// Cancel/Downgrade subscription to free plan
export const cancelSubscription = async (req, res) => {
    try {
        const vendor = await User.findById(req.user._id);

        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        const currentPlan = vendor.subscription?.plan || 'free';

        if (currentPlan === 'free') {
            return res.status(400).json({ message: 'You are already on the free plan' });
        }

        // Check if vendor has more products than free plan limit
        const freePlan = await SubscriptionPlan.findOne({ name: 'free' });
        const productCount = await Product.countDocuments({ vendor: vendor._id });

        if (productCount > freePlan.productLimit) {
            return res.status(400).json({
                message: `You have ${productCount} products. Please reduce to ${freePlan.productLimit} or fewer before downgrading to the free plan.`,
                productCount,
                maxAllowed: freePlan.productLimit
            });
        }

        // Downgrade to free plan
        const previousPlan = vendor.subscription.plan;
        vendor.subscription.plan = 'free';
        vendor.subscription.status = 'active';
        vendor.subscription.endDate = null;

        await vendor.save();

        // Get admin emails to notify
        const admins = await User.find({ roles: 'admin' }).select('email name');

        // Send notification to admins
        const emailPromises = admins.map(admin =>
            sendEmail({
                email: admin.email,
                subject: '❌ Vendor Subscription Cancelled - GOorganic',
                message: `Hi ${admin.name},\n\nA vendor has cancelled their subscription.\n\nVendor Details:\n- Name: ${vendor.name}\n- Shop: ${vendor.shopName || 'N/A'}\n- Email: ${vendor.email}\n- Previous Plan: ${previousPlan.toUpperCase()}\n- New Plan: FREE\n\nThis is for your information.\n\nBest regards,\nGOorganic System`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
                        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <h2 style="color: #dc2626; margin-top: 0;">❌ Subscription Cancelled</h2>
                            <p style="font-size: 16px; color: #374151;">Hi ${admin.name},</p>
                            <p style="font-size: 16px; color: #374151;">A vendor has cancelled their subscription.</p>
                            <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                                <h4 style="color: #991b1b; margin-top: 0;">Vendor Details:</h4>
                                <p style="margin: 5px 0; color: #374151;"><strong>Name:</strong> ${vendor.name}</p>
                                <p style="margin: 5px 0; color: #374151;"><strong>Shop:</strong> ${vendor.shopName || 'N/A'}</p>
                                <p style="margin: 5px 0; color: #374151;"><strong>Email:</strong> ${vendor.email}</p>
                                <p style="margin: 5px 0; color: #374151;"><strong>Previous Plan:</strong> ${previousPlan.toUpperCase()}</p>
                                <p style="margin: 5px 0; color: #374151;"><strong>New Plan:</strong> FREE</p>
                            </div>
                            <p style="font-size: 14px; color: #6b7280;">This is for your information.</p>
                            <p style="font-size: 14px; color: #6b7280; margin-top: 30px; text-align: center;">Best regards,<br/>GOorganic System</p>
                        </div>
                    </div>
                `
            })
        );

        await Promise.all(emailPromises);

        res.status(200).json({
            message: 'Your subscription has been cancelled. You are now on the free plan.',
            plan: 'free'
        });

    } catch (error) {
        console.error('Error cancelling subscription:', error);
        res.status(500).json({ message: 'Failed to cancel subscription' });
    }
};